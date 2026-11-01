package unju.talleres.ingreso.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.ingreso.model.Asistencia;
import unju.talleres.ingreso.model.ResultadoHabilitacion;

import java.time.LocalDate;
import java.util.Optional;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {

    Optional<Asistencia> findFirstByParticipanteIdAndTallerIdAndFechaAndResultadoHabilitacion(
            Long idParticipante, Long idTaller, LocalDate fecha, ResultadoHabilitacion resultado);

    @Query("""
            select a from Asistencia a
            where (:idTaller is null or a.taller.id = :idTaller)
              and (:idParticipante is null or a.participante.id = :idParticipante)
              and (:resultado is null or a.resultadoHabilitacion = :resultado)
              and a.fecha between :desde and :hasta
            """)
    Page<Asistencia> buscar(Long idTaller, Long idParticipante, ResultadoHabilitacion resultado,
                            LocalDate desde, LocalDate hasta, Pageable pageable);
}