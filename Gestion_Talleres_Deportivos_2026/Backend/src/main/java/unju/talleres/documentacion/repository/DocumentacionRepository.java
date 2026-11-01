package unju.talleres.documentacion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.documentacion.model.Documentacion;

import java.time.LocalDate;
import java.util.List;

public interface DocumentacionRepository extends JpaRepository<Documentacion, Long> {

    List<Documentacion> findByParticipanteIdOrderByFechaPresentacionDesc(Long idParticipante);

    boolean existsByTipoDocumentoId(Long idTipoDocumento);

    /** Tarea diaria: marca como VENCIDO lo que venció. */
    @Modifying
    @Query("""
            update Documentacion d set d.estado = unju.talleres.documentacion.model.EstadoDocumentacion.VENCIDO
            where d.fechaVencimiento < :hoy
              and d.estado <> unju.talleres.documentacion.model.EstadoDocumentacion.VENCIDO
            """)
    int marcarVencidos(LocalDate hoy);
}
