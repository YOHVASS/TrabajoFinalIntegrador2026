package unju.talleres.preinscripcion.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.util.Fechas;
import unju.talleres.habilitacion.service.EvaluadorHabilitacion.Evaluacion;
import unju.talleres.habilitacion.service.HabilitacionService;
import unju.talleres.oferta.model.Modalidad;
import unju.talleres.oferta.model.Taller;
import unju.talleres.oferta.repository.TallerRepository;
import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.model.Sexo;
import unju.talleres.participantes.repository.ParticipanteRepository;
import unju.talleres.participantes.service.ParticipanteService;
import unju.talleres.preinscripcion.dto.*;
import unju.talleres.preinscripcion.model.EstadoInscripcion;
import unju.talleres.preinscripcion.model.EstadoPreinscripcion;
import unju.talleres.preinscripcion.model.Inscripcion;
import unju.talleres.preinscripcion.model.Preinscripcion;
import unju.talleres.preinscripcion.repository.InscripcionRepository;
import unju.talleres.preinscripcion.repository.PreinscripcionRepository;

import java.util.EnumSet;
import java.util.List;

/**
 * Módulo Preinscripciones e Inscripciones (RF-02, RF-03, RN-13).
 * Flujo: preinscripción online → (si no hay cupo) LISTA_ESPERA → revisión → APROBADA (crea Inscripcion)
 * o RECHAZADA. La baja de una inscripción libera un lugar y promueve la lista de espera.
 */
@Service
public class PreinscripcionService {

    private final PreinscripcionRepository preinscripciones;
    private final InscripcionRepository inscripciones;
    private final TallerRepository talleres;
    private final ParticipanteRepository participantes;
    private final ParticipanteService participanteService;
    private final HabilitacionService habilitacionService;
    private final CupoService cupoService;
    private final Fechas fechas;

    public PreinscripcionService(PreinscripcionRepository preinscripciones, InscripcionRepository inscripciones,
                                 TallerRepository talleres, ParticipanteRepository participantes,
                                 ParticipanteService participanteService, HabilitacionService habilitacionService,
                                 CupoService cupoService, Fechas fechas) {
        this.preinscripciones = preinscripciones;
        this.inscripciones = inscripciones;
        this.talleres = talleres;
        this.participantes = participantes;
        this.participanteService = participanteService;
        this.habilitacionService = habilitacionService;
        this.cupoService = cupoService;
        this.fechas = fechas;
    }

    // ------------------------------------------------------------ RF-02: portal público

    @Transactional
    public PreinscripcionPublicaResponse preinscribir(PreinscripcionPublicaRequest req) {
        Taller taller = talleres.findByIdParaActualizar(req.idTaller())
                .orElseThrow(() -> new NoEncontradoException("Taller", req.idTaller()));
        if (taller.getPeriodo().getFechaFin().isBefore(fechas.hoy())) {
            throw new NegocioException("El período del taller ya finalizó; no admite preinscripciones");
        }
        validarModalidad(taller.getModalidad(), req.sexo());

        // Si el DNI ya existe se asocia al participante existente (sección 6.5 del diseño).
        Participante p = participantes.findByDni(req.dni().trim()).orElseGet(() -> nuevoParticipante(req));

        if (preinscripciones.existsByParticipanteIdAndTallerIdAndEstadoIn(p.getId(), taller.getId(),
                EnumSet.of(EstadoPreinscripcion.PENDIENTE, EstadoPreinscripcion.LISTA_ESPERA))) {
            throw new NegocioException("Ya hay una preinscripción en curso para este taller con el DNI " + p.getDni());
        }
        if (inscripciones.existsByParticipanteIdAndTallerIdAndEstado(p.getId(), taller.getId(), EstadoInscripcion.ACTIVA)) {
            throw new NegocioException("El DNI " + p.getDni() + " ya está inscripto en este taller");
        }

        // RN-13: sin cupo, la preinscripción queda en lista de espera (no se rechaza).
        boolean hayCupo = cupoService.ocupacion(taller).hayCupo();
        Preinscripcion pr = new Preinscripcion();
        pr.setParticipante(p);
        pr.setTaller(taller);
        pr.setFechaSolicitud(fechas.ahora());
        pr.setEstado(hayCupo ? EstadoPreinscripcion.PENDIENTE : EstadoPreinscripcion.LISTA_ESPERA);
        preinscripciones.save(pr);
        return comprobante(pr);
    }

    /** Consulta pública del estado: requiere el número de preinscripción y el DNI. */
    @Transactional(readOnly = true)
    public PreinscripcionPublicaResponse consultarPublica(Long id, String dni) {
        Preinscripcion pr = preinscripciones.findById(id)
                .filter(x -> x.getParticipante().getDni().equals(dni == null ? "" : dni.trim()))
                .orElseThrow(() -> new NoEncontradoException("No existe una preinscripción con ese número y DNI"));
        return comprobante(pr);
    }

    private PreinscripcionPublicaResponse comprobante(Preinscripcion pr) {
        Integer posicion = null;
        String mensaje = switch (pr.getEstado()) {
            case PENDIENTE -> "Preinscripción recibida. Será revisada por la Coordinación de Talleres Deportivos.";
            case LISTA_ESPERA -> "El taller alcanzó su cupo. Quedaste en lista de espera y pasarás a revisión "
                    + "cuando se libere un lugar.";
            case APROBADA -> "Preinscripción aprobada. Acercá la documentación, el seguro anual y el apto médico "
                    + "para quedar habilitado/a.";
            case RECHAZADA -> "La preinscripción no fue aprobada. Consultá con la Coordinación.";
        };
        if (pr.getEstado() == EstadoPreinscripcion.LISTA_ESPERA) {
            List<Preinscripcion> espera = preinscripciones.findByTallerIdAndEstadoOrderByFechaSolicitudAscIdAsc(
                    pr.getTaller().getId(), EstadoPreinscripcion.LISTA_ESPERA);
            posicion = espera.indexOf(pr) + 1;
        }
        return new PreinscripcionPublicaResponse(pr.getId(), pr.getTaller().getNombre(), pr.getFechaSolicitud(),
                pr.getEstado(), posicion, mensaje);
    }

    private Participante nuevoParticipante(PreinscripcionPublicaRequest req) {
        Participante p = new Participante();
        p.setDni(req.dni().trim());
        p.setNombre(req.nombre().trim());
        p.setApellido(req.apellido().trim());
        p.setFechaNacimiento(req.fechaNacimiento());
        p.setSexo(req.sexo());
        p.setFacultad(req.facultad());
        p.setEmail(req.email().trim().toLowerCase());
        p.setTelefono(req.telefono());
        p.setEstadoHabilitacion(EstadoHabilitacion.PENDIENTE);
        p.setFechaAlta(fechas.ahora());
        return participantes.save(p);
    }

    /** RN-08: un taller FEMENINO no admite sexo MASCULINO y viceversa. MIXTA y sexo X no se restringen. */
    private void validarModalidad(Modalidad modalidad, Sexo sexo) {
        if ((modalidad == Modalidad.FEMENINA && sexo == Sexo.MASCULINO)
                || (modalidad == Modalidad.MASCULINA && sexo == Sexo.FEMENINO)) {
            throw new NegocioException(HttpStatus.BAD_REQUEST,
                    "La modalidad del taller (" + modalidad + ") no corresponde con el sexo indicado");
        }
    }

    // ------------------------------------------------------------ RF-03: revisión administrativa

    @Transactional(readOnly = true)
    public PaginaResponse<PreinscripcionResponse> buscar(EstadoPreinscripcion estado, Long idTaller, Long idPeriodo,
                                                         int pagina, int tamanio) {
        var page = preinscripciones.buscar(estado, idTaller, idPeriodo,
                PageRequest.of(pagina, tamanio, Sort.by("fechaSolicitud").ascending()));
        return PaginaResponse.de(page, PreinscripcionResponse::de);
    }

    @Transactional(readOnly = true)
    public PreinscripcionResponse obtener(Long id) {
        return PreinscripcionResponse.de(buscar(id));
    }

    @Transactional(readOnly = true)
    public List<PreinscripcionResponse> delParticipante(Long idParticipante) {
        return preinscripciones.findByParticipanteIdOrderByFechaSolicitudDesc(idParticipante).stream()
                .map(PreinscripcionResponse::de).toList();
    }

    @Transactional
    public AprobacionResponse aprobar(Long id) {
        Preinscripcion pr = buscar(id);
        talleres.findByIdParaActualizar(pr.getTaller().getId());
        if (pr.getEstado() == EstadoPreinscripcion.LISTA_ESPERA) {
            throw new NegocioException("La preinscripción está en lista de espera: primero debe liberarse un lugar "
                    + "o ampliarse el cupo del taller (RN-13)");
        }
        if (pr.getEstado() != EstadoPreinscripcion.PENDIENTE) {
            throw new NegocioException("Solo se pueden aprobar preinscripciones PENDIENTES (estado actual: "
                    + pr.getEstado() + ")");
        }
        Participante p = pr.getParticipante();
        if (inscripciones.existsByParticipanteIdAndTallerIdAndEstado(p.getId(), pr.getTaller().getId(),
                EstadoInscripcion.ACTIVA)) {
            throw new NegocioException("El participante ya tiene una inscripción activa en este taller");
        }

        pr.setEstado(EstadoPreinscripcion.APROBADA);
        Inscripcion ins = new Inscripcion();
        ins.setParticipante(p);
        ins.setTaller(pr.getTaller());
        ins.setPreinscripcion(pr);
        ins.setFechaInscripcion(fechas.hoy());
        ins.setEstado(EstadoInscripcion.ACTIVA);
        inscripciones.save(ins);

        // RN-07: el QR se genera al aprobarse la primera inscripción.
        participanteService.asegurarQr(p);
        Evaluacion ev = habilitacionService.recalcular(p);
        return new AprobacionResponse(InscripcionResponse.de(ins), p.getQrCode(), ev.motivos());
    }

    @Transactional
    public PreinscripcionResponse rechazar(Long id) {
        Preinscripcion pr = buscar(id);
        Taller taller = talleres.findByIdParaActualizar(pr.getTaller().getId()).orElseThrow();
        EstadoPreinscripcion anterior = pr.getEstado();
        if (anterior != EstadoPreinscripcion.PENDIENTE && anterior != EstadoPreinscripcion.LISTA_ESPERA) {
            throw new NegocioException("Solo se pueden rechazar preinscripciones PENDIENTES o en LISTA_ESPERA");
        }
        pr.setEstado(EstadoPreinscripcion.RECHAZADA);
        preinscripciones.flush();
        if (anterior == EstadoPreinscripcion.PENDIENTE) {
            cupoService.promoverListaEspera(taller); // se liberó un lugar en revisión
        }
        return PreinscripcionResponse.de(pr);
    }

    // ------------------------------------------------------------ Inscripciones

    @Transactional(readOnly = true)
    public List<InscripcionResponse> inscripcionesDelTaller(Long idTaller, EstadoInscripcion estado) {
        return inscripciones.delTaller(idTaller, estado).stream().map(InscripcionResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public List<InscripcionResponse> inscripcionesDelParticipante(Long idParticipante) {
        return inscripciones.findByParticipanteIdOrderByFechaInscripcionDesc(idParticipante).stream()
                .map(InscripcionResponse::de).toList();
    }

    /** Baja de una inscripción activa: libera un lugar y promueve la lista de espera (RN-13). */
    @Transactional
    public InscripcionResponse darDeBaja(Long idInscripcion) {
        Inscripcion ins = inscripciones.findById(idInscripcion)
                .orElseThrow(() -> new NoEncontradoException("Inscripción", idInscripcion));
        if (ins.getEstado() != EstadoInscripcion.ACTIVA) {
            throw new NegocioException("La inscripción ya está dada de baja");
        }
        Taller taller = talleres.findByIdParaActualizar(ins.getTaller().getId()).orElseThrow();
        ins.setEstado(EstadoInscripcion.BAJA);
        inscripciones.flush();
        cupoService.promoverListaEspera(taller);
        habilitacionService.recalcular(ins.getParticipante());
        return InscripcionResponse.de(ins);
    }

    private Preinscripcion buscar(Long id) {
        return preinscripciones.findById(id).orElseThrow(() -> new NoEncontradoException("Preinscripción", id));
    }
}
