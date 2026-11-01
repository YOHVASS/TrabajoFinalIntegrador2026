package unju.talleres.documentacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import unju.talleres.documentacion.model.TipoDocumento;

public record TipoDocumentoDto(
        Long id,
        @NotBlank @Size(max = 50) String nombre,
        @NotNull Boolean obligatorio,
        @NotNull Boolean tieneVencimiento) {

    public static TipoDocumentoDto de(TipoDocumento t) {
        return new TipoDocumentoDto(t.getId(), t.getNombre(), t.isObligatorio(), t.isTieneVencimiento());
    }
}
