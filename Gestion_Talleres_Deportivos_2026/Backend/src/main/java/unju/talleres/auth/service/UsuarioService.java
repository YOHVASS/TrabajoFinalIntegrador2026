package unju.talleres.auth.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.auth.dto.*;
import unju.talleres.auth.model.EstadoUsuario;
import unju.talleres.auth.model.Rol;
import unju.talleres.auth.model.RolNombre;
import unju.talleres.auth.model.UsuarioSistema;
import unju.talleres.auth.repository.RolRepository;
import unju.talleres.auth.repository.UsuarioSistemaRepository;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.security.UsuarioActual;
import unju.talleres.common.security.UsuarioPrincipal;

import java.util.List;

/** Gestión de usuarios internos y asignación de roles (RF-17). */
@Service
public class UsuarioService {

    private final UsuarioSistemaRepository usuarios;
    private final RolRepository roles;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioActual usuarioActual;

    public UsuarioService(UsuarioSistemaRepository usuarios, RolRepository roles, PasswordEncoder passwordEncoder,
                          UsuarioActual usuarioActual) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.passwordEncoder = passwordEncoder;
        this.usuarioActual = usuarioActual;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarios.findAll().stream()
                .sorted((a, b) -> a.getNombreUsuario().compareToIgnoreCase(b.getNombreUsuario()))
                .map(UsuarioResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        return UsuarioResponse.de(buscar(id));
    }

    @Transactional(readOnly = true)
    public List<RolResponse> listarRoles() {
        return roles.findAll().stream().map(RolResponse::de).toList();
    }

    @Transactional
    public UsuarioResponse crear(UsuarioCrearRequest req) {
        String nombreUsuario = req.nombreUsuario().trim().toLowerCase();
        if (usuarios.existsByNombreUsuario(nombreUsuario)) {
            throw new NegocioException("Ya existe un usuario con el nombre '" + nombreUsuario + "'");
        }
        UsuarioSistema u = new UsuarioSistema();
        u.setNombreUsuario(nombreUsuario);
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setNombre(req.nombre().trim());
        u.setApellido(req.apellido().trim());
        u.setRol(rol(req.rol()));
        u.setEstado(EstadoUsuario.ACTIVO);
        return UsuarioResponse.de(usuarios.save(u));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioActualizarRequest req) {
        UsuarioSistema u = buscar(id);
        if (u.getId().equals(usuarioActual.get().getId())
                && (req.estado() == EstadoUsuario.INACTIVO || req.rol() != RolNombre.ADMIN_SISTEMA)) {
            throw new NegocioException("No puede desactivarse ni quitarse el rol de administrador a sí mismo");
        }
        u.setNombre(req.nombre().trim());
        u.setApellido(req.apellido().trim());
        u.setRol(rol(req.rol()));
        u.setEstado(req.estado());
        return UsuarioResponse.de(u);
    }

    /**
     * Cambio de contraseña. El propio usuario debe enviar la actual; el ADMIN_SISTEMA puede
     * resetear la de cualquier otro usuario.
     */
    @Transactional
    public void cambiarPassword(Long id, CambioPasswordRequest req) {
        UsuarioPrincipal actual = usuarioActual.get();
        UsuarioSistema u = buscar(id);
        boolean esPropio = u.getId().equals(actual.getId());
        if (!esPropio && !actual.tieneRol(RolNombre.ADMIN_SISTEMA)) {
            throw new NegocioException(HttpStatus.FORBIDDEN, "Solo puede cambiar su propia contraseña");
        }
        if (esPropio && (req.passwordActual() == null
                || !passwordEncoder.matches(req.passwordActual(), u.getPasswordHash()))) {
            throw new NegocioException(HttpStatus.BAD_REQUEST, "La contraseña actual no es correcta");
        }
        u.setPasswordHash(passwordEncoder.encode(req.passwordNueva()));
    }

    @Transactional(readOnly = true)
    public UsuarioSistema buscar(Long id) {
        return usuarios.findById(id).orElseThrow(() -> new NoEncontradoException("Usuario", id));
    }

    private Rol rol(RolNombre nombre) {
        return roles.findByNombre(nombre)
                .orElseThrow(() -> new NoEncontradoException("Rol inexistente: " + nombre));
    }
}
