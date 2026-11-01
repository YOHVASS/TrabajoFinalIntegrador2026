package unju.talleres.auth.dto;

import unju.talleres.auth.model.Rol;
import unju.talleres.auth.model.RolNombre;

public record RolResponse(Long id, RolNombre nombre, String descripcion) {

    public static RolResponse de(Rol r) {
        return new RolResponse(r.getId(), r.getNombre(), r.getDescripcion());
    }
}
