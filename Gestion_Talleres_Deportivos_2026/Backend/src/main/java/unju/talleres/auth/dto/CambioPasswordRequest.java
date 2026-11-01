package unju.talleres.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * {@code passwordActual} es obligatoria cuando el usuario cambia su propia contraseña;
 * el ADMIN_SISTEMA puede resetear la de otro usuario sin enviarla.
 */
public record CambioPasswordRequest(
        String passwordActual,
        @NotBlank @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres") String passwordNueva) {
}
