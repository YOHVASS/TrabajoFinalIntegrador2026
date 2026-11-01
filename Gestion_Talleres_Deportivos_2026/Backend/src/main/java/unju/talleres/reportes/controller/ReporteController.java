package unju.talleres.reportes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.common.security.Permisos;
import unju.talleres.reportes.dto.Reportes.*;
import unju.talleres.reportes.service.ReporteService;

import java.time.LocalDate;
import java.util.List;

/**
 * RF-16: información de gestión. La autoridad institucional accede solo a los agregados (RN-12);
 * los listados nominales (/detalle) quedan para ADMINISTRATIVO y COORDINADOR.
 */
@RestController
@RequestMapping("/api/reportes")
@Tag(name = "Reportes e indicadores")
public class ReporteController {

    private final ReporteService service;

    public ReporteController(ReporteService service) {
        this.service = service;
    }

    @GetMapping("/resumen")
    @PreAuthorize(Permisos.REPORTES)
    @Operation(summary = "Indicadores principales para el tablero")
    public Resumen resumen(@RequestParam(required = false) Long idPeriodo) {
        return service.resumen(idPeriodo);
    }

    @GetMapping("/participantes-por-taller")
    @PreAuthorize(Permisos.REPORTES)
    public List<PorTaller> porTaller(@RequestParam(required = false) Long idPeriodo) {
        return service.porTaller(idPeriodo);
    }

    @GetMapping("/participantes-por-disciplina")
    @PreAuthorize(Permisos.REPORTES)
    public List<PorDisciplina> porDisciplina(@RequestParam(required = false) Long idPeriodo) {
        return service.porDisciplina(idPeriodo);
    }

    @GetMapping("/participantes-por-facultad")
    @PreAuthorize(Permisos.REPORTES)
    public List<PorCategoria> porFacultad(@RequestParam(required = false) Long idPeriodo) {
        return service.porFacultad(idPeriodo);
    }

    @GetMapping("/participantes-por-sexo")
    @PreAuthorize(Permisos.REPORTES)
    public List<PorCategoria> porSexo(@RequestParam(required = false) Long idPeriodo) {
        return service.porSexo(idPeriodo);
    }

    @GetMapping("/evolucion-inscripciones")
    @PreAuthorize(Permisos.REPORTES)
    @Operation(summary = "Preinscripciones e inscripciones por mes (por defecto, últimos 12 meses)")
    public List<EvolucionMensual> evolucion(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return service.evolucion(desde, hasta);
    }

    @GetMapping("/asistencia")
    @PreAuthorize(Permisos.REPORTES)
    @Operation(summary = "Asistencias habilitadas y rechazadas por taller (por defecto, últimos 30 días)")
    public List<AsistenciaPorTaller> asistencia(
            @RequestParam(required = false) Long idPeriodo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return service.asistencia(idPeriodo, desde, hasta);
    }

    @GetMapping("/aptos-por-vencer/detalle")
    @PreAuthorize(Permisos.REPORTES_NOMINALES)
    @Operation(summary = "Participantes activos con apto médico próximo a vencer (nominal)")
    public List<AptoPorVencerDetalle> aptosPorVencer(@RequestParam(required = false) Integer dias) {
        return service.aptosPorVencer(dias);
    }

    @GetMapping("/documentacion-pendiente/detalle")
    @PreAuthorize(Permisos.REPORTES_NOMINALES)
    @Operation(summary = "Participantes activos no habilitados y qué les falta (nominal)")
    public List<DocumentacionPendienteDetalle> documentacionPendiente() {
        return service.documentacionPendiente();
    }
}
