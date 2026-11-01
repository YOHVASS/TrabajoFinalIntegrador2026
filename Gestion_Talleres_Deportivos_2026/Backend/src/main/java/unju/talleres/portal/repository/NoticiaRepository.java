package unju.talleres.portal.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.portal.model.Noticia;
import unju.talleres.portal.model.TipoNoticia;

import java.time.OffsetDateTime;

public interface NoticiaRepository extends JpaRepository<Noticia, Long> {

    /** Publicadas (fecha de publicación ya alcanzada); permite programar publicaciones a futuro. */
    @Query("""
            select n from Noticia n
            where n.fechaPublicacion <= :ahora and (:tipo is null or n.tipo = :tipo)
            """)
    Page<Noticia> publicadas(OffsetDateTime ahora, TipoNoticia tipo, Pageable pageable);

    @Query("select n from Noticia n where (:tipo is null or n.tipo = :tipo)")
    Page<Noticia> todas(TipoNoticia tipo, Pageable pageable);
}
