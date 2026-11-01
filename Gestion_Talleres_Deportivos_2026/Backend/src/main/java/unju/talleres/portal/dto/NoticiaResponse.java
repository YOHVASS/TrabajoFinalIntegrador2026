package unju.talleres.portal.dto;

import unju.talleres.portal.model.Noticia;
import unju.talleres.portal.model.TipoNoticia;

import java.time.OffsetDateTime;

public record NoticiaResponse(
        Long id,
        String titulo,
        String contenido,
        TipoNoticia tipo,
        OffsetDateTime fechaPublicacion,
        String autor) {

    public static NoticiaResponse de(Noticia n) {
        return new NoticiaResponse(n.getId(), n.getTitulo(), n.getContenido(), n.getTipo(), n.getFechaPublicacion(),
                n.getUsuario().getNombre() + " " + n.getUsuario().getApellido());
    }
}
