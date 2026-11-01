package unju.talleres.oferta.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unju.talleres.oferta.model.Disciplina;

public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
