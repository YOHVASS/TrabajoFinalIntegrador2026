package unju.talleres.participantes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.common.security.Permisos;
import unju.talleres.participantes.dto.CredencialResponse;
import unju.talleres.participantes.dto.ParticipanteRequest;
import unju.talleres.participantes.dto.ParticipanteResponse;
import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.participantes.service.ParticipanteService;

/** RF-04: datos personales y fotografía. Acceso restringido a ADMINISTRATIVO y COORDINADOR (RN-11). */
@RestController
@RequestMapping("/api/participantes")
@Tag(name = "Participantes")
@PreAuthorize(Permisos.GESTION)
public class ParticipanteController {

    private final ParticipanteService service;

    public ParticipanteController(ParticipanteService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Busca por DNI, nombre o apellido (q) y filtra por estado de habilitación")
    public PaginaResponse<ParticipanteResponse> buscar(@RequestParam(required = false) String q,
                                                       @RequestParam(required = false) EstadoHabilitacion estado,
                                                       @RequestParam(defaultValue = "0") int pagina,
                                                       @RequestParam(defaultValue = "20") int tamanio) {
        return service.buscar(q, estado, pagina, Math.min(tamanio, 100));
    }

    @GetMapping("/{id}")
    public ParticipanteResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Alta manual (la vía habitual es la preinscripción online)")
    public ParticipanteResponse crear(@Valid @RequestBody ParticipanteRequest req) {
        return service.crear(req);
    }

    @PutMapping("/{id}")
    public ParticipanteResponse actualizar(@PathVariable Long id, @Valid @RequestBody ParticipanteRequest req) {
        return service.actualizar(id, req);
    }

    @PostMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Sube la fotografía (campo multipart 'foto')")
    public ParticipanteResponse subirFoto(@PathVariable Long id, @RequestParam("foto") MultipartFile foto) {
        return service.subirFoto(id, foto);
    }

    @GetMapping("/{id}/credencial")
    @Operation(summary = "Datos de la credencial digital con el token QR (RN-07)")
    public CredencialResponse credencial(@PathVariable Long id) {
        return service.credencial(id);
    }
}
