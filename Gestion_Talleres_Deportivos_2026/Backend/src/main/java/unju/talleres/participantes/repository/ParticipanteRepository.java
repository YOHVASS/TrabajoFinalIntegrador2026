package unju.talleres.participantes.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.participantes.model.Participante;

import java.util.Optional;

public interface ParticipanteRepository extends JpaRepository<Participante, Long> {

    Optional<Participante> findByDni(String dni);

    Optional<Participante> findByQrCode(String qrCode);

    boolean existsByDniAndIdNot(String dni, Long id);

    /** Búsqueda por DNI, nombre o apellido; filtro opcional por estado de habilitación. */
    @Query("""
            select p from Participante p
            where (:texto = ''
                   or p.dni like concat(:texto, '%')
                   or lower(p.nombre) like lower(concat('%', :texto, '%'))
                   or lower(p.apellido) like lower(concat('%', :texto, '%')))
              and (:estado is null or p.estadoHabilitacion = :estado)
            """)
    Page<Participante> buscar(String texto, EstadoHabilitacion estado, Pageable pageable);
}
