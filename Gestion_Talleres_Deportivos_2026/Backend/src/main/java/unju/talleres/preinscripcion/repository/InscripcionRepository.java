package unju.talleres.preinscripcion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.preinscripcion.model.EstadoInscripcion;
import unju.talleres.preinscripcion.model.Inscripcion;

import java.util.List;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

    long countByTallerIdAndEstado(Long idTaller, EstadoInscripcion estado);

    boolean existsByParticipanteIdAndTallerIdAndEstado(Long idParticipante, Long idTaller, EstadoInscripcion estado);

    boolean existsByParticipanteIdAndEstado(Long idParticipante, EstadoInscripcion estado);

    List<Inscripcion> findByParticipanteIdOrderByFechaInscripcionDesc(Long idParticipante);

    @Query("""
            select i from Inscripcion i join fetch i.participante p
            where i.taller.id = :idTaller and (:estado is null or i.estado = :estado)
            order by p.apellido, p.nombre
            """)
    List<Inscripcion> delTaller(Long idTaller, EstadoInscripcion estado);

    /** IDs de participantes con al menos una inscripción activa (para generar alertas). */
    @Query("select distinct i.participante.id from Inscripcion i where i.estado = unju.talleres.preinscripcion.model.EstadoInscripcion.ACTIVA")
    List<Long> idsParticipantesActivos();
}
