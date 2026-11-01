package unju.talleres.aptomedico.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * RF-07. Si no se envía {@code fechaVencimiento} se calcula como emisión + 1 año (RN-04).
 * Nunca puede superar ese año.
 */
public record AptoMedicoRequest(
        @NotNull @PastOrPresent LocalDate fechaEmision,
        LocalDate fechaVencimiento,
        @Size(max = 255) String archivoUrl) {
}
