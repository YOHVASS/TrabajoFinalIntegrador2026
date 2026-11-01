package unju.talleres.portal.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.auth.repository.UsuarioSistemaRepository;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.security.UsuarioActual;
import unju.talleres.common.util.Fechas;
import unju.talleres.portal.dto.NoticiaRequest;
import unju.talleres.portal.dto.NoticiaResponse;
import unju.talleres.portal.model.Noticia;
import unju.talleres.portal.model.TipoNoticia;
import unju.talleres.portal.repository.NoticiaRepository;

/** Módulo Portal público / Noticias (RF-15). */
@Service
public class NoticiaService {

    private final NoticiaRepository noticias;
    private final UsuarioSistemaRepository usuarios;
    private final UsuarioActual usuarioActual;
    private final Fechas fechas;

    public NoticiaService(NoticiaRepository noticias, UsuarioSistemaRepository usuarios, UsuarioActual usuarioActual,
                          Fechas fechas) {
        this.noticias = noticias;
        this.usuarios = usuarios;
        this.usuarioActual = usuarioActual;
        this.fechas = fechas;
    }

    private static PageRequest pagina(int pagina, int tamanio) {
        return PageRequest.of(pagina, Math.min(tamanio, 50), Sort.by(Sort.Direction.DESC, "fechaPublicacion"));
    }

    @Transactional(readOnly = true)
    public PaginaResponse<NoticiaResponse> publicadas(TipoNoticia tipo, int pagina, int tamanio) {
        return PaginaResponse.de(noticias.publicadas(fechas.ahora(), tipo, pagina(pagina, tamanio)), NoticiaResponse::de);
    }

    @Transactional(readOnly = true)
    public NoticiaResponse publicada(Long id) {
        Noticia n = buscar(id);
        if (n.getFechaPublicacion().isAfter(fechas.ahora())) {
            throw new NoEncontradoException("Noticia", id);
        }
        return NoticiaResponse.de(n);
    }

    @Transactional(readOnly = true)
    public PaginaResponse<NoticiaResponse> todas(TipoNoticia tipo, int pagina, int tamanio) {
        return PaginaResponse.de(noticias.todas(tipo, pagina(pagina, tamanio)), NoticiaResponse::de);
    }

    @Transactional
    public NoticiaResponse crear(NoticiaRequest req) {
        Noticia n = new Noticia();
        n.setUsuario(usuarios.getReferenceById(usuarioActual.get().getId()));
        copiar(req, n);
        noticias.save(n);
        return NoticiaResponse.de(noticias.findById(n.getId()).orElseThrow());
    }

    @Transactional
    public NoticiaResponse actualizar(Long id, NoticiaRequest req) {
        Noticia n = buscar(id);
        copiar(req, n);
        return NoticiaResponse.de(n);
    }

    @Transactional
    public void eliminar(Long id) {
        noticias.delete(buscar(id));
    }

    private void copiar(NoticiaRequest req, Noticia n) {
        n.setTitulo(req.titulo().trim());
        n.setContenido(req.contenido());
        n.setTipo(req.tipo());
        n.setFechaPublicacion(req.fechaPublicacion() != null ? req.fechaPublicacion() : fechas.ahora());
    }

    private Noticia buscar(Long id) {
        return noticias.findById(id).orElseThrow(() -> new NoEncontradoException("Noticia", id));
    }
}
