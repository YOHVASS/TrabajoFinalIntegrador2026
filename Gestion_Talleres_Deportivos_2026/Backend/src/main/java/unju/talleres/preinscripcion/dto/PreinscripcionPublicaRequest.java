package unju.talleres.preinscripcion.dto;

import jakarta.validation.constraints.*;
import unju.talleres.participantes.model.Sexo;

import java.time.LocalDate;

/**
 * RF-02: formulario público de preinscripción. Con estos datos mínimos se crea el Participante
 * (o se reutiliza si el DNI ya existe; en ese caso no se modifican sus datos).
 */
public record PreinscripcionPublicaRequest(
        @NotNull Long idTaller,
        @NotBlank @Pattern(regexp = "\\d{7,15}", message = "El DNI debe tener solo números (7 a 15 dígitos)") String dni,
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Size(max = 100) String apellido,
        @NotNull @Past(message = "La fecha de nacimiento debe ser pasada") LocalDate fechaNacimiento,
        @NotNull Sexo sexo,
        @Size(max = 100) String facultad,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(max = 30) String telefono) {
}
