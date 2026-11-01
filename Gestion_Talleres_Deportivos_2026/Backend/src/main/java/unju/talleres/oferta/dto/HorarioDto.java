package unju.talleres.oferta.dto;

import jakarta.validation.constraints.NotNull;
import unju.talleres.oferta.model.DiaSemana;
import unju.talleres.oferta.model.HorarioTaller;

import java.time.LocalTime;

/** Horas en formato "HH:mm" o "HH:mm:ss". */
public record HorarioDto(
        Long id,
        @NotNull DiaSemana diaSemana,
        @NotNull LocalTime horaInicio,
        @NotNull LocalTime horaFin) {

    public static HorarioDto de(HorarioTaller h) {
        return new HorarioDto(h.getId(), h.getDiaSemana(), h.getHoraInicio(), h.getHoraFin());
    }
}
