package unju.talleres.participantes.dto;

import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.participantes.model.Participante;

/**
 * Vista reducida para control de ingreso, profesores y ayudantes (RN-11): sin contacto,
 * fecha de nacimiento ni datos de salud.
 */
public record ParticipanteResumen(
        Long id,
        String dni,
        String nombre,
        String apellido,
        String fotoUrl,
        EstadoHabilitacion estadoHabilitacion) {

    public static ParticipanteResumen de(Participante p) {
        return new ParticipanteResumen(p.getId(), p.getDni(), p.getNombre(), p.getApellido(), p.getFotoUrl(),
                p.getEstadoHabilitacion());
    }
}
