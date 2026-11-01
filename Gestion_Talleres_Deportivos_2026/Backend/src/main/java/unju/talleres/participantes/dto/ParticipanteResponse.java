package unju.talleres.participantes.dto;

import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.model.Sexo;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Ficha completa: solo para ADMINISTRATIVO y COORDINADOR (RN-11). */
public record ParticipanteResponse(
        Long id,
        String dni,
        String nombre,
        String apellido,
        LocalDate fechaNacimiento,
        Sexo sexo,
        String facultad,
        String email,
        String telefono,
        String fotoUrl,
        String qrCode,
        EstadoHabilitacion estadoHabilitacion,
        OffsetDateTime fechaAlta) {

    public static ParticipanteResponse de(Participante p) {
        return new ParticipanteResponse(p.getId(), p.getDni(), p.getNombre(), p.getApellido(), p.getFechaNacimiento(),
                p.getSexo(), p.getFacultad(), p.getEmail(), p.getTelefono(), p.getFotoUrl(), p.getQrCode(),
                p.getEstadoHabilitacion(), p.getFechaAlta());
    }
}
