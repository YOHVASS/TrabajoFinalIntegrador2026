package unju.talleres.oferta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import unju.talleres.oferta.model.Periodo;

import java.time.LocalDate;

/** Request: codigo, fechaInicio, fechaFin. Response: agrega id y si está vigente hoy. */
public record PeriodoDto(
        Long id,
        @NotBlank @Size(max = 20) String codigo,
        @NotNull LocalDate fechaInicio,
        @NotNull LocalDate fechaFin,
        Boolean vigente) {

    public static PeriodoDto de(Periodo p, LocalDate hoy) {
        return new PeriodoDto(p.getId(), p.getCodigo(), p.getFechaInicio(), p.getFechaFin(), p.incluye(hoy));
    }
}
