package unju.talleres.oferta.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unju.talleres.oferta.model.Profesor;

import java.util.List;
import java.util.Optional;

public interface ProfesorRepository extends JpaRepository<Profesor, Long> {

    boolean existsByDni(String dni);

    boolean existsByDniAndIdNot(String dni, Long id);

    Optional<Profesor> findByUsuarioId(Long idUsuario);

    boolean existsByUsuarioIdAndIdNot(Long idUsuario, Long id);

    List<Profesor> findAllByOrderByApellidoAscNombreAsc();
}
