package unju.talleres.ingreso.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import unju.talleres.ingreso.model.MetodoVerificacion;

/**
 * RF-10/11/12. {@code valor} es el texto leído del QR (token UUID) o el número de DNI.
 */
public record IngresoRequest(
        @NotNull MetodoVerificacion metodo,
        @NotBlank String valor,
        @NotNull Long idTaller) {
}
