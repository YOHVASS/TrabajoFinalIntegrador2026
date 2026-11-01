package unju.talleres.preinscripcion.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.preinscripcion.model.EstadoPreinscripcion;
import unju.talleres.preinscripcion.model.Preinscripcion;

import java.util.Collection;
import java.util.List;

public interface PreinscripcionRepository extends JpaRepository<Preinscripcion, Long> {

    long countByTallerIdAndEstado(Long idTaller, EstadoPreinscripcion estado);

    boolean existsByParticipanteIdAndTallerIdAndEstadoIn(Long idParticipante, Long idTaller,
                                                        Collection<EstadoPreinscripcion> estados);

    /** Lista de espera en orden de llegada (RN-13). */
    List<Preinscripcion> findByTallerIdAndEstadoOrderByFechaSolicitudAscIdAsc(Long idTaller,
                                                                              EstadoPreinscripcion estado);

    List<Preinscripcion> findByParticipanteIdOrderByFechaSolicitudDesc(Long idParticipante);

    @Query("""
            select p from Preinscripcion p
            where (:estado is null or p.estado = :estado)
              and (:idTaller is null or p.taller.id = :idTaller)
              and (:idPeriodo is null or p.taller.periodo.id = :idPeriodo)
            """)
    Page<Preinscripcion> buscar(EstadoPreinscripcion estado, Long idTaller, Long idPeriodo, Pageable pageable);

    boolean existsByTallerId(Long idTaller);
}
