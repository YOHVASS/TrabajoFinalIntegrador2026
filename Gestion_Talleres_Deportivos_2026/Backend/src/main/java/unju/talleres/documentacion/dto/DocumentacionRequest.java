package unju.talleres.documentacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * RF-05. {@code archivoUrl} es la URL devuelta por POST /api/archivos.
 * {@code fechaVencimiento} solo aplica si el tipo de documento tiene vencimiento.
 */
public record DocumentacionRequest(
        @NotNull Long idTipoDocumento,
        @NotBlank @Size(max = 255) String archivoUrl,
        @NotNull @PastOrPresent LocalDate fechaPresentacion,
        LocalDate fechaVencimiento) {
}
