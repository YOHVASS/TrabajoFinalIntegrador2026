package unju.talleres.aptomedico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.aptomedico.model.AptoMedico;

import java.time.LocalDate;
import java.util.List;

public interface AptoMedicoRepository extends JpaRepository<AptoMedico, Long> {

    List<AptoMedico> findByParticipanteIdOrderByFechaEmisionDesc(Long idParticipante);

    @Modifying
    @Query("""
            update AptoMedico a set a.estado = unju.talleres.aptomedico.model.EstadoAptoMedico.VENCIDO
            where a.fechaVencimiento < :hoy and a.estado <> unju.talleres.aptomedico.model.EstadoAptoMedico.VENCIDO
            """)
    int marcarVencidos(LocalDate hoy);
}
