package unju.talleres.oferta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import unju.talleres.oferta.model.Disciplina;

/** Se usa como request (sin id) y como response. */
public record DisciplinaDto(
        Long id,
        @NotBlank @Size(max = 50) String nombre,
        @Size(max = 255) String descripcion) {

    public static DisciplinaDto de(Disciplina d) {
        return new DisciplinaDto(d.getId(), d.getNombre(), d.getDescripcion());
    }
}
