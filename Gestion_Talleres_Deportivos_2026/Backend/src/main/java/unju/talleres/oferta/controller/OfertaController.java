package unju.talleres.oferta.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.common.security.Permisos;
import unju.talleres.common.security.UsuarioActual;
import unju.talleres.oferta.dto.*;
import unju.talleres.oferta.model.Modalidad;
import unju.talleres.oferta.service.DisciplinaService;
import unju.talleres.oferta.service.PeriodoService;
import unju.talleres.oferta.service.TallerService;

import java.util.List;

/** RF-13: disciplinas, períodos y talleres (con horarios, modalidad y cupo). */
@RestController
@RequestMapping("/api")
@Tag(name = "Oferta deportiva")
public class OfertaController {

    private final DisciplinaService disciplinaService;
    private final PeriodoService periodoService;
    private final TallerService tallerService;
    private final UsuarioActual usuarioActual;

    public OfertaController(DisciplinaService disciplinaService, PeriodoService periodoService,
                            TallerService tallerService, UsuarioActual usuarioActual) {
        this.disciplinaService = disciplinaService;
        this.periodoService = periodoService;
        this.tallerService = tallerService;
        this.usuarioActual = usuarioActual;
    }

    // ------------------------------------------------------------ Disciplinas

    @GetMapping("/disciplinas")
    public List<DisciplinaDto> disciplinas() {
        return disciplinaService.listar();
    }

    @GetMapping("/disciplinas/{id}")
    public DisciplinaDto disciplina(@PathVariable Long id) {
        return disciplinaService.obtener(id);
    }

    @PostMapping("/disciplinas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(Permisos.GESTION)
    public DisciplinaDto crearDisciplina(@Valid @RequestBody DisciplinaDto req) {
        return disciplinaService.crear(req);
    }

    @PutMapping("/disciplinas/{id}")
    @PreAuthorize(Permisos.GESTION)
    public DisciplinaDto actualizarDisciplina(@PathVariable Long id, @Valid @RequestBody DisciplinaDto req) {
        return disciplinaService.actualizar(id, req);
    }

    @DeleteMapping("/disciplinas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(Permisos.GESTION)
    public void eliminarDisciplina(@PathVariable Long id) {
        disciplinaService.eliminar(id);
    }

    // ------------------------------------------------------------ Períodos

    @GetMapping("/periodos")
    public List<PeriodoDto> periodos() {
        return periodoService.listar();
    }

    @GetMapping("/periodos/vigente")
    @Operation(summary = "Período que incluye la fecha de hoy (204 si no hay)")
    public ResponseEntity<PeriodoDto> periodoVigente() {
        return periodoService.vigente().map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/periodos/{id}")
    public PeriodoDto periodo(@PathVariable Long id) {
        return periodoService.obtener(id);
    }

    @PostMapping("/periodos")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(Permisos.GESTION)
    public PeriodoDto crearPeriodo(@Valid @RequestBody PeriodoDto req) {
        return periodoService.crear(req);
    }

    @PutMapping("/periodos/{id}")
    @PreAuthorize(Permisos.GESTION)
    public PeriodoDto actualizarPeriodo(@PathVariable Long id, @Valid @RequestBody PeriodoDto req) {
        return periodoService.actualizar(id, req);
    }

    @DeleteMapping("/periodos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(Permisos.GESTION)
    public void eliminarPeriodo(@PathVariable Long id) {
        periodoService.eliminar(id);
    }

    // ------------------------------------------------------------ Talleres

    @GetMapping("/talleres")
    @Operation(summary = "Lista talleres con filtros opcionales")
    public List<TallerResponse> talleres(@RequestParam(required = false) Long idDisciplina,
                                         @RequestParam(required = false) Long idPeriodo,
                                         @RequestParam(required = false) Modalidad modalidad,
                                         @RequestParam(required = false) Long idProfesor) {
        return tallerService.listar(idDisciplina, idPeriodo, modalidad, idProfesor);
    }

    @GetMapping("/talleres/mis-talleres")
    @PreAuthorize("hasAnyRole('PROFESOR','AYUDANTE')")
    @Operation(summary = "Talleres del profesor o ayudante autenticado")
    public List<TallerResponse> misTalleres() {
        return tallerService.delDocente(usuarioActual.get().getId());
    }

    @GetMapping("/talleres/{id}")
    public TallerResponse taller(@PathVariable Long id) {
        return tallerService.obtener(id);
    }

    @PostMapping("/talleres")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(Permisos.GESTION)
    public TallerResponse crearTaller(@Valid @RequestBody TallerRequest req) {
        return tallerService.crear(req);
    }

    @PutMapping("/talleres/{id}")
    @PreAuthorize(Permisos.GESTION)
    @Operation(summary = "Modifica el taller; horarios e idsAyudantes reemplazan los actuales")
    public TallerResponse actualizarTaller(@PathVariable Long id, @Valid @RequestBody TallerRequest req) {
        return tallerService.actualizar(id, req);
    }

    @PatchMapping("/talleres/{id}/cupo")
    @PreAuthorize(Permisos.GESTION)
    @Operation(summary = "Cambia el cupo máximo; si se amplía, la lista de espera pasa a revisión (RN-13)")
    public TallerResponse cambiarCupo(@PathVariable Long id, @Valid @RequestBody CupoRequest req) {
        return tallerService.cambiarCupo(id, req.cupoMaximo());
    }

    @DeleteMapping("/talleres/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(Permisos.GESTION)
    public void eliminarTaller(@PathVariable Long id) {
        tallerService.eliminar(id);
    }
}
