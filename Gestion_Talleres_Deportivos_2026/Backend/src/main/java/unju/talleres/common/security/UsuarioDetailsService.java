package unju.talleres.common.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.auth.repository.UsuarioSistemaRepository;

@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioSistemaRepository usuarios;

    public UsuarioDetailsService(UsuarioSistemaRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) {
        return usuarios.findByNombreUsuario(username)
                .map(UsuarioPrincipal::de)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario inexistente"));
    }
}
