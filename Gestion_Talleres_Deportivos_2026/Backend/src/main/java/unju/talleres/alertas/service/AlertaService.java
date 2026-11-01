package unju.talleres.alertas.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.alertas.dto.AlertaResponse;
import unju.talleres.alertas.model.Alerta;
import unju.talleres.alertas.model.EstadoAlerta;
import unju.talleres.alertas.model.TipoAlerta;
import unju.talleres.alertas.repository.AlertaRepository;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.util.Fechas;
import unju.talleres.habilitacion.service.EvaluadorHabilitacion.Evaluacion;
import unju.talleres.habilitacion.service.EvaluadorHabilitacion.ResultadoDocumento;
import unju.talleres.habilitacion.service.EvaluadorHabilitacion.Situacion;
import unju.talleres.participantes.model.Participante;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Módulo Alertas (RF-09). Las alertas se generan y se resuelven solas a partir de la
 * evaluación de habilitación: si la condición desaparece (por ejemplo, se carga un apto nuevo),
 * la alerta pasa a RESUELTA. Solo se generan alertas nuevas para participantes con al menos
 * una inscripción ACTIVA, que son quienes necesitan estar habilitados.
 * <p>
 * Como el CHECK de Alerta.tipo no tiene un valor para "apto médico vencido" ni para "seguro faltante",
 * esos casos se informan como DOCUMENTACION_VENCIDA / DOCUMENTACION_PENDIENTE con un mensaje explícito.
 */
@Service
public class AlertaService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final AlertaRepository alertas;
    private final Fechas fechas;
    private final int diasAnticipacion;

    public AlertaService(AlertaRepository alertas, Fechas fechas,
                         @Value("${app.alertas.dias-anticipacion:30}") int diasAnticipacion) {
        this.alertas = alertas;
        this.fechas = fechas;
        this.diasAnticipacion = diasAnticipacion;
    }

    private record Clave(TipoAlerta tipo, String mensaje) {
    }

    @Transactional
    public void sincronizar(Participante p, Evaluacion ev, boolean generarNuevas, LocalDate hoy) {
        Set<Clave> deseadas = generarNuevas ? alertasEsperadas(ev, hoy) : Set.of();
        List<Alerta> activas = alertas.findByParticipanteIdAndEstado(p.getId(), EstadoAlerta.ACTIVA);

        Set<Clave> existentes = new HashSet<>();
        for (Alerta a : activas) {
            Clave c = new Clave(a.getTipo(), a.getMensaje());
            if (deseadas.contains(c) && existentes.add(c)) {
                continue; // sigue vigente
            }
            a.setEstado(EstadoAlerta.RESUELTA); // la condición desapareció (o duplicada)
        }
        for (Clave c : deseadas) {
            if (!existentes.contains(c)) {
                Alerta a = new Alerta();
                a.setParticipante(p);
                a.setTipo(c.tipo());
                a.setMensaje(c.mensaje());
                a.setFechaGenerada(fechas.ahora());
                a.setEstado(EstadoAlerta.ACTIVA);
                alertas.save(a);
            }
        }
    }

    private Set<Clave> alertasEsperadas(Evaluacion ev, LocalDate hoy) {
        Set<Clave> r = new LinkedHashSet<>();
        LocalDate limite = hoy.plusDays(diasAnticipacion);

        for (ResultadoDocumento d : ev.documentos()) {
            if (d.situacion() == Situacion.FALTA) {
                r.add(new Clave(TipoAlerta.DOCUMENTACION_PENDIENTE, "Falta presentar: " + d.tipo().getNombre()));
            } else if (d.situacion() == Situacion.VENCIDO) {
                r.add(new Clave(TipoAlerta.DOCUMENTACION_VENCIDA, "Documento vencido: " + d.tipo().getNombre()
                        + (d.fechaVencimiento() != null ? " (venció el " + FMT.format(d.fechaVencimiento()) + ")" : "")));
            }
        }

        switch (ev.seguro()) {
            case FALTA -> r.add(new Clave(TipoAlerta.DOCUMENTACION_PENDIENTE, "Falta registrar el pago del seguro anual"));
            case VENCIDO -> r.add(new Clave(TipoAlerta.SEGURO_VENCIDO, "El seguro anual venció el "
                    + FMT.format(ev.ultimoSeguro().getVigenciaHasta())));
            case CUMPLE -> {
                LocalDate hasta = ev.seguroVigente().getVigenciaHasta();
                if (!hasta.isAfter(limite)) {
                    r.add(new Clave(TipoAlerta.SEGURO_PROXIMO_A_VENCER, "El seguro anual vence el " + FMT.format(hasta)));
                }
            }
        }

        switch (ev.aptoMedico()) {
            case FALTA -> r.add(new Clave(TipoAlerta.DOCUMENTACION_PENDIENTE, "Falta presentar el apto médico"));
            case VENCIDO -> r.add(new Clave(TipoAlerta.DOCUMENTACION_VENCIDA, "Apto médico vencido el "
                    + FMT.format(ev.ultimoApto().getFechaVencimiento())));
            case CUMPLE -> {
                LocalDate vto = ev.aptoVigente().getFechaVencimiento();
                if (!vto.isAfter(limite)) {
                    r.add(new Clave(TipoAlerta.APTO_MEDICO_POR_VENCER, "El apto médico vence el " + FMT.format(vto)));
                }
            }
        }
        return r;
    }

    // ------------------------------------------------------------ Consultas

    @Transactional(readOnly = true)
    public PaginaResponse<AlertaResponse> buscar(EstadoAlerta estado, TipoAlerta tipo, Long idParticipante,
                                                 int pagina, int tamanio) {
        var page = alertas.buscar(estado, tipo, idParticipante,
                PageRequest.of(pagina, tamanio, Sort.by(Sort.Direction.DESC, "fechaGenerada")));
        return PaginaResponse.de(page, AlertaResponse::de);
    }

    @Transactional(readOnly = true)
    public List<AlertaResponse> delParticipante(Long idParticipante) {
        return alertas.findByParticipanteIdOrderByFechaGeneradaDesc(idParticipante).stream()
                .map(AlertaResponse::de).toList();
    }

    /**
     * Marca manualmente una alerta como resuelta (por ejemplo, ya se contactó al participante).
     * Si la condición sigue vigente, el próximo recálculo la vuelve a generar.
     */
    @Transactional
    public AlertaResponse resolver(Long id) {
        Alerta a = alertas.findById(id).orElseThrow(() -> new NoEncontradoException("Alerta", id));
        a.setEstado(EstadoAlerta.RESUELTA);
        return AlertaResponse.de(a);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> contador() {
        return Map.of("activas", alertas.countByEstado(EstadoAlerta.ACTIVA));
    }
}
