package unju.talleres.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import unju.talleres.common.exception.NegocioException;
import org.springframework.http.HttpStatus;

/** Acceso al usuario autenticado desde los servicios. */
@Component
public class UsuarioActual {

    public UsuarioPrincipal get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UsuarioPrincipal principal)) {
            throw new NegocioException(HttpStatus.UNAUTHORIZED, "Debe iniciar sesión");
        }
        return principal;
    }
}
