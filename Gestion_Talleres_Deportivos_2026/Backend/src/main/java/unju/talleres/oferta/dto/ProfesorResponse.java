package unju.talleres.oferta.dto;

import unju.talleres.oferta.model.Profesor;

public record ProfesorResponse(
        Long id,
        String dni,
        String nombre,
        String apellido,
        String email,
        String telefono,
        Long idUsuario,
        String nombreUsuario) {

    public static ProfesorResponse de(Profesor p) {
        return new ProfesorResponse(p.getId(), p.getDni(), p.getNombre(), p.getApellido(), p.getEmail(),
                p.getTelefono(),
                p.getUsuario() == null ? null : p.getUsuario().getId(),
                p.getUsuario() == null ? null : p.getUsuario().getNombreUsuario());
    }
}
