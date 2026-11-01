package unju.talleres.ingreso.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.common.security.Permisos;
import unju.talleres.ingreso.dto.AsistenciaResponse;
import unju.talleres.ingreso.dto.IngresoRequest;
import unju.talleres.ingreso.dto.IngresoResponse;
import unju.talleres.ingreso.model.ResultadoHabilitacion;
import unju.talleres.ingreso.service.IngresoService;
import unju.talleres.oferta.dto.TallerResponse;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Control de ingreso y asistencia")
@PreAuthorize(Permisos.INGRESO)
public class IngresoController {

    private final IngresoService service;

    public IngresoController(IngresoService service) {
        this.service = service;
    }

    @PostMapping("/ingreso")
    @Operation(summary = "Identifica por QR o DNI, verifica la habilitación y registra la asistencia "
            + "(HABILITADO o RECHAZADO)")
    public IngresoResponse ingresar(@Valid @RequestBody IngresoRequest req) {
        return service.registrarIngreso(req);
    }

    @GetMapping("/ingreso/talleres")
    @Operation(summary = "Talleres en curso para elegir en la pantalla de ingreso")
    public List<TallerResponse> talleres() {
        return service.talleresParaIngreso();
    }

    @GetMapping("/asistencias")
    @Operation(summary = "Historial de asistencias (por defecto últimos 30 días). Fechas yyyy-MM-dd")
    public PaginaResponse<AsistenciaResponse> asistencias(
            @RequestParam(required = false) Long idTaller,
            @RequestParam(required = false) Long idParticipante,
            @RequestParam(required = false) ResultadoHabilitacion resultado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamanio) {
        return service.buscar(idTaller, idParticipante, resultado, desde, hasta, pagina, Math.min(tamanio, 200));
    }
}
