package unju.talleres.auth.dto;

import unju.talleres.auth.model.EstadoUsuario;
import unju.talleres.auth.model.RolNombre;
import unju.talleres.auth.model.UsuarioSistema;

public record UsuarioResponse(
        Long id,
        String nombreUsuario,
        String nombre,
        String apellido,
        RolNombre rol,
        EstadoUsuario estado) {

    public static UsuarioResponse de(UsuarioSistema u) {
        return new UsuarioResponse(u.getId(), u.getNombreUsuario(), u.getNombre(), u.getApellido(),
                u.getRol().getNombre(), u.getEstado());
    }
}
