package unju.talleres.oferta.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import unju.talleres.oferta.model.Modalidad;
import unju.talleres.oferta.model.Taller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TallerRepository extends JpaRepository<Taller, Long> {

    @Query("""
            select t from Taller t
            where (:idDisciplina is null or t.disciplina.id = :idDisciplina)
              and (:idPeriodo is null or t.periodo.id = :idPeriodo)
              and (:modalidad is null or t.modalidad = :modalidad)
              and (:idProfesor is null or t.profesor.id = :idProfesor)
            order by t.disciplina.nombre, t.nombre
            """)
    List<Taller> buscar(Long idDisciplina, Long idPeriodo, Modalidad modalidad, Long idProfesor);

    /** Oferta pública: talleres de períodos que todavía no terminaron. */
    @Query("""
            select t from Taller t
            where t.periodo.fechaFin >= :hoy
              and (:idDisciplina is null or t.disciplina.id = :idDisciplina)
              and (:modalidad is null or t.modalidad = :modalidad)
            order by t.disciplina.nombre, t.nombre
            """)
    List<Taller> ofertaVigente(LocalDate hoy, Long idDisciplina, Modalidad modalidad);

    /** Talleres donde el usuario es profesor a cargo o ayudante. */
    @Query("""
            select distinct t from Taller t
              left join t.profesor p left join p.usuario pu
              left join t.ayudantes a left join a.usuario au
            where pu.id = :idUsuario or au.id = :idUsuario
            order by t.nombre
            """)
    List<Taller> delUsuarioDocente(Long idUsuario);

    @Query("""
            select case when count(t) > 0 then true else false end from Taller t
              left join t.profesor p left join p.usuario pu
              left join t.ayudantes a left join a.usuario au
            where t.id = :idTaller and (pu.id = :idUsuario or au.id = :idUsuario)
            """)
    boolean esDocenteDelTaller(Long idTaller, Long idUsuario);

    boolean existsByDisciplinaId(Long idDisciplina);

    boolean existsByPeriodoId(Long idPeriodo);

    boolean existsByProfesorId(Long idProfesor);

    /** Bloquea la fila del taller durante la transacción para que dos preinscripciones simultáneas no superen el cupo. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Taller t where t.id = :id")
    Optional<Taller> findByIdParaActualizar(Long id);
}
