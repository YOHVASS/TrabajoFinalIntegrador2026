package unju.talleres.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import unju.talleres.auth.dto.LoginRequest;
import unju.talleres.auth.dto.LoginResponse;
import unju.talleres.auth.dto.UsuarioResponse;
import unju.talleres.auth.service.AuthService;
import unju.talleres.common.security.UsuarioActual;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación")
public class AuthController {

    private final AuthService authService;
    private final UsuarioActual usuarioActual;

    public AuthController(AuthService authService, UsuarioActual usuarioActual) {
        this.authService = authService;
        this.usuarioActual = usuarioActual;
    }

    @PostMapping("/login")
    @Operation(summary = "Inicia sesión y devuelve el JWT")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    @Operation(summary = "Datos del usuario autenticado (para armar el menú según el rol)")
    public UsuarioResponse me() {
        return authService.perfil(usuarioActual.get().getId());
    }
}
