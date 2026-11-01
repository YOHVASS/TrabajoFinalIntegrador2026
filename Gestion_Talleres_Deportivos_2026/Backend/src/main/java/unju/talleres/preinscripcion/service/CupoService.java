package unju.talleres.preinscripcion.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.oferta.model.Taller;
import unju.talleres.preinscripcion.model.EstadoInscripcion;
import unju.talleres.preinscripcion.model.EstadoPreinscripcion;
import unju.talleres.preinscripcion.model.Preinscripcion;
import unju.talleres.preinscripcion.repository.InscripcionRepository;
import unju.talleres.preinscripcion.repository.PreinscripcionRepository;

import java.util.List;

/**
 * Control de cupo y lista de espera (RN-13).
 * <p>
 * Lugares ocupados = inscripciones ACTIVAS + preinscripciones PENDIENTES (en revisión),
 * porque según el flujo una preinscripción solo pasa a revisión si hay cupo.
 * Cuando se libera un lugar (baja de inscripción, rechazo de una pendiente o ampliación del cupo),
 * la preinscripción más antigua en LISTA_ESPERA pasa a PENDIENTE (vuelve a revisión administrativa).
 */
@Service
public class CupoService {

    private final InscripcionRepository inscripciones;
    private final PreinscripcionRepository preinscripciones;

    public CupoService(InscripcionRepository inscripciones, PreinscripcionRepository preinscripciones) {
        this.inscripciones = inscripciones;
        this.preinscripciones = preinscripciones;
    }

    public record Ocupacion(long inscriptosActivos, long pendientesRevision, long enListaEspera,
                            Integer cupoMaximo, Long lugaresDisponibles) {

        public boolean hayCupo() {
            return lugaresDisponibles == null || lugaresDisponibles > 0;
        }

        public long ocupados() {
            return inscriptosActivos + pendientesRevision;
        }
    }

    @Transactional(readOnly = true)
    public Ocupacion ocupacion(Taller taller) {
        long activos = inscripciones.countByTallerIdAndEstado(taller.getId(), EstadoInscripcion.ACTIVA);
        long pendientes = preinscripciones.countByTallerIdAndEstado(taller.getId(), EstadoPreinscripcion.PENDIENTE);
        long espera = preinscripciones.countByTallerIdAndEstado(taller.getId(), EstadoPreinscripcion.LISTA_ESPERA);
        Long disponibles = taller.getCupoMaximo() == null ? null
                : Math.max(0, taller.getCupoMaximo() - (activos + pendientes));
        return new Ocupacion(activos, pendientes, espera, taller.getCupoMaximo(), disponibles);
    }

    /** Pasa a PENDIENTE tantas preinscripciones en espera como lugares libres haya. Devuelve cuántas promovió. */
    @Transactional
    public int promoverListaEspera(Taller taller) {
        List<Preinscripcion> espera = preinscripciones
                .findByTallerIdAndEstadoOrderByFechaSolicitudAscIdAsc(taller.getId(), EstadoPreinscripcion.LISTA_ESPERA);
        if (espera.isEmpty()) {
            return 0;
        }
        Ocupacion oc = ocupacion(taller);
        long libres = oc.lugaresDisponibles() == null ? espera.size() : oc.lugaresDisponibles();
        int promovidas = 0;
        for (Preinscripcion p : espera) {
            if (promovidas >= libres) {
                break;
            }
            p.setEstado(EstadoPreinscripcion.PENDIENTE);
            promovidas++;
        }
        preinscripciones.flush();
        return promovidas;
    }
}
