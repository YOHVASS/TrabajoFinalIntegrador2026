package unju.talleres.oferta.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.auth.model.RolNombre;
import unju.talleres.auth.model.UsuarioSistema;
import unju.talleres.auth.service.UsuarioService;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.oferta.dto.AyudanteRequest;
import unju.talleres.oferta.dto.AyudanteResponse;
import unju.talleres.oferta.dto.ProfesorRequest;
import unju.talleres.oferta.dto.ProfesorResponse;
import unju.talleres.oferta.model.Ayudante;
import unju.talleres.oferta.model.Profesor;
import unju.talleres.oferta.repository.AyudanteRepository;
import unju.talleres.oferta.repository.ProfesorRepository;
import unju.talleres.oferta.repository.TallerRepository;

import java.util.List;

/** RF-14: administración de profesores y ayudantes y su vínculo opcional con un usuario interno. */
@Service
public class DocenteService {

    private final ProfesorRepository profesores;
    private final AyudanteRepository ayudantes;
    private final TallerRepository talleres;
    private final UsuarioService usuarioService;

    public DocenteService(ProfesorRepository profesores, AyudanteRepository ayudantes, TallerRepository talleres,
                          UsuarioService usuarioService) {
        this.profesores = profesores;
        this.ayudantes = ayudantes;
        this.talleres = talleres;
        this.usuarioService = usuarioService;
    }

    // ------------------------------------------------------------ Profesores

    @Transactional(readOnly = true)
    public List<ProfesorResponse> listarProfesores() {
        return profesores.findAllByOrderByApellidoAscNombreAsc().stream().map(ProfesorResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public ProfesorResponse obtenerProfesor(Long id) {
        return ProfesorResponse.de(buscarProfesor(id));
    }

    @Transactional
    public ProfesorResponse crearProfesor(ProfesorRequest req) {
        if (profesores.existsByDni(req.dni())) {
            throw new NegocioException("Ya existe un profesor con DNI " + req.dni());
        }
        Profesor p = new Profesor();
        copiar(req, p, null);
        return ProfesorResponse.de(profesores.save(p));
    }

    @Transactional
    public ProfesorResponse actualizarProfesor(Long id, ProfesorRequest req) {
        Profesor p = buscarProfesor(id);
        if (profesores.existsByDniAndIdNot(req.dni(), id)) {
            throw new NegocioException("Ya existe un profesor con DNI " + req.dni());
        }
        copiar(req, p, id);
        return ProfesorResponse.de(p);
    }

    @Transactional
    public void eliminarProfesor(Long id) {
        Profesor p = buscarProfesor(id);
        if (talleres.existsByProfesorId(id)) {
            throw new NegocioException("No se puede eliminar: el profesor está a cargo de talleres");
        }
        profesores.delete(p);
        profesores.flush();
    }

    @Transactional(readOnly = true)
    public Profesor buscarProfesor(Long id) {
        return profesores.findById(id).orElseThrow(() -> new NoEncontradoException("Profesor", id));
    }

    private void copiar(ProfesorRequest req, Profesor p, Long id) {
        p.setDni(req.dni().trim());
        p.setNombre(req.nombre().trim());
        p.setApellido(req.apellido().trim());
        p.setEmail(req.email());
        p.setTelefono(req.telefono());
        if (req.idUsuario() == null) {
            p.setUsuario(null);
        } else {
            if (profesores.existsByUsuarioIdAndIdNot(req.idUsuario(), id == null ? -1L : id)) {
                throw new NegocioException("El usuario ya está vinculado a otro profesor");
            }
            p.setUsuario(usuarioConRol(req.idUsuario(), RolNombre.PROFESOR));
        }
    }

    // ------------------------------------------------------------ Ayudantes

    @Transactional(readOnly = true)
    public List<AyudanteResponse> listarAyudantes() {
        return ayudantes.findAllByOrderByApellidoAscNombreAsc().stream().map(AyudanteResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public AyudanteResponse obtenerAyudante(Long id) {
        return AyudanteResponse.de(buscarAyudante(id));
    }

    @Transactional
    public AyudanteResponse crearAyudante(AyudanteRequest req) {
        if (ayudantes.existsByDni(req.dni())) {
            throw new NegocioException("Ya existe un ayudante con DNI " + req.dni());
        }
        Ayudante a = new Ayudante();
        copiar(req, a, null);
        return AyudanteResponse.de(ayudantes.save(a));
    }

    @Transactional
    public AyudanteResponse actualizarAyudante(Long id, AyudanteRequest req) {
        Ayudante a = buscarAyudante(id);
        if (ayudantes.existsByDniAndIdNot(req.dni(), id)) {
            throw new NegocioException("Ya existe un ayudante con DNI " + req.dni());
        }
        copiar(req, a, id);
        return AyudanteResponse.de(a);
    }

    @Transactional
    public void eliminarAyudante(Long id) {
        Ayudante a = buscarAyudante(id);
        ayudantes.delete(a); // taller_ayudante tiene ON DELETE CASCADE
        ayudantes.flush();
    }

    @Transactional(readOnly = true)
    public Ayudante buscarAyudante(Long id) {
        return ayudantes.findById(id).orElseThrow(() -> new NoEncontradoException("Ayudante", id));
    }

    private void copiar(AyudanteRequest req, Ayudante a, Long id) {
        a.setDni(req.dni().trim());
        a.setNombre(req.nombre().trim());
        a.setApellido(req.apellido().trim());
        if (req.idUsuario() == null) {
            a.setUsuario(null);
        } else {
            if (ayudantes.existsByUsuarioIdAndIdNot(req.idUsuario(), id == null ? -1L : id)) {
                throw new NegocioException("El usuario ya está vinculado a otro ayudante");
            }
            a.setUsuario(usuarioConRol(req.idUsuario(), RolNombre.AYUDANTE));
        }
    }

    private UsuarioSistema usuarioConRol(Long idUsuario, RolNombre rol) {
        UsuarioSistema u = usuarioService.buscar(idUsuario);
        if (u.getRol().getNombre() != rol) {
            throw new NegocioException(HttpStatus.BAD_REQUEST,
                    "El usuario '" + u.getNombreUsuario() + "' debe tener el rol " + rol);
        }
        return u;
    }
}
