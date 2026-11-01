package unju.talleres.documentacion.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.util.Fechas;
import unju.talleres.documentacion.dto.DocumentacionRequest;
import unju.talleres.documentacion.dto.DocumentacionResponse;
import unju.talleres.documentacion.dto.TipoDocumentoDto;
import unju.talleres.documentacion.model.Documentacion;
import unju.talleres.documentacion.model.TipoDocumento;
import unju.talleres.documentacion.repository.DocumentacionRepository;
import unju.talleres.documentacion.repository.TipoDocumentoRepository;
import unju.talleres.habilitacion.service.HabilitacionService;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.service.ParticipanteService;

import java.time.LocalDate;
import java.util.List;

/** Módulo Documentación (RF-05). Cada cambio recalcula la habilitación del participante (RF-08). */
@Service
public class DocumentacionService {

    private final DocumentacionRepository documentaciones;
    private final TipoDocumentoRepository tipos;
    private final ParticipanteService participanteService;
    private final HabilitacionService habilitacionService;
    private final Fechas fechas;

    public DocumentacionService(DocumentacionRepository documentaciones, TipoDocumentoRepository tipos,
                                ParticipanteService participanteService, HabilitacionService habilitacionService,
                                Fechas fechas) {
        this.documentaciones = documentaciones;
        this.tipos = tipos;
        this.participanteService = participanteService;
        this.habilitacionService = habilitacionService;
        this.fechas = fechas;
    }

    // ------------------------------------------------------------ Tipos de documento

    @Transactional(readOnly = true)
    public List<TipoDocumentoDto> listarTipos() {
        return tipos.findAllByOrderByNombreAsc().stream().map(TipoDocumentoDto::de).toList();
    }

    @Transactional
    public TipoDocumentoDto crearTipo(TipoDocumentoDto req) {
        if (tipos.existsByNombreIgnoreCase(req.nombre().trim())) {
            throw new NegocioException("Ya existe el tipo de documento '" + req.nombre() + "'");
        }
        TipoDocumento t = new TipoDocumento();
        copiar(req, t);
        tipos.save(t);
        if (t.isObligatorio()) {
            habilitacionService.recalcularTodos();
        }
        return TipoDocumentoDto.de(t);
    }

    @Transactional
    public TipoDocumentoDto actualizarTipo(Long id, TipoDocumentoDto req) {
        TipoDocumento t = buscarTipo(id);
        if (tipos.existsByNombreIgnoreCaseAndIdNot(req.nombre().trim(), id)) {
            throw new NegocioException("Ya existe el tipo de documento '" + req.nombre() + "'");
        }
        boolean cambiaRequisito = t.isObligatorio() != req.obligatorio()
                || t.isTieneVencimiento() != req.tieneVencimiento();
        copiar(req, t);
        tipos.flush();
        if (cambiaRequisito) {
            habilitacionService.recalcularTodos();
        }
        return TipoDocumentoDto.de(t);
    }

    @Transactional
    public void eliminarTipo(Long id) {
        TipoDocumento t = buscarTipo(id);
        if (documentaciones.existsByTipoDocumentoId(id)) {
            throw new NegocioException("No se puede eliminar: hay documentación cargada de este tipo");
        }
        tipos.delete(t);
        tipos.flush();
        if (t.isObligatorio()) {
            habilitacionService.recalcularTodos();
        }
    }

    private void copiar(TipoDocumentoDto req, TipoDocumento t) {
        t.setNombre(req.nombre().trim());
        t.setObligatorio(req.obligatorio());
        t.setTieneVencimiento(req.tieneVencimiento());
    }

    private TipoDocumento buscarTipo(Long id) {
        return tipos.findById(id).orElseThrow(() -> new NoEncontradoException("Tipo de documento", id));
    }

    // ------------------------------------------------------------ Documentación del participante

    @Transactional(readOnly = true)
    public List<DocumentacionResponse> delParticipante(Long idParticipante) {
        participanteService.buscar(idParticipante);
        return documentaciones.findByParticipanteIdOrderByFechaPresentacionDesc(idParticipante).stream()
                .map(DocumentacionResponse::de).toList();
    }

    @Transactional
    public DocumentacionResponse registrar(Long idParticipante, DocumentacionRequest req) {
        Participante p = participanteService.buscar(idParticipante);
        Documentacion d = new Documentacion();
        d.setParticipante(p);
        copiar(req, d);
        documentaciones.save(d);
        habilitacionService.recalcular(p);
        return DocumentacionResponse.de(d);
    }

    @Transactional
    public DocumentacionResponse actualizar(Long id, DocumentacionRequest req) {
        Documentacion d = buscar(id);
        copiar(req, d);
        documentaciones.flush();
        habilitacionService.recalcular(d.getParticipante());
        return DocumentacionResponse.de(d);
    }

    @Transactional
    public void eliminar(Long id) {
        Documentacion d = buscar(id);
        Participante p = d.getParticipante();
        documentaciones.delete(d);
        documentaciones.flush();
        habilitacionService.recalcular(p);
    }

    private void copiar(DocumentacionRequest req, Documentacion d) {
        TipoDocumento tipo = buscarTipo(req.idTipoDocumento());
        LocalDate vto = tipo.isTieneVencimiento() ? req.fechaVencimiento() : null;
        if (vto != null && vto.isBefore(req.fechaPresentacion())) {
            throw new NegocioException(HttpStatus.BAD_REQUEST,
                    "La fecha de vencimiento no puede ser anterior a la de presentación");
        }
        d.setTipoDocumento(tipo);
        d.setArchivoUrl(req.archivoUrl());
        d.setFechaPresentacion(req.fechaPresentacion());
        d.setFechaVencimiento(vto);
        d.setEstado(d.calcularEstado(fechas.hoy()));
    }

    private Documentacion buscar(Long id) {
        return documentaciones.findById(id).orElseThrow(() -> new NoEncontradoException("Documentación", id));
    }
}
