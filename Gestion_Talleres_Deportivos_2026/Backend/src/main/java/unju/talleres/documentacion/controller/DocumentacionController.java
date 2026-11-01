package unju.talleres.documentacion.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.common.security.Permisos;
import unju.talleres.documentacion.dto.DocumentacionRequest;
import unju.talleres.documentacion.dto.DocumentacionResponse;
import unju.talleres.documentacion.dto.TipoDocumentoDto;
import unju.talleres.documentacion.service.DocumentacionService;

import java.util.List;

/** RF-05: catálogo de tipos de documento y documentación presentada por cada participante. */
@RestController
@RequestMapping("/api")
@Tag(name = "Documentación")
@PreAuthorize(Permisos.GESTION)
public class DocumentacionController {

    private final DocumentacionService service;

    public DocumentacionController(DocumentacionService service) {
        this.service = service;
    }

    @GetMapping("/tipos-documento")
    public List<TipoDocumentoDto> tipos() {
        return service.listarTipos();
    }

    @PostMapping("/tipos-documento")
    @ResponseStatus(HttpStatus.CREATED)
    public TipoDocumentoDto crearTipo(@Valid @RequestBody TipoDocumentoDto req) {
        return service.crearTipo(req);
    }

    @PutMapping("/tipos-documento/{id}")
    public TipoDocumentoDto actualizarTipo(@PathVariable Long id, @Valid @RequestBody TipoDocumentoDto req) {
        return service.actualizarTipo(id, req);
    }

    @DeleteMapping("/tipos-documento/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarTipo(@PathVariable Long id) {
        service.eliminarTipo(id);
    }

    @GetMapping("/participantes/{idParticipante}/documentos")
    public List<DocumentacionResponse> delParticipante(@PathVariable Long idParticipante) {
        return service.delParticipante(idParticipante);
    }

    @PostMapping("/participantes/{idParticipante}/documentos")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registra un documento. Primero subir el archivo con POST /api/archivos")
    public DocumentacionResponse registrar(@PathVariable Long idParticipante,
                                           @Valid @RequestBody DocumentacionRequest req) {
        return service.registrar(idParticipante, req);
    }

    @PutMapping("/documentos/{id}")
    public DocumentacionResponse actualizar(@PathVariable Long id, @Valid @RequestBody DocumentacionRequest req) {
        return service.actualizar(id, req);
    }

    @DeleteMapping("/documentos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
