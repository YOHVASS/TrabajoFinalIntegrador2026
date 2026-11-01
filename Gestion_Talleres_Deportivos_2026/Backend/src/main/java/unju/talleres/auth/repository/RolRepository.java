package unju.talleres.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unju.talleres.auth.model.Rol;
import unju.talleres.auth.model.RolNombre;

import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(RolNombre nombre);
}
