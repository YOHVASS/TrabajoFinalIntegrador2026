package unju.talleres.participantes.dto;

import jakarta.validation.constraints.*;
import unju.talleres.participantes.model.Sexo;

import java.time.LocalDate;

/** RF-04: datos personales del participante. */
public record ParticipanteRequest(
        @NotBlank @Pattern(regexp = "\\d{7,15}", message = "El DNI debe tener solo números (7 a 15 dígitos)") String dni,
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Size(max = 100) String apellido,
        @NotNull @Past(message = "La fecha de nacimiento debe ser pasada") LocalDate fechaNacimiento,
        @NotNull Sexo sexo,
        @Size(max = 100) String facultad,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(max = 30) String telefono,
        @Size(max = 255) String fotoUrl) {
}
