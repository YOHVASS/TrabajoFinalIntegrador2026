package unju.talleres.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import unju.talleres.portal.model.TipoNoticia;

import java.time.OffsetDateTime;

/** RF-15. Si no se envía {@code fechaPublicacion}, se publica en el momento. */
public record NoticiaRequest(
        @NotBlank @Size(max = 150) String titulo,
        @NotBlank String contenido,
        @NotNull TipoNoticia tipo,
        OffsetDateTime fechaPublicacion) {
}
