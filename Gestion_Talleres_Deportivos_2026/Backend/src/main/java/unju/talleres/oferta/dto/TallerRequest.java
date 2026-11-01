package unju.talleres.oferta.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import unju.talleres.oferta.model.Modalidad;

import java.util.List;

/**
 * Alta/modificación de taller. {@code horarios} e {@code idsAyudantes} reemplazan los actuales.
 * {@code cupoMaximo} null = sin límite.
 */
public record TallerRequest(
        @NotNull Long idDisciplina,
        @NotNull Long idProfesor,
        @NotNull Long idPeriodo,
        @NotBlank @Size(max = 100) String nombre,
        @NotNull Modalidad modalidad,
        @Positive Integer cupoMaximo,
        @Valid List<HorarioDto> horarios,
        List<Long> idsAyudantes) {
}
