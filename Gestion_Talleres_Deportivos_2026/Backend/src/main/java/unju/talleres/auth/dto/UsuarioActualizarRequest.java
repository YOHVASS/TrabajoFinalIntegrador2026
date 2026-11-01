package unju.talleres.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import unju.talleres.auth.model.EstadoUsuario;
import unju.talleres.auth.model.RolNombre;

public record UsuarioActualizarRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Size(max = 100) String apellido,
        @NotNull RolNombre rol,
        @NotNull EstadoUsuario estado) {
}
