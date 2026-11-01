package unju.talleres.oferta.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unju.talleres.oferta.model.Ayudante;

import java.util.List;
import java.util.Optional;

public interface AyudanteRepository extends JpaRepository<Ayudante, Long> {

    boolean existsByDni(String dni);

    boolean existsByDniAndIdNot(String dni, Long id);

    Optional<Ayudante> findByUsuarioId(Long idUsuario);

    boolean existsByUsuarioIdAndIdNot(Long idUsuario, Long id);

    List<Ayudante> findAllByOrderByApellidoAscNombreAsc();
}
