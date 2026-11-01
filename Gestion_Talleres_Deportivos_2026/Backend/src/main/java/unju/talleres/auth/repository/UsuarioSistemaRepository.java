package unju.talleres.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unju.talleres.auth.model.UsuarioSistema;

import java.util.Optional;

public interface UsuarioSistemaRepository extends JpaRepository<UsuarioSistema, Long> {

    Optional<UsuarioSistema> findByNombreUsuario(String nombreUsuario);

    boolean existsByNombreUsuario(String nombreUsuario);
}
