package unju.talleres.participantes.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import unju.talleres.common.dto.PaginaResponse;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.storage.AlmacenamientoService;
import unju.talleres.common.util.Fechas;
import unju.talleres.participantes.dto.CredencialResponse;
import unju.talleres.participantes.dto.ParticipanteRequest;
import unju.talleres.participantes.dto.ParticipanteResponse;
import unju.talleres.participantes.model.EstadoHabilitacion;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.repository.ParticipanteRepository;

import java.util.UUID;

/** Módulo Participantes (RF-04). */
@Service
public class ParticipanteService {

    private final ParticipanteRepository participantes;
    private final AlmacenamientoService almacenamiento;
    private final Fechas fechas;

    public ParticipanteService(ParticipanteRepository participantes, AlmacenamientoService almacenamiento,
                               Fechas fechas) {
        this.participantes = participantes;
        this.almacenamiento = almacenamiento;
        this.fechas = fechas;
    }

    @Transactional(readOnly = true)
    public PaginaResponse<ParticipanteResponse> buscar(String texto, EstadoHabilitacion estado, int pagina, int tamanio) {
        String t = (texto == null || texto.isBlank()) ? "" : texto.trim();
        var page = participantes.buscar(t, estado,
                PageRequest.of(pagina, tamanio, Sort.by("apellido", "nombre")));
        return PaginaResponse.de(page, ParticipanteResponse::de);
    }

    @Transactional(readOnly = true)
    public ParticipanteResponse obtener(Long id) {
        return ParticipanteResponse.de(buscar(id));
    }

    @Transactional
    public ParticipanteResponse crear(ParticipanteRequest req) {
        if (participantes.findByDni(req.dni()).isPresent()) {
            throw new NegocioException("Ya existe un participante con DNI " + req.dni());
        }
        Participante p = new Participante();
        copiar(req, p);
        p.setEstadoHabilitacion(EstadoHabilitacion.PENDIENTE);
        p.setFechaAlta(fechas.ahora());
        return ParticipanteResponse.de(participantes.save(p));
    }

    @Transactional
    public ParticipanteResponse actualizar(Long id, ParticipanteRequest req) {
        Participante p = buscar(id);
        if (participantes.existsByDniAndIdNot(req.dni(), id)) {
            throw new NegocioException("Ya existe otro participante con DNI " + req.dni());
        }
        copiar(req, p);
        return ParticipanteResponse.de(p);
    }

    @Transactional
    public ParticipanteResponse subirFoto(Long id, MultipartFile foto) {
        Participante p = buscar(id);
        String nombre = foto == null ? null : foto.getOriginalFilename();
        if (nombre != null && nombre.toLowerCase().endsWith(".pdf")) {
            throw new NegocioException(HttpStatus.BAD_REQUEST,
                    "La fotografía debe ser una imagen (JPG, PNG o WEBP)");
        }
        p.setFotoUrl(almacenamiento.guardar(foto));
        return ParticipanteResponse.de(p);
    }

    @Transactional(readOnly = true)
    public CredencialResponse credencial(Long id) {
        Participante p = buscar(id);
        if (p.getQrCode() == null) {
            throw new NegocioException("El participante todavía no tiene una inscripción aprobada, "
                    + "por eso no tiene credencial QR");
        }
        return new CredencialResponse(p.getId(), p.getDni(), p.getNombre(), p.getApellido(), p.getFotoUrl(),
                p.getQrCode(), p.getEstadoHabilitacion());
    }

    /** Genera el token QR si todavía no tiene (se llama al aprobar la primera inscripción). */
    @Transactional
    public void asegurarQr(Participante p) {
        if (p.getQrCode() == null) {
            p.setQrCode(UUID.randomUUID().toString());
        }
    }

    @Transactional(readOnly = true)
    public Participante buscar(Long id) {
        return participantes.findById(id).orElseThrow(() -> new NoEncontradoException("Participante", id));
    }

    private void copiar(ParticipanteRequest req, Participante p) {
        p.setDni(req.dni().trim());
        p.setNombre(req.nombre().trim());
        p.setApellido(req.apellido().trim());
        p.setFechaNacimiento(req.fechaNacimiento());
        p.setSexo(req.sexo());
        p.setFacultad(req.facultad());
        p.setEmail(req.email().trim().toLowerCase());
        p.setTelefono(req.telefono());
        if (req.fotoUrl() != null) {
            p.setFotoUrl(req.fotoUrl());
        }
    }
}
