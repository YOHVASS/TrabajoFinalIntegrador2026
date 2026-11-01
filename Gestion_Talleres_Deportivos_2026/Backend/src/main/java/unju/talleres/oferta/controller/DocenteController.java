package unju.talleres.oferta.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.common.security.Permisos;
import unju.talleres.oferta.dto.AyudanteRequest;
import unju.talleres.oferta.dto.AyudanteResponse;
import unju.talleres.oferta.dto.ProfesorRequest;
import unju.talleres.oferta.dto.ProfesorResponse;
import unju.talleres.oferta.service.DocenteService;

import java.util.List;

/** RF-14: profesores y ayudantes. Se asocian a talleres desde PUT /api/talleres/{id}. */
@RestController
@RequestMapping("/api")
@Tag(name = "Profesores y ayudantes")
@PreAuthorize(Permisos.GESTION)
public class DocenteController {

    private final DocenteService service;

    public DocenteController(DocenteService service) {
        this.service = service;
    }

    @GetMapping("/profesores")
    public List<ProfesorResponse> profesores() {
        return service.listarProfesores();
    }

    @GetMapping("/profesores/{id}")
    public ProfesorResponse profesor(@PathVariable Long id) {
        return service.obtenerProfesor(id);
    }

    @PostMapping("/profesores")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfesorResponse crearProfesor(@Valid @RequestBody ProfesorRequest req) {
        return service.crearProfesor(req);
    }

    @PutMapping("/profesores/{id}")
    public ProfesorResponse actualizarProfesor(@PathVariable Long id, @Valid @RequestBody ProfesorRequest req) {
        return service.actualizarProfesor(id, req);
    }

    @DeleteMapping("/profesores/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarProfesor(@PathVariable Long id) {
        service.eliminarProfesor(id);
    }

    @GetMapping("/ayudantes")
    public List<AyudanteResponse> ayudantes() {
        return service.listarAyudantes();
    }

    @GetMapping("/ayudantes/{id}")
    public AyudanteResponse ayudante(@PathVariable Long id) {
        return service.obtenerAyudante(id);
    }

    @PostMapping("/ayudantes")
    @ResponseStatus(HttpStatus.CREATED)
    public AyudanteResponse crearAyudante(@Valid @RequestBody AyudanteRequest req) {
        return service.crearAyudante(req);
    }

    @PutMapping("/ayudantes/{id}")
    public AyudanteResponse actualizarAyudante(@PathVariable Long id, @Valid @RequestBody AyudanteRequest req) {
        return service.actualizarAyudante(id, req);
    }

    @DeleteMapping("/ayudantes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarAyudante(@PathVariable Long id) {
        service.eliminarAyudante(id);
    }
}
