package unju.talleres.seguro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.common.security.Permisos;
import unju.talleres.seguro.dto.InformeProductoraRequest;
import unju.talleres.seguro.dto.SeguroRequest;
import unju.talleres.seguro.dto.SeguroResponse;
import unju.talleres.seguro.service.SeguroService;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Seguro")
@PreAuthorize(Permisos.GESTION)
public class SeguroController {

    private final SeguroService service;

    public SeguroController(SeguroService service) {
        this.service = service;
    }

    @GetMapping("/participantes/{idParticipante}/seguros")
    public List<SeguroResponse> delParticipante(@PathVariable Long idParticipante) {
        return service.delParticipante(idParticipante);
    }

    @PostMapping("/participantes/{idParticipante}/seguros")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registra el pago del seguro anual (uno por período, RN-02)")
    public SeguroResponse registrar(@PathVariable Long idParticipante, @Valid @RequestBody SeguroRequest req) {
        return service.registrar(idParticipante, req);
    }

    @PutMapping("/seguros/{id}")
    public SeguroResponse actualizar(@PathVariable Long id, @Valid @RequestBody SeguroRequest req) {
        return service.actualizar(id, req);
    }

    @DeleteMapping("/seguros/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @GetMapping("/seguros/altas-pendientes")
    @Operation(summary = "RF-19: altas de asegurados todavía no informadas a la productora")
    public List<SeguroResponse> altasPendientes(@RequestParam(required = false) Long idPeriodo) {
        return service.altasPendientes(idPeriodo);
    }

    @GetMapping(value = "/seguros/altas-pendientes/csv", produces = "text/csv")
    @Operation(summary = "RF-19: descarga la planilla CSV de altas pendientes para enviar a la productora")
    public ResponseEntity<byte[]> altasPendientesCsv(@RequestParam(required = false) Long idPeriodo) {
        byte[] contenido = service.altasPendientesCsv(idPeriodo).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"altas_seguro.csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(contenido);
    }

    @PostMapping("/seguros/informar-productora")
    @Operation(summary = "RF-19: marca las altas como informadas a la productora")
    public List<SeguroResponse> informar(@RequestBody(required = false) InformeProductoraRequest req) {
        return service.marcarInformados(req);
    }
}
