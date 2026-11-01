package unju.talleres.portal.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.common.security.Permisos;
import unju.talleres.portal.dto.NoticiaRequest;
import unju.talleres.portal.dto.NoticiaResponse;
import unju.talleres.portal.model.TipoNoticia;
import unju.talleres.portal.service.NoticiaService;

/** RF-15: administración de noticias, novedades y avisos. */
@RestController
@RequestMapping("/api/noticias")
@Tag(name = "Noticias (administración)")
@PreAuthorize(Permisos.GESTION)
public class NoticiaController {

    private final NoticiaService service;

    public NoticiaController(NoticiaService service) {
        this.service = service;
    }

    @GetMapping
    public PaginaResponse<NoticiaResponse> listar(@RequestParam(required = false) TipoNoticia tipo,
                                                  @RequestParam(defaultValue = "0") int pagina,
                                                  @RequestParam(defaultValue = "20") int tamanio) {
        return service.todas(tipo, pagina, tamanio);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoticiaResponse crear(@Valid @RequestBody NoticiaRequest req) {
        return service.crear(req);
    }

    @PutMapping("/{id}")
    public NoticiaResponse actualizar(@PathVariable Long id, @Valid @RequestBody NoticiaRequest req) {
        return service.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
