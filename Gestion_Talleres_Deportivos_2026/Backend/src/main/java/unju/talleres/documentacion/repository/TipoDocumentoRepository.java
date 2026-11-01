package unju.talleres.documentacion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unju.talleres.documentacion.model.TipoDocumento;

import java.util.List;

public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Long> {

    List<TipoDocumento> findByObligatorioTrue();

    List<TipoDocumento> findAllByOrderByNombreAsc();

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
