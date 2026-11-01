package unju.talleres.preinscripcion.dto;

import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.model.Sexo;
import unju.talleres.preinscripcion.model.EstadoPreinscripcion;
import unju.talleres.preinscripcion.model.Preinscripcion;

import java.time.OffsetDateTime;

/** Vista para la revisión administrativa (RF-03). */
public record PreinscripcionResponse(
        Long id,
        OffsetDateTime fechaSolicitud,
        EstadoPreinscripcion estado,
        Long idParticipante,
        String dni,
        String nombre,
        String apellido,
        Sexo sexo,
        String facultad,
        String email,
        String telefono,
        EstadoHabilitacion estadoHabilitacion,
        Long idTaller,
        String taller,
        String disciplina,
        String periodo) {

    public static PreinscripcionResponse de(Preinscripcion pr) {
        Participante p = pr.getParticipante();
        var t = pr.getTaller();
        return new PreinscripcionResponse(pr.getId(), pr.getFechaSolicitud(), pr.getEstado(),
                p.getId(), p.getDni(), p.getNombre(), p.getApellido(), p.getSexo(), p.getFacultad(), p.getEmail(),
                p.getTelefono(), p.getEstadoHabilitacion(),
                t.getId(), t.getNombre(), t.getDisciplina().getNombre(), t.getPeriodo().getCodigo());
    }
}
