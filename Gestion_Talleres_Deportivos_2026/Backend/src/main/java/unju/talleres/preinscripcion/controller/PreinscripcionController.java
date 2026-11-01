package unju.talleres.preinscripcion.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.auth.model.RolNombre;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.security.Permisos;
import unju.talleres.common.security.UsuarioActual;
import unju.talleres.common.security.UsuarioPrincipal;
import unju.talleres.oferta.repository.TallerRepository;
import unju.talleres.preinscripcion.dto.AprobacionResponse;
import unju.talleres.preinscripcion.dto.InscripcionResponse;
import unju.talleres.preinscripcion.dto.PreinscripcionResponse;
import unju.talleres.preinscripcion.model.EstadoInscripcion;
import unju.talleres.preinscripcion.model.EstadoPreinscripcion;
import unju.talleres.preinscripcion.service.PreinscripcionService;

import java.util.List;

/** RF-03: revisión de preinscripciones e inscripciones. */
@RestController
@RequestMapping("/api")
@Tag(name = "Preinscripciones e inscripciones")
public class PreinscripcionController {

    private final PreinscripcionService service;
    private final UsuarioActual usuarioActual;
    private final TallerRepository talleres;

    public PreinscripcionController(PreinscripcionService service, UsuarioActual usuarioActual,
                                    TallerRepository talleres) {
        this.service = service;
        this.usuarioActual = usuarioActual;
        this.talleres = talleres;
    }

    @GetMapping("/preinscripciones")
    @PreAuthorize(Permisos.GESTION)
    @Operation(summary = "Bandeja de revisión. Orden: más antiguas primero")
    public PaginaResponse<PreinscripcionResponse> listar(@RequestParam(required = false) EstadoPreinscripcion estado,
                                                         @RequestParam(required = false) Long idTaller,
                                                         @RequestParam(required = false) Long idPeriodo,
                                                         @RequestParam(defaultValue = "0") int pagina,
                                                         @RequestParam(defaultValue = "20") int tamanio) {
        return service.buscar(estado, idTaller, idPeriodo, pagina, Math.min(tamanio, 100));
    }

    @GetMapping("/preinscripciones/{id}")
    @PreAuthorize(Permisos.GESTION)
    public PreinscripcionResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping("/preinscripciones/{id}/aprobar")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(Permisos.GESTION)
    @Operation(summary = "Aprueba: crea la inscripción, genera el QR y devuelve los requisitos pendientes")
    public AprobacionResponse aprobar(@PathVariable Long id) {
        return service.aprobar(id);
    }

    @PostMapping("/preinscripciones/{id}/rechazar")
    @PreAuthorize(Permisos.GESTION)
    public PreinscripcionResponse rechazar(@PathVariable Long id) {
        return service.rechazar(id);
    }

    @GetMapping("/participantes/{idParticipante}/preinscripciones")
    @PreAuthorize(Permisos.GESTION)
    public List<PreinscripcionResponse> preinscripcionesDelParticipante(@PathVariable Long idParticipante) {
        return service.delParticipante(idParticipante);
    }

    @GetMapping("/participantes/{idParticipante}/inscripciones")
    @PreAuthorize(Permisos.GESTION)
    public List<InscripcionResponse> inscripcionesDelParticipante(@PathVariable Long idParticipante) {
        return service.inscripcionesDelParticipante(idParticipante);
    }

    @GetMapping("/talleres/{idTaller}/inscriptos")
    @PreAuthorize(Permisos.DOCENTE_O_GESTION)
    @Operation(summary = "Inscriptos del taller (por defecto solo ACTIVAS). Profesores y ayudantes: solo sus talleres")
    public List<InscripcionResponse> inscriptos(@PathVariable Long idTaller,
                                                @RequestParam(required = false, defaultValue = "ACTIVA") EstadoInscripcion estado) {
        UsuarioPrincipal u = usuarioActual.get();
        if (u.tieneRol(RolNombre.PROFESOR, RolNombre.AYUDANTE) && !talleres.esDocenteDelTaller(idTaller, u.getId())) {
            throw new NegocioException(HttpStatus.FORBIDDEN, "Solo puede consultar los talleres a su cargo");
        }
        return service.inscripcionesDelTaller(idTaller, estado);
    }

    @PostMapping("/inscripciones/{id}/baja")
    @PreAuthorize(Permisos.GESTION)
    @Operation(summary = "Da de baja la inscripción; libera el lugar y promueve la lista de espera (RN-13)")
    public InscripcionResponse baja(@PathVariable Long id) {
        return service.darDeBaja(id);
    }
}
