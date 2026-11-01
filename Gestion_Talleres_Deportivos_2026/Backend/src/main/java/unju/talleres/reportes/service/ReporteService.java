package unju.talleres.reportes.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.DataClassRowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.common.util.Fechas;
import unju.talleres.reportes.dto.Reportes.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Módulo Reportes e indicadores (RF-16). Consultas SQL de agregación directamente sobre PostgreSQL.
 * Los filtros opcionales se resuelven con "CAST(:param AS tipo) IS NULL OR ...".
 */
@Service
@Transactional(readOnly = true)
public class ReporteService {

    private static final String ACTIVA_EXISTS =
            "EXISTS (SELECT 1 FROM inscripcion i WHERE i.id_participante = p.id_participante AND i.estado = 'ACTIVA')";
    private static final String FILTRO_PERIODO =
            "(CAST(:idPeriodo AS bigint) IS NULL OR t.id_periodo = CAST(:idPeriodo AS bigint))";

    private final NamedParameterJdbcTemplate jdbc;
    private final Fechas fechas;
    private final String zona;
    private final int diasAnticipacion;

    public ReporteService(NamedParameterJdbcTemplate jdbc, Fechas fechas,
                          @Value("${app.zona-horaria:America/Argentina/Jujuy}") String zona,
                          @Value("${app.alertas.dias-anticipacion:30}") int diasAnticipacion) {
        this.jdbc = jdbc;
        this.fechas = fechas;
        this.zona = zona;
        this.diasAnticipacion = diasAnticipacion;
    }

    private MapSqlParameterSource params(Long idPeriodo) {
        return new MapSqlParameterSource()
                .addValue("idPeriodo", idPeriodo)
                .addValue("hoy", fechas.hoy())
                .addValue("dias", diasAnticipacion);
    }

    public Resumen resumen(Long idPeriodo) {
        String sql = """
                SELECT
                  (SELECT count(DISTINCT i.id_participante) FROM inscripcion i JOIN taller t ON t.id_taller = i.id_taller
                     WHERE i.estado = 'ACTIVA' AND %2$s) AS participantes_activos,
                  (SELECT count(*) FROM participante p WHERE p.estado_habilitacion = 'HABILITADO' AND %1$s) AS habilitados,
                  (SELECT count(*) FROM participante p WHERE p.estado_habilitacion = 'NO_HABILITADO' AND %1$s) AS no_habilitados,
                  (SELECT count(*) FROM participante p WHERE p.estado_habilitacion = 'PENDIENTE' AND %1$s) AS con_requisitos_pendientes,
                  (SELECT count(*) FROM inscripcion i JOIN taller t ON t.id_taller = i.id_taller
                     WHERE i.estado = 'ACTIVA' AND %2$s) AS inscripciones_activas,
                  (SELECT count(*) FROM preinscripcion p JOIN taller t ON t.id_taller = p.id_taller
                     WHERE p.estado = 'PENDIENTE' AND %2$s) AS preinscripciones_pendientes,
                  (SELECT count(*) FROM preinscripcion p JOIN taller t ON t.id_taller = p.id_taller
                     WHERE p.estado = 'LISTA_ESPERA' AND %2$s) AS en_lista_espera,
                  (SELECT count(*) FROM asistencia a WHERE a.resultado_habilitacion = 'HABILITADO'
                     AND a.fecha > CAST(:hoy AS date) - 30) AS asistencias_ultimos30_dias,
                  (SELECT count(*) FROM asistencia a WHERE a.resultado_habilitacion = 'RECHAZADO'
                     AND a.fecha > CAST(:hoy AS date) - 30) AS ingresos_rechazados_ultimos30_dias,
                  (SELECT count(*) FROM (
                       SELECT a.id_participante FROM apto_medico a
                       WHERE EXISTS (SELECT 1 FROM inscripcion i WHERE i.id_participante = a.id_participante AND i.estado = 'ACTIVA')
                       GROUP BY a.id_participante
                       HAVING max(a.fecha_vencimiento) BETWEEN CAST(:hoy AS date) AND CAST(:hoy AS date) + CAST(:dias AS int)
                   ) x) AS aptos_por_vencer,
                  (SELECT count(*) FROM alerta WHERE estado = 'ACTIVA') AS alertas_activas
                """.formatted(ACTIVA_EXISTS, FILTRO_PERIODO);
        return jdbc.queryForObject(sql, params(idPeriodo), new DataClassRowMapper<>(Resumen.class));
    }

    public List<PorTaller> porTaller(Long idPeriodo) {
        String sql = """
                SELECT t.id_taller, t.nombre AS taller, d.nombre AS disciplina, t.modalidad, pe.codigo AS periodo,
                       t.cupo_maximo,
                       (SELECT count(*) FROM inscripcion i WHERE i.id_taller = t.id_taller AND i.estado = 'ACTIVA') AS inscriptos_activos,
                       (SELECT count(*) FROM preinscripcion p WHERE p.id_taller = t.id_taller AND p.estado = 'PENDIENTE') AS pendientes_revision,
                       (SELECT count(*) FROM preinscripcion p WHERE p.id_taller = t.id_taller AND p.estado = 'LISTA_ESPERA') AS en_lista_espera
                FROM taller t
                JOIN disciplina d ON d.id_disciplina = t.id_disciplina
                JOIN periodo pe ON pe.id_periodo = t.id_periodo
                WHERE %s
                ORDER BY d.nombre, t.nombre
                """.formatted(FILTRO_PERIODO);
        return jdbc.query(sql, params(idPeriodo), new DataClassRowMapper<>(PorTaller.class));
    }

    public List<PorDisciplina> porDisciplina(Long idPeriodo) {
        String sql = """
                SELECT d.nombre AS disciplina,
                       count(DISTINCT i.id_participante) AS participantes,
                       count(i.id_inscripcion) AS inscripciones
                FROM disciplina d
                LEFT JOIN taller t ON t.id_disciplina = d.id_disciplina AND %s
                LEFT JOIN inscripcion i ON i.id_taller = t.id_taller AND i.estado = 'ACTIVA'
                GROUP BY d.nombre
                ORDER BY participantes DESC, d.nombre
                """.formatted(FILTRO_PERIODO);
        return jdbc.query(sql, params(idPeriodo), new DataClassRowMapper<>(PorDisciplina.class));
    }

    public List<PorCategoria> porFacultad(Long idPeriodo) {
        return porCategoria("COALESCE(NULLIF(trim(p.facultad), ''), 'Sin facultad')", idPeriodo);
    }

    public List<PorCategoria> porSexo(Long idPeriodo) {
        return porCategoria("p.sexo", idPeriodo);
    }

    private List<PorCategoria> porCategoria(String expresion, Long idPeriodo) {
        String sql = """
                SELECT %s AS categoria, count(DISTINCT p.id_participante) AS participantes
                FROM participante p
                JOIN inscripcion i ON i.id_participante = p.id_participante AND i.estado = 'ACTIVA'
                JOIN taller t ON t.id_taller = i.id_taller
                WHERE %s
                GROUP BY 1
                ORDER BY participantes DESC, categoria
                """.formatted(expresion, FILTRO_PERIODO);
        return jdbc.query(sql, params(idPeriodo), new DataClassRowMapper<>(PorCategoria.class));
    }

    /** Preinscripciones e inscripciones por mes entre dos fechas (por defecto, últimos 12 meses). */
    public List<EvolucionMensual> evolucion(LocalDate desde, LocalDate hasta) {
        LocalDate h = hasta != null ? hasta : fechas.hoy();
        LocalDate d = desde != null ? desde : h.minusMonths(11).withDayOfMonth(1);
        String sql = """
                SELECT to_char(m.mes, 'YYYY-MM') AS mes,
                  (SELECT count(*) FROM preinscripcion p
                     WHERE date_trunc('month', p.fecha_solicitud AT TIME ZONE :zona) = m.mes) AS preinscripciones,
                  (SELECT count(*) FROM inscripcion i WHERE date_trunc('month', i.fecha_inscripcion) = m.mes) AS inscripciones
                FROM generate_series(date_trunc('month', CAST(:desde AS timestamp)),
                                     date_trunc('month', CAST(:hasta AS timestamp)), interval '1 month') AS m(mes)
                ORDER BY m.mes
                """;
        var p = new MapSqlParameterSource().addValue("desde", d).addValue("hasta", h).addValue("zona", zona);
        return jdbc.query(sql, p, new DataClassRowMapper<>(EvolucionMensual.class));
    }

    /** Asistencia por taller en un rango de fechas (por defecto, últimos 30 días). */
    public List<AsistenciaPorTaller> asistencia(Long idPeriodo, LocalDate desde, LocalDate hasta) {
        LocalDate h = hasta != null ? hasta : fechas.hoy();
        LocalDate d = desde != null ? desde : h.minusDays(30);
        String sql = """
                SELECT t.id_taller, t.nombre AS taller,
                  count(a.id_asistencia) FILTER (WHERE a.resultado_habilitacion = 'HABILITADO') AS habilitados,
                  count(a.id_asistencia) FILTER (WHERE a.resultado_habilitacion = 'RECHAZADO') AS rechazados,
                  count(DISTINCT a.id_participante) FILTER (WHERE a.resultado_habilitacion = 'HABILITADO') AS participantes_distintos,
                  count(DISTINCT a.fecha) AS dias_con_registro
                FROM taller t
                LEFT JOIN asistencia a ON a.id_taller = t.id_taller
                     AND a.fecha BETWEEN CAST(:desde AS date) AND CAST(:hasta AS date)
                WHERE %s
                GROUP BY t.id_taller, t.nombre
                ORDER BY t.nombre
                """.formatted(FILTRO_PERIODO);
        var p = params(idPeriodo).addValue("desde", d).addValue("hasta", h);
        return jdbc.query(sql, p, new DataClassRowMapper<>(AsistenciaPorTaller.class));
    }

    // ------------------------------------------------------------ Nominales (solo gestión)

    public List<AptoPorVencerDetalle> aptosPorVencer(Integer dias) {
        String sql = """
                SELECT p.id_participante, p.dni, p.nombre, p.apellido, max(a.fecha_vencimiento) AS fecha_vencimiento
                FROM participante p
                JOIN apto_medico a ON a.id_participante = p.id_participante
                WHERE %s
                GROUP BY p.id_participante, p.dni, p.nombre, p.apellido
                HAVING max(a.fecha_vencimiento) BETWEEN CAST(:hoy AS date) AND CAST(:hoy AS date) + CAST(:dias AS int)
                ORDER BY fecha_vencimiento, p.apellido
                """.formatted(ACTIVA_EXISTS);
        var p = params(null).addValue("dias", dias != null ? dias : diasAnticipacion);
        return jdbc.query(sql, p, new DataClassRowMapper<>(AptoPorVencerDetalle.class));
    }

    public List<DocumentacionPendienteDetalle> documentacionPendiente() {
        String sql = """
                SELECT p.id_participante, p.dni, p.nombre, p.apellido, p.estado_habilitacion,
                       string_agg(al.mensaje, ' | ' ORDER BY al.mensaje) AS pendientes
                FROM participante p
                LEFT JOIN alerta al ON al.id_participante = p.id_participante AND al.estado = 'ACTIVA'
                WHERE p.estado_habilitacion <> 'HABILITADO' AND %s
                GROUP BY p.id_participante, p.dni, p.nombre, p.apellido, p.estado_habilitacion
                ORDER BY p.apellido, p.nombre
                """.formatted(ACTIVA_EXISTS);
        return jdbc.query(sql, params(null), new DataClassRowMapper<>(DocumentacionPendienteDetalle.class));
    }
}
