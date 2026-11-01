package unju.talleres.common.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import unju.talleres.auth.model.RolNombre;
import unju.talleres.auth.model.UsuarioSistema;

import java.util.Collection;
import java.util.List;

/** Usuario autenticado. La autoridad es "ROLE_" + nombre del rol. */
public class UsuarioPrincipal implements UserDetails {

    private final Long id;
    private final String nombreUsuario;
    private final String passwordHash;
    private final RolNombre rol;
    private final boolean activo;

    public UsuarioPrincipal(Long id, String nombreUsuario, String passwordHash, RolNombre rol, boolean activo) {
        this.id = id;
        this.nombreUsuario = nombreUsuario;
        this.passwordHash = passwordHash;
        this.rol = rol;
        this.activo = activo;
    }

    public static UsuarioPrincipal de(UsuarioSistema u) {
        return new UsuarioPrincipal(u.getId(), u.getNombreUsuario(), u.getPasswordHash(),
                u.getRol().getNombre(), u.isActivo());
    }

    public Long getId() {
        return id;
    }

    public RolNombre getRol() {
        return rol;
    }

    public boolean tieneRol(RolNombre... roles) {
        for (RolNombre r : roles) {
            if (r == rol) {
                return true;
            }
        }
        return false;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return nombreUsuario;
    }

    @Override
    public boolean isEnabled() {
        return activo;
    }
}
