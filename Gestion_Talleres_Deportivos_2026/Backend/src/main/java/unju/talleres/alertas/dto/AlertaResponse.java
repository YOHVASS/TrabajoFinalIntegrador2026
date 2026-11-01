package unju.talleres.alertas.dto;

import unju.talleres.alertas.model.Alerta;
import unju.talleres.alertas.model.EstadoAlerta;
import unju.talleres.alertas.model.TipoAlerta;

import java.time.OffsetDateTime;

public record AlertaResponse(
        Long id,
        Long idParticipante,
        String dni,
        String participante,
        TipoAlerta tipo,
        String mensaje,
        OffsetDateTime fechaGenerada,
        EstadoAlerta estado) {

    public static AlertaResponse de(Alerta a) {
        var p = a.getParticipante();
        return new AlertaResponse(a.getId(), p.getId(), p.getDni(), p.getApellido() + ", " + p.getNombre(),
                a.getTipo(), a.getMensaje(), a.getFechaGenerada(), a.getEstado());
    }
}
