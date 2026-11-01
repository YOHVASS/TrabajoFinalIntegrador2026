package unju.talleres.aptomedico.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.aptomedico.dto.AptoMedicoRequest;
import unju.talleres.aptomedico.dto.AptoMedicoResponse;
import unju.talleres.aptomedico.service.AptoMedicoService;
import unju.talleres.common.security.Permisos;

import java.util.List;

/** RF-07. Dato de salud: solo roles con necesidad operativa (RN-11). */
@RestController
@RequestMapping("/api")
@Tag(name = "Apto médico")
@PreAuthorize(Permisos.SALUD)
public class AptoMedicoController {

    private final AptoMedicoService service;

    public AptoMedicoController(AptoMedicoService service) {
        this.service = service;
    }

    @GetMapping("/participantes/{idParticipante}/aptos-medicos")
    public List<AptoMedicoResponse> delParticipante(@PathVariable Long idParticipante) {
        return service.delParticipante(idParticipante);
    }

    @PostMapping("/participantes/{idParticipante}/aptos-medicos")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registra un apto médico; el vencimiento por defecto es emisión + 1 año")
    public AptoMedicoResponse registrar(@PathVariable Long idParticipante, @Valid @RequestBody AptoMedicoRequest req) {
        return service.registrar(idParticipante, req);
    }

    @PutMapping("/aptos-medicos/{id}")
    public AptoMedicoResponse actualizar(@PathVariable Long id, @Valid @RequestBody AptoMedicoRequest req) {
        return service.actualizar(id, req);
    }

    @DeleteMapping("/aptos-medicos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
