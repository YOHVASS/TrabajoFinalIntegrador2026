package unju.talleres.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import unju.talleres.auth.dto.*;
import unju.talleres.auth.service.UsuarioService;
import unju.talleres.common.security.Permisos;

import java.util.List;

/** RF-17: gestión de usuarios internos y roles. */
@RestController
@RequestMapping("/api")
@Tag(name = "Usuarios y roles")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping("/usuarios")
    @PreAuthorize(Permisos.USUARIOS_O_GESTION)
    public List<UsuarioResponse> listar() {
        return service.listar();
    }

    @GetMapping("/usuarios/{id}")
    @PreAuthorize(Permisos.USUARIOS)
    public UsuarioResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping("/usuarios")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(Permisos.USUARIOS)
    public UsuarioResponse crear(@Valid @RequestBody UsuarioCrearRequest req) {
        return service.crear(req);
    }

    @PutMapping("/usuarios/{id}")
    @PreAuthorize(Permisos.USUARIOS)
    @Operation(summary = "Actualiza nombre, rol y estado (ACTIVO/INACTIVO)")
    public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioActualizarRequest req) {
        return service.actualizar(id, req);
    }

    @PutMapping("/usuarios/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Cambia la contraseña: la propia (con passwordActual) o la de otro usuario si es ADMIN_SISTEMA")
    public void cambiarPassword(@PathVariable Long id, @Valid @RequestBody CambioPasswordRequest req) {
        service.cambiarPassword(id, req);
    }

    @GetMapping("/roles")
    @PreAuthorize(Permisos.USUARIOS)
    public List<RolResponse> roles() {
        return service.listarRoles();
    }
}
