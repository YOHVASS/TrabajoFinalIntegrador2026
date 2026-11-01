package unju.talleres.oferta.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.util.Fechas;
import unju.talleres.oferta.dto.*;
import unju.talleres.oferta.model.*;
import unju.talleres.oferta.repository.TallerRepository;
import unju.talleres.preinscripcion.repository.PreinscripcionRepository;
import unju.talleres.preinscripcion.service.CupoService;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;

/** RF-13: administración de talleres, horarios, modalidad, período y cupo. */
@Service
public class TallerService {

    private final TallerRepository talleres;
    private final DisciplinaService disciplinaService;
    private final PeriodoService periodoService;
    private final DocenteService docenteService;
    private final CupoService cupoService;
    private final PreinscripcionRepository preinscripciones;
    private final Fechas fechas;

    public TallerService(TallerRepository talleres, DisciplinaService disciplinaService, PeriodoService periodoService,
                         DocenteService docenteService, CupoService cupoService,
                         PreinscripcionRepository preinscripciones, Fechas fechas) {
        this.talleres = talleres;
        this.disciplinaService = disciplinaService;
        this.periodoService = periodoService;
        this.docenteService = docenteService;
        this.cupoService = cupoService;
        this.preinscripciones = preinscripciones;
        this.fechas = fechas;
    }

    @Transactional(readOnly = true)
    public List<TallerResponse> listar(Long idDisciplina, Long idPeriodo, Modalidad modalidad, Long idProfesor) {
        return talleres.buscar(idDisciplina, idPeriodo, modalidad, idProfesor).stream().map(this::aResponse).toList();
    }

    /** RF-01: oferta del portal público (talleres de períodos no finalizados). */
    @Transactional(readOnly = true)
    public List<TallerResponse> ofertaPublica(Long idDisciplina, Modalidad modalidad) {
        return talleres.ofertaVigente(fechas.hoy(), idDisciplina, modalidad).stream().map(this::aResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TallerResponse> delDocente(Long idUsuario) {
        return talleres.delUsuarioDocente(idUsuario).stream().map(this::aResponse).toList();
    }

    @Transactional(readOnly = true)
    public TallerResponse obtener(Long id) {
        return aResponse(buscar(id));
    }

    /** Detalle para el portal: solo talleres de períodos no finalizados. */
    @Transactional(readOnly = true)
    public TallerResponse obtenerPublico(Long id) {
        Taller t = buscar(id);
        if (t.getPeriodo().getFechaFin().isBefore(fechas.hoy())) {
            throw new NoEncontradoException("Taller", id);
        }
        return aResponse(t);
    }

    @Transactional
    public TallerResponse crear(TallerRequest req) {
        Taller t = new Taller();
        copiar(req, t);
        return aResponse(talleres.save(t));
    }

    @Transactional
    public TallerResponse actualizar(Long id, TallerRequest req) {
        Taller t = buscar(id);
        validarNuevoCupo(t, req.cupoMaximo());
        copiar(req, t);
        talleres.flush();
        cupoService.promoverListaEspera(t);
        return aResponse(t);
    }

    /** RN-13: el administrativo puede ampliar el cupo; se promueve la lista de espera. */
    @Transactional
    public TallerResponse cambiarCupo(Long id, Integer cupoMaximo) {
        Taller t = buscar(id);
        validarNuevoCupo(t, cupoMaximo);
        t.setCupoMaximo(cupoMaximo);
        talleres.flush();
        cupoService.promoverListaEspera(t);
        return aResponse(t);
    }

    @Transactional
    public void eliminar(Long id) {
        Taller t = buscar(id);
        if (preinscripciones.existsByTallerId(id)) {
            throw new NegocioException("No se puede eliminar: el taller tiene preinscripciones. "
                    + "Puede dejarlo sin cupo o en un período finalizado.");
        }
        talleres.delete(t);
        talleres.flush();
    }

    @Transactional(readOnly = true)
    public Taller buscar(Long id) {
        return talleres.findById(id).orElseThrow(() -> new NoEncontradoException("Taller", id));
    }

    private void validarNuevoCupo(Taller t, Integer nuevoCupo) {
        if (nuevoCupo == null) {
            return;
        }
        CupoService.Ocupacion oc = cupoService.ocupacion(t);
        if (nuevoCupo < oc.ocupados()) {
            throw new NegocioException("El cupo no puede ser menor a los lugares ya ocupados ("
                    + oc.ocupados() + ": inscripciones activas + preinscripciones en revisión)");
        }
    }

    private void copiar(TallerRequest req, Taller t) {
        t.setDisciplina(disciplinaService.buscar(req.idDisciplina()));
        t.setProfesor(docenteService.buscarProfesor(req.idProfesor()));
        t.setPeriodo(periodoService.buscar(req.idPeriodo()));
        t.setNombre(req.nombre().trim());
        t.setModalidad(req.modalidad());
        t.setCupoMaximo(req.cupoMaximo());

        // Horarios: se reemplazan por los recibidos.
        t.getHorarios().clear();
        if (req.horarios() != null) {
            for (HorarioDto h : req.horarios()) {
                if (!h.horaFin().isAfter(h.horaInicio())) {
                    throw new NegocioException(HttpStatus.BAD_REQUEST,
                            "En el horario del " + h.diaSemana() + " la hora de fin debe ser posterior a la de inicio");
                }
                HorarioTaller horario = new HorarioTaller();
                horario.setTaller(t);
                horario.setDiaSemana(h.diaSemana());
                horario.setHoraInicio(h.horaInicio());
                horario.setHoraFin(h.horaFin());
                t.getHorarios().add(horario);
            }
        }

        // Ayudantes: se reemplazan por los recibidos.
        LinkedHashSet<Ayudante> nuevos = new LinkedHashSet<>();
        if (req.idsAyudantes() != null) {
            req.idsAyudantes().stream().distinct().forEach(idA -> nuevos.add(docenteService.buscarAyudante(idA)));
        }
        t.getAyudantes().clear();
        t.getAyudantes().addAll(nuevos);
    }

    public TallerResponse aResponse(Taller t) {
        CupoService.Ocupacion oc = t.getId() == null ? null : cupoService.ocupacion(t);
        Periodo pe = t.getPeriodo();
        Profesor pr = t.getProfesor();
        return new TallerResponse(
                t.getId(), t.getNombre(), t.getModalidad(), t.getCupoMaximo(),
                oc == null ? null : oc.lugaresDisponibles(),
                oc == null ? null : oc.inscriptosActivos(),
                oc == null ? null : oc.enListaEspera(),
                new TallerResponse.Referencia(t.getDisciplina().getId(), t.getDisciplina().getNombre()),
                new TallerResponse.Referencia(pr.getId(), pr.getNombre() + " " + pr.getApellido()),
                new TallerResponse.PeriodoRef(pe.getId(), pe.getCodigo(), pe.getFechaInicio(), pe.getFechaFin()),
                t.getHorarios().stream()
                        .sorted(Comparator.comparing(HorarioTaller::getDiaSemana)
                                .thenComparing(HorarioTaller::getHoraInicio))
                        .map(HorarioDto::de).toList(),
                t.getAyudantes().stream()
                        .sorted(Comparator.comparing(Ayudante::getApellido))
                        .map(a -> new TallerResponse.Referencia(a.getId(), a.getNombre() + " " + a.getApellido()))
                        .toList());
    }
}
