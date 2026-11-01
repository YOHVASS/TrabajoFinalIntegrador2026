package unju.talleres.preinscripcion.dto;

import java.util.List;

/**
 * Resultado de aprobar una preinscripción: la inscripción creada y, como aviso, los requisitos
 * que todavía le faltan al participante para poder ingresar (RN-05, RN-06).
 */
public record AprobacionResponse(
        InscripcionResponse inscripcion,
        String qrCode,
        List<String> requisitosPendientes) {
}
