package unju.talleres.oferta.dto;

import unju.talleres.oferta.model.Ayudante;

public record AyudanteResponse(
        Long id,
        String dni,
        String nombre,
        String apellido,
        Long idUsuario,
        String nombreUsuario) {

    public static AyudanteResponse de(Ayudante a) {
        return new AyudanteResponse(a.getId(), a.getDni(), a.getNombre(), a.getApellido(),
                a.getUsuario() == null ? null : a.getUsuario().getId(),
                a.getUsuario() == null ? null : a.getUsuario().getNombreUsuario());
    }
}
