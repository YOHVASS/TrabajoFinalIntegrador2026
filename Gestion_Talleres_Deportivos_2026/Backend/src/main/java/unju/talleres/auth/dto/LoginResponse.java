package unju.talleres.auth.dto;

/**
 * Respuesta del login. El frontend guarda {@code token} y lo envía en
 * {@code Authorization: Bearer <token>} en cada request al sistema interno.
 */
public record LoginResponse(
        String token,
        String tipo,
        long expiraEnSegundos,
        UsuarioResponse usuario) {
}
