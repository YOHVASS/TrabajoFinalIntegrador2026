package unju.talleres.participantes.dto;

import unju.talleres.participantes.model.EstadoHabilitacion;

/**
 * Credencial digital (RN-07). El frontend dibuja el QR a partir de {@code qrCode}
 * (por ejemplo con la librería "qrcode.react"); el lector del control de ingreso envía ese mismo texto.
 */
public record CredencialResponse(
        Long idParticipante,
        String dni,
        String nombre,
        String apellido,
        String fotoUrl,
        String qrCode,
        EstadoHabilitacion estadoHabilitacion) {
}
