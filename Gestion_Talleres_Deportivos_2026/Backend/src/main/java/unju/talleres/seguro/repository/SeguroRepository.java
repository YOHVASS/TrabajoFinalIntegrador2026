package unju.talleres.seguro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.seguro.model.Seguro;

import java.time.LocalDate;
import java.util.List;

public interface SeguroRepository extends JpaRepository<Seguro, Long> {

    List<Seguro> findByParticipanteIdOrderByVigenciaDesdeDesc(Long idParticipante);

    boolean existsByParticipanteIdAndPeriodoId(Long idParticipante, Long idPeriodo);

    boolean existsByParticipanteIdAndPeriodoIdAndIdNot(Long idParticipante, Long idPeriodo, Long id);

    /** RF-19: altas todavía no informadas a la productora (opcionalmente de un período). */
    @Query("""
            select s from Seguro s join fetch s.participante p
            where s.informadoProductora = false
              and (:idPeriodo is null or s.periodo.id = :idPeriodo)
            order by s.fechaPago, p.apellido, p.nombre
            """)
    List<Seguro> pendientesDeInformar(Long idPeriodo);

    @Modifying
    @Query("""
            update Seguro s set s.estado = unju.talleres.seguro.model.EstadoSeguro.VENCIDO
            where s.vigenciaHasta < :hoy and s.estado <> unju.talleres.seguro.model.EstadoSeguro.VENCIDO
            """)
    int marcarVencidos(LocalDate hoy);
}
