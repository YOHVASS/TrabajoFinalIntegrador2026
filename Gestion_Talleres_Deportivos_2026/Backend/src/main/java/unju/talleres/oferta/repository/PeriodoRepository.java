package unju.talleres.oferta.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.oferta.model.Periodo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PeriodoRepository extends JpaRepository<Periodo, Long> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, Long id);

    List<Periodo> findAllByOrderByFechaInicioDesc();

    /** Período que contiene la fecha (si hay varios, el que empezó más tarde). */
    @Query("select p from Periodo p where p.fechaInicio <= :fecha and p.fechaFin >= :fecha order by p.fechaInicio desc")
    List<Periodo> findQueIncluyen(LocalDate fecha);

    default Optional<Periodo> findVigente(LocalDate fecha) {
        return findQueIncluyen(fecha).stream().findFirst();
    }
}
