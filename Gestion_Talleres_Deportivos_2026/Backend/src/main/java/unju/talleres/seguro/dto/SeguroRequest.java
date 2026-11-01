package unju.talleres.seguro.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * RF-06: registro del pago del seguro anual.
 * Si no se envía {@code idPeriodo} se usa el período vigente; si no se envían las fechas de vigencia,
 * se toma desde la fecha de pago y por un año.
 */
public record SeguroRequest(
        Long idPeriodo,
        @Size(max = 50) String numeroPoliza,
        @NotNull @PastOrPresent LocalDate fechaPago,
        LocalDate vigenciaDesde,
        LocalDate vigenciaHasta) {
}
