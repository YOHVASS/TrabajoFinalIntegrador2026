package unju.talleres.habilitacion.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.common.security.Permisos;
import unju.talleres.habilitacion.dto.HabilitacionResponse;
import unju.talleres.habilitacion.service.HabilitacionService;

import java.util.Map;

/** RF-08: estado de habilitación. */
@RestController
@RequestMapping("/api")
@Tag(name = "Habilitación")
public class HabilitacionController {

    private final HabilitacionService service;

    public HabilitacionController(HabilitacionService service) {
        this.service = service;
    }

    @GetMapping("/participantes/{id}/habilitacion")
    @PreAuthorize(Permisos.GESTION)
    @Operation(summary = "Detalle de qué requisitos cumple o le faltan al participante")
    public HabilitacionResponse detalle(@PathVariable Long id) {
        return service.detalle(id);
    }

    @PostMapping("/habilitacion/recalcular")
    @PreAuthorize(Permisos.GESTION)
    @Operation(summary = "Fuerza el recálculo de vencimientos, habilitación y alertas de todos los participantes")
    public Map<String, Integer> recalcularTodos() {
        return Map.of("participantesProcesados", service.recalcularTodos());
    }
}
