package unju.talleres.oferta.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfesorRequest(
        @NotBlank @Pattern(regexp = "\\d{7,15}", message = "El DNI debe tener solo números (7 a 15 dígitos)") String dni,
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Size(max = 100) String apellido,
        @Email @Size(max = 150) String email,
        @Size(max = 30) String telefono,
        Long idUsuario) {
}
