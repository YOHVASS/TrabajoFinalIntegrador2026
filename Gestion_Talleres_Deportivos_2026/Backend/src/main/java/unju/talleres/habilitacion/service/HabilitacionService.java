package unju.talleres.habilitacion.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.alertas.service.AlertaService;
import unju.talleres.aptomedico.model.AptoMedico;
import unju.talleres.aptomedico.repository.AptoMedicoRepository;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.util.Fechas;
import unju.talleres.documentacion.model.Documentacion;
import unju.talleres.documentacion.model.TipoDocumento;
import unju.talleres.documentacion.repository.DocumentacionRepository;
import unju.talleres.documentacion.repository.TipoDocumentoRepository;
import unju.talleres.habilitacion.dto.HabilitacionResponse;
import unju.talleres.habilitacion.service.EvaluadorHabilitacion.Evaluacion;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.repository.ParticipanteRepository;
import unju.talleres.preinscripcion.model.EstadoInscripcion;
import unju.talleres.preinscripcion.repository.InscripcionRepository;
import unju.talleres.seguro.model.Seguro;
import unju.talleres.seguro.repository.SeguroRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Módulo Habilitación (RF-08). Mantiene actualizados los datos derivados
 * (Participante.estado_habilitacion y los estados de Documentacion, Seguro y AptoMedico)
 * y dispara la sincronización de alertas (RF-09).
 * <p>
 * Se invoca de forma inmediata cada vez que se carga o modifica documentación, seguro o apto,
 * y en forma masiva desde la tarea programada diaria ({@link TareaVencimientos}).
 */
@Service
public class HabilitacionService {

    private static final Logger log = LoggerFactory.getLogger(HabilitacionService.class);

    private final ParticipanteRepository participantes;
    private final TipoDocumentoRepository tiposDocumento;
    private final DocumentacionRepository documentaciones;
    private final SeguroRepository seguros;
    private final AptoMedicoRepository aptos;
    private final InscripcionRepository inscripciones;
    private final AlertaService alertaService;
    private final Fechas fechas;

    public HabilitacionService(ParticipanteRepository participantes, TipoDocumentoRepository tiposDocumento,
                               DocumentacionRepository documentaciones, SeguroRepository seguros,
                               AptoMedicoRepository aptos, InscripcionRepository inscripciones,
                               AlertaService alertaService, Fechas fechas) {
        this.participantes = participantes;
        this.tiposDocumento = tiposDocumento;
        this.documentaciones = documentaciones;
        this.seguros = seguros;
        this.aptos = aptos;
        this.inscripciones = inscripciones;
        this.alertaService = alertaService;
        this.fechas = fechas;
    }

    /** Recalcula y guarda el estado de un participante. Devuelve la evaluación. */
    @Transactional
    public Evaluacion recalcular(Participante p) {
        return recalcular(p, tiposDocumento.findByObligatorioTrue(), fechas.hoy());
    }

    @Transactional
    public Evaluacion recalcular(Long idParticipante) {
        return recalcular(buscar(idParticipante));
    }

    private Evaluacion recalcular(Participante p, List<TipoDocumento> obligatorios, LocalDate hoy) {
        List<Documentacion> docs = documentaciones.findByParticipanteIdOrderByFechaPresentacionDesc(p.getId());
        List<Seguro> segs = seguros.findByParticipanteIdOrderByVigenciaDesdeDesc(p.getId());
        List<AptoMedico> aps = aptos.findByParticipanteIdOrderByFechaEmisionDesc(p.getId());

        // Estados derivados de cada registro
        docs.forEach(d -> d.setEstado(d.calcularEstado(hoy)));
        segs.forEach(s -> s.setEstado(s.calcularEstado(hoy)));
        aps.forEach(a -> a.setEstado(a.calcularEstado(hoy)));

        Evaluacion ev = EvaluadorHabilitacion.evaluar(obligatorios, docs, segs, aps, hoy);
        p.setEstadoHabilitacion(ev.estado());

        boolean participaActivamente = inscripciones.existsByParticipanteIdAndEstado(p.getId(), EstadoInscripcion.ACTIVA);
        alertaService.sincronizar(p, ev, participaActivamente, hoy);
        return ev;
    }

    /** Recalcula todos los participantes (tarea diaria y arranque). */
    @Transactional
    public int recalcularTodos() {
        LocalDate hoy = fechas.hoy();
        int docs = documentaciones.marcarVencidos(hoy);
        int segs = seguros.marcarVencidos(hoy);
        int aps = aptos.marcarVencidos(hoy);
        List<TipoDocumento> obligatorios = tiposDocumento.findByObligatorioTrue();
        List<Participante> todos = participantes.findAll();
        todos.forEach(p -> recalcular(p, obligatorios, hoy));
        log.info("Recalculo de habilitación: {} participantes; vencidos hoy -> documentos {}, seguros {}, aptos {}",
                todos.size(), docs, segs, aps);
        return todos.size();
    }

    /** Detalle para la pantalla del participante (recalcula en el momento). */
    @Transactional
    public HabilitacionResponse detalle(Long idParticipante) {
        Participante p = buscar(idParticipante);
        Evaluacion ev = recalcular(p);
        return new HabilitacionResponse(
                p.getId(), p.getDni(), p.getNombre(), p.getApellido(), ev.estado(), ev.documentacionCompleta(),
                ev.documentos().stream().map(d -> new HabilitacionResponse.DocumentoRequerido(
                        d.tipo().getId(), d.tipo().getNombre(), d.situacion(), d.fechaVencimiento())).toList(),
                ev.seguro(),
                ev.seguroVigente() != null ? ev.seguroVigente().getVigenciaHasta()
                        : (ev.ultimoSeguro() != null ? ev.ultimoSeguro().getVigenciaHasta() : null),
                ev.aptoMedico(),
                ev.aptoVigente() != null ? ev.aptoVigente().getFechaVencimiento()
                        : (ev.ultimoApto() != null ? ev.ultimoApto().getFechaVencimiento() : null),
                ev.motivos());
    }

    private Participante buscar(Long id) {
        return participantes.findById(id).orElseThrow(() -> new NoEncontradoException("Participante", id));
    }
}
