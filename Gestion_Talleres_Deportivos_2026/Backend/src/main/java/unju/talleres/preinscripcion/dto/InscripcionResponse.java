package unju.talleres.preinscripcion.dto;

import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.participantes.model.Participante;
import unju.talleres.preinscripcion.model.EstadoInscripcion;
import unju.talleres.preinscripcion.model.Inscripcion;

import java.time.LocalDate;

/** Datos mínimos (RN-11): apto para que profesores y ayudantes vean su lista de inscriptos. */
public record InscripcionResponse(
        Long id,
        LocalDate fechaInscripcion,
        EstadoInscripcion estado,
        Long idPreinscripcion,
        Long idParticipante,
        String dni,
        String nombre,
        String apellido,
        String fotoUrl,
        EstadoHabilitacion estadoHabilitacion,
        Long idTaller,
        String taller,
        String periodo) {

    public static InscripcionResponse de(Inscripcion i) {
        Participante p = i.getParticipante();
        return new InscripcionResponse(i.getId(), i.getFechaInscripcion(), i.getEstado(), i.getPreinscripcion().getId(),
                p.getId(), p.getDni(), p.getNombre(), p.getApellido(), p.getFotoUrl(), p.getEstadoHabilitacion(),
                i.getTaller().getId(), i.getTaller().getNombre(), i.getTaller().getPeriodo().getCodigo());
    }
}
