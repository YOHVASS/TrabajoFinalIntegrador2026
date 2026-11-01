package unju.talleres.portal.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.oferta.dto.DisciplinaDto;
import unju.talleres.oferta.dto.TallerResponse;
import unju.talleres.oferta.model.Modalidad;
import unju.talleres.oferta.service.DisciplinaService;
import unju.talleres.oferta.service.TallerService;
import unju.talleres.portal.dto.NoticiaResponse;
import unju.talleres.portal.model.TipoNoticia;
import unju.talleres.portal.service.NoticiaService;
import unju.talleres.preinscripcion.dto.PreinscripcionPublicaRequest;
import unju.talleres.preinscripcion.dto.PreinscripcionPublicaResponse;
import unju.talleres.preinscripcion.service.PreinscripcionService;

import java.util.List;

/**
 * Portal público (RF-01, RF-02, RF-15). No requiere autenticación y no expone datos personales.
 */
@RestController
@RequestMapping("/api/public")
@Tag(name = "Portal público")
public class PortalController {

    private final DisciplinaService disciplinaService;
    private final TallerService tallerService;
    private final NoticiaService noticiaService;
    private final PreinscripcionService preinscripcionService;

    public PortalController(DisciplinaService disciplinaService, TallerService tallerService,
                            NoticiaService noticiaService, PreinscripcionService preinscripcionService) {
        this.disciplinaService = disciplinaService;
        this.tallerService = tallerService;
        this.noticiaService = noticiaService;
        this.preinscripcionService = preinscripcionService;
    }

    @GetMapping("/disciplinas")
    public List<DisciplinaDto> disciplinas() {
        return disciplinaService.listar();
    }

    @GetMapping("/talleres")
    @Operation(summary = "RF-01: oferta vigente con horarios, modalidad, profesor y lugares disponibles")
    public List<TallerResponse> talleres(@RequestParam(required = false) Long idDisciplina,
                                         @RequestParam(required = false) Modalidad modalidad) {
        return tallerService.ofertaPublica(idDisciplina, modalidad);
    }

    @GetMapping("/talleres/{id}")
    public TallerResponse taller(@PathVariable Long id) {
        return tallerService.obtenerPublico(id);
    }

    @GetMapping("/noticias")
    @Operation(summary = "RF-15: noticias, novedades y avisos publicados (más recientes primero)")
    public PaginaResponse<NoticiaResponse> noticias(@RequestParam(required = false) TipoNoticia tipo,
                                                    @RequestParam(defaultValue = "0") int pagina,
                                                    @RequestParam(defaultValue = "10") int tamanio) {
        return noticiaService.publicadas(tipo, pagina, tamanio);
    }

    @GetMapping("/noticias/{id}")
    public NoticiaResponse noticia(@PathVariable Long id) {
        return noticiaService.publicada(id);
    }

    @PostMapping("/preinscripciones")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "RF-02: preinscripción online. Queda PENDIENTE o en LISTA_ESPERA si no hay cupo (RN-13)")
    public PreinscripcionPublicaResponse preinscribir(@Valid @RequestBody PreinscripcionPublicaRequest req) {
        return preinscripcionService.preinscribir(req);
    }

    @GetMapping("/preinscripciones/{id}")
    @Operation(summary = "Consulta el estado de una preinscripción con su número y el DNI")
    public PreinscripcionPublicaResponse estadoPreinscripcion(@PathVariable Long id, @RequestParam String dni) {
        return preinscripcionService.consultarPublica(id, dni);
    }
}
