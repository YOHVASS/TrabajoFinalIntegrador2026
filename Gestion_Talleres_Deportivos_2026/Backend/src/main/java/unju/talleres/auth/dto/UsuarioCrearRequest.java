package unju.talleres.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import unju.talleres.auth.model.RolNombre;

public record UsuarioCrearRequest(
        @NotBlank @Size(max = 50) String nombreUsuario,
        @NotBlank @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres") String password,
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Size(max = 100) String apellido,
        @NotNull RolNombre rol) {
}
