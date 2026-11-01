package unju.talleres.alertas.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.alertas.model.Alerta;
import unju.talleres.alertas.model.EstadoAlerta;
import unju.talleres.alertas.model.TipoAlerta;

import java.util.List;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {

    List<Alerta> findByParticipanteIdAndEstado(Long idParticipante, EstadoAlerta estado);

    List<Alerta> findByParticipanteIdOrderByFechaGeneradaDesc(Long idParticipante);

    @Query(value = """
            select a from Alerta a join fetch a.participante p
            where (:estado is null or a.estado = :estado)
              and (:tipo is null or a.tipo = :tipo)
              and (:idParticipante is null or p.id = :idParticipante)
            """,
            countQuery = """
            select count(a) from Alerta a
            where (:estado is null or a.estado = :estado)
              and (:tipo is null or a.tipo = :tipo)
              and (:idParticipante is null or a.participante.id = :idParticipante)
            """)
    Page<Alerta> buscar(EstadoAlerta estado, TipoAlerta tipo, Long idParticipante, Pageable pageable);

    long countByEstado(EstadoAlerta estado);
}
