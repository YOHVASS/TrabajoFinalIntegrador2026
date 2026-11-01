package unju.talleres.ingreso.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.auth.model.RolNombre;
import unju.talleres.auth.repository.UsuarioSistemaRepository;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.security.UsuarioActual;
import unju.talleres.common.security.UsuarioPrincipal;
import unju.talleres.common.util.Fechas;
import unju.talleres.habilitacion.service.HabilitacionService;
import unju.talleres.ingreso.dto.AsistenciaResponse;
import unju.talleres.ingreso.dto.IngresoRequest;
import unju.talleres.ingreso.dto.IngresoResponse;
import unju.talleres.ingreso.model.Asistencia;
import unju.talleres.ingreso.model.MetodoVerificacion;
import unju.talleres.ingreso.model.ResultadoHabilitacion;
import unju.talleres.ingreso.repository.AsistenciaRepository;
import unju.talleres.oferta.dto.TallerResponse;
import unju.talleres.oferta.model.Taller;
import unju.talleres.oferta.repository.TallerRepository;
import unju.talleres.oferta.service.TallerService;
import unju.talleres.participantes.dto.ParticipanteResumen;
import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.repository.ParticipanteRepository;
import unju.talleres.preinscripcion.model.EstadoInscripcion;
import unju.talleres.preinscripcion.repository.InscripcionRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Módulo Control de ingreso y asistencia (RF-10, RF-11, RF-12, RN-06, RN-07).
 * La verificación lee la columna derivada Participante.estado_habilitacion (RNF-09): una consulta
 * por clave única. Solo si no está habilitado se recalcula para informar el motivo.
 */
@Service
public class IngresoService {

    private final ParticipanteRepository participantes;
    private final TallerRepository talleres;
    private final TallerService tallerService;
    private final InscripcionRepository inscripciones;
    private final AsistenciaRepository asistencias;
    private final UsuarioSistemaRepository usuarios;
    private final HabilitacionService habilitacionService;
    private final UsuarioActual usuarioActual;
    private final Fechas fechas;

    public IngresoService(ParticipanteRepository participantes, TallerRepository talleres, TallerService tallerService,
                          InscripcionRepository inscripciones, AsistenciaRepository asistencias,
                          UsuarioSistemaRepository usuarios, HabilitacionService habilitacionService,
                          UsuarioActual usuarioActual, Fechas fechas) {
        this.participantes = participantes;
        this.talleres = talleres;
        this.tallerService = tallerService;
        this.inscripciones = inscripciones;
        this.asistencias = asistencias;
        this.usuarios = usuarios;
        this.habilitacionService = habilitacionService;
        this.usuarioActual = usuarioActual;
        this.fechas = fechas;
    }

    @Transactional
    public IngresoResponse registrarIngreso(IngresoRequest req) {
        UsuarioPrincipal usuario = usuarioActual.get();
        Taller taller = talleres.findById(req.idTaller())
                .orElseThrow(() -> new NoEncontradoException("Taller", req.idTaller()));
        validarAccesoTaller(usuario, taller.getId());

        // RF-10 / RN-07: identificación por QR o DNI
        String valor = req.valor().trim();
        Optional<Participante> encontrado = req.metodo() == MetodoVerificacion.QR
                ? participantes.findByQrCode(valor)
                : participantes.findByDni(valor);
        Participante p = encontrado.orElseThrow(() -> new NoEncontradoException(
                req.metodo() == MetodoVerificacion.QR ? "El código QR no corresponde a ningún participante"
                        : "No hay ningún participante con DNI " + valor));

        LocalDate hoy = fechas.hoy();
        LocalTime hora = fechas.horaActual();

        // Si ya ingresó habilitado hoy, no se duplica la asistencia.
        Optional<Asistencia> previa = asistencias.findFirstByParticipanteIdAndTallerIdAndFechaAndResultadoHabilitacion(
                p.getId(), taller.getId(), hoy, ResultadoHabilitacion.HABILITADO);
        if (previa.isPresent()) {
            Asistencia a = previa.get();

            return new IngresoResponse(
                    ResultadoHabilitacion.HABILITADO,
                    List.of(),
                    true,
                    a.getId(),
                    ParticipanteResumen.de(p),
                    taller.getId(),
                    taller.getNombre(),
                    hoy,
                    hora,
                    req.metodo()
            );
        }

        // RF-11 / RN-06: verificar la habilitación antes de registrar la asistencia
        List<String> motivos = new ArrayList<>();
        if (p.getEstadoHabilitacion() != EstadoHabilitacion.HABILITADO) {
            motivos.addAll(habilitacionService.recalcular(p).motivos());
        }
        if (!inscripciones.existsByParticipanteIdAndTallerIdAndEstado(p.getId(), taller.getId(), EstadoInscripcion.ACTIVA)) {
            motivos.add("No tiene una inscripción activa en este taller");
        }
        ResultadoHabilitacion resultado = (p.getEstadoHabilitacion() == EstadoHabilitacion.HABILITADO && motivos.isEmpty())
                ? ResultadoHabilitacion.HABILITADO : ResultadoHabilitacion.RECHAZADO;

        // RF-12: se registra la asistencia, también si fue rechazada
        Asistencia a = new Asistencia();
        a.setParticipante(p);
        a.setTaller(taller);
        a.setUsuarioRegistro(usuarios.getReferenceById(usuario.getId()));
        a.setFecha(hoy);
        a.setHoraIngreso(hora);
        a.setMetodoVerificacion(req.metodo());
        a.setResultadoHabilitacion(resultado);
        asistencias.save(a);

        return new IngresoResponse(resultado, motivos, false, a.getId(), ParticipanteResumen.de(p),
                taller.getId(), taller.getNombre(), hoy, hora, req.metodo());
    }

    /** Talleres que el usuario puede elegir en la pantalla de ingreso (períodos en curso). */
    @Transactional(readOnly = true)
    public List<TallerResponse> talleresParaIngreso() {
        UsuarioPrincipal u = usuarioActual.get();
        LocalDate hoy = fechas.hoy();
        List<Taller> lista = u.tieneRol(RolNombre.PROFESOR, RolNombre.AYUDANTE)
                ? talleres.delUsuarioDocente(u.getId())
                : talleres.ofertaVigente(hoy, null, null);
        return lista.stream().filter(t -> t.getPeriodo().incluye(hoy)).map(tallerService::aResponse).toList();
    }

    @Transactional(readOnly = true)
    public PaginaResponse<AsistenciaResponse> buscar(Long idTaller, Long idParticipante, ResultadoHabilitacion resultado,
                                                     LocalDate desde, LocalDate hasta, int pagina, int tamanio) {
        UsuarioPrincipal u = usuarioActual.get();
        if (u.tieneRol(RolNombre.PROFESOR, RolNombre.AYUDANTE, RolNombre.RESPONSABLE_INGRESO)) {
            if (idTaller == null) {
                throw new NegocioException(HttpStatus.BAD_REQUEST, "Indique el taller (idTaller)");
            }
            validarAccesoTaller(u, idTaller);
        }
        LocalDate h = hasta != null ? hasta : fechas.hoy();
        LocalDate d = desde != null ? desde : h.minusDays(30);
        var page = asistencias.buscar(idTaller, idParticipante, resultado, d, h,
                PageRequest.of(pagina, tamanio, Sort.by(Sort.Direction.DESC, "fecha", "horaIngreso")));
        return PaginaResponse.de(page, AsistenciaResponse::de);
    }

    private void validarAccesoTaller(UsuarioPrincipal u, Long idTaller) {
        if (u.tieneRol(RolNombre.PROFESOR, RolNombre.AYUDANTE) && !talleres.esDocenteDelTaller(idTaller, u.getId())) {
            throw new NegocioException(HttpStatus.FORBIDDEN, "Solo puede registrar o consultar los talleres a su cargo");
        }
    }
}
