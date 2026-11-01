package unju.talleres.alertas.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.alertas.dto.AlertaResponse;
import unju.talleres.alertas.model.EstadoAlerta;
import unju.talleres.alertas.model.TipoAlerta;
import unju.talleres.alertas.service.AlertaService;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.common.security.Permisos;

import java.util.List;
import java.util.Map;

/** RF-09: panel de alertas. */
@RestController
@RequestMapping("/api")
@Tag(name = "Alertas")
@PreAuthorize(Permisos.GESTION)
public class AlertaController {

    private final AlertaService service;

    public AlertaController(AlertaService service) {
        this.service = service;
    }

    @GetMapping("/alertas")
    @Operation(summary = "Lista alertas (por defecto ACTIVAS), paginadas")
    public PaginaResponse<AlertaResponse> listar(@RequestParam(required = false, defaultValue = "ACTIVA") EstadoAlerta estado,
                                                 @RequestParam(required = false) TipoAlerta tipo,
                                                 @RequestParam(required = false) Long idParticipante,
                                                 @RequestParam(defaultValue = "0") int pagina,
                                                 @RequestParam(defaultValue = "20") int tamanio) {
        return service.buscar(estado, tipo, idParticipante, pagina, Math.min(tamanio, 100));
    }

    @GetMapping("/alertas/contador")
    @Operation(summary = "Cantidad de alertas activas (para el badge del menú)")
    public Map<String, Long> contador() {
        return service.contador();
    }

    @GetMapping("/participantes/{id}/alertas")
    public List<AlertaResponse> delParticipante(@PathVariable Long id) {
        return service.delParticipante(id);
    }

    @PatchMapping("/alertas/{id}/resolver")
    @Operation(summary = "Marca la alerta como RESUELTA (si la condición persiste, se regenera en el próximo recálculo)")
    public AlertaResponse resolver(@PathVariable Long id) {
        return service.resolver(id);
    }
}
