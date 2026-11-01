package unju.talleres.common.storage;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import unju.talleres.common.security.Permisos;

import java.util.Map;

@RestController
@RequestMapping("/api/archivos")
@Tag(name = "Archivos")
public class ArchivoController {

    private final AlmacenamientoService almacenamiento;

    public ArchivoController(AlmacenamientoService almacenamiento) {
        this.almacenamiento = almacenamiento;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(Permisos.GESTION)
    @Operation(summary = "Sube un archivo (PDF/JPG/PNG/WEBP, máx. 5 MB). Devuelve {url} para usar en archivoUrl/fotoUrl")
    public Map<String, String> subir(@RequestParam("archivo") MultipartFile archivo) {
        return Map.of("url", almacenamiento.guardar(archivo));
    }

    @GetMapping("/{nombre:.+}")
    @PreAuthorize(Permisos.INGRESO)
    @Operation(summary = "Descarga un archivo (requiere token; el frontend lo pide con fetch y lo muestra como blob)")
    public ResponseEntity<Resource> descargar(@PathVariable String nombre) {
        Resource recurso = almacenamiento.cargar(nombre);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(almacenamiento.tipoContenido(nombre)))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nombre + "\"")
                .body(recurso);
    }
}
