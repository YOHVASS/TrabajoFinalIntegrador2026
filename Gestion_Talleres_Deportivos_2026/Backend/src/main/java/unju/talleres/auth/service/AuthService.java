package unju.talleres.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.auth.dto.LoginRequest;
import unju.talleres.auth.dto.LoginResponse;
import unju.talleres.auth.dto.UsuarioResponse;
import unju.talleres.auth.repository.UsuarioSistemaRepository;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.security.JwtService;
import unju.talleres.common.security.UsuarioPrincipal;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioSistemaRepository usuarios;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
                       UsuarioSistemaRepository usuarios) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.nombreUsuario().trim().toLowerCase(), req.password()));
        UsuarioPrincipal principal = (UsuarioPrincipal) auth.getPrincipal();
        String token = jwtService.generarToken(principal);
        return new LoginResponse(token, "Bearer", jwtService.getExpiracionSegundos(), perfil(principal.getId()));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse perfil(Long idUsuario) {
        return usuarios.findById(idUsuario).map(UsuarioResponse::de)
                .orElseThrow(() -> new NoEncontradoException("Usuario", idUsuario));
    }
}
