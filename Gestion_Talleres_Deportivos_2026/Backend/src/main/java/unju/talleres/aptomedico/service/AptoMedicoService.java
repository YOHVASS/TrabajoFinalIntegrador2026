package unju.talleres.aptomedico.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.aptomedico.dto.AptoMedicoRequest;
import unju.talleres.aptomedico.dto.AptoMedicoResponse;
import unju.talleres.aptomedico.model.AptoMedico;
import unju.talleres.aptomedico.repository.AptoMedicoRepository;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.util.Fechas;
import unju.talleres.habilitacion.service.HabilitacionService;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.service.ParticipanteService;

import java.time.LocalDate;
import java.util.List;

/** Módulo Apto Médico (RF-07, RN-04). */
@Service
public class AptoMedicoService {

    private final AptoMedicoRepository aptos;
    private final ParticipanteService participanteService;
    private final HabilitacionService habilitacionService;
    private final Fechas fechas;

    public AptoMedicoService(AptoMedicoRepository aptos, ParticipanteService participanteService,
                             HabilitacionService habilitacionService, Fechas fechas) {
        this.aptos = aptos;
        this.participanteService = participanteService;
        this.habilitacionService = habilitacionService;
        this.fechas = fechas;
    }

    @Transactional(readOnly = true)
    public List<AptoMedicoResponse> delParticipante(Long idParticipante) {
        participanteService.buscar(idParticipante);
        return aptos.findByParticipanteIdOrderByFechaEmisionDesc(idParticipante).stream()
                .map(AptoMedicoResponse::de).toList();
    }

    @Transactional
    public AptoMedicoResponse registrar(Long idParticipante, AptoMedicoRequest req) {
        Participante p = participanteService.buscar(idParticipante);
        AptoMedico a = new AptoMedico();
        a.setParticipante(p);
        copiar(req, a);
        aptos.save(a);
        habilitacionService.recalcular(p);
        return AptoMedicoResponse.de(a);
    }

    @Transactional
    public AptoMedicoResponse actualizar(Long id, AptoMedicoRequest req) {
        AptoMedico a = buscar(id);
        copiar(req, a);
        aptos.flush();
        habilitacionService.recalcular(a.getParticipante());
        return AptoMedicoResponse.de(a);
    }

    @Transactional
    public void eliminar(Long id) {
        AptoMedico a = buscar(id);
        Participante p = a.getParticipante();
        aptos.delete(a);
        aptos.flush();
        habilitacionService.recalcular(p);
    }

    private void copiar(AptoMedicoRequest req, AptoMedico a) {
        LocalDate maximo = req.fechaEmision().plusYears(1);
        LocalDate vto = req.fechaVencimiento() != null ? req.fechaVencimiento() : maximo;
        if (!vto.isAfter(req.fechaEmision())) {
            throw new NegocioException(HttpStatus.BAD_REQUEST, "El vencimiento debe ser posterior a la emisión");
        }
        if (vto.isAfter(maximo)) {
            throw new NegocioException(HttpStatus.BAD_REQUEST,
                    "El apto médico tiene una vigencia máxima de un año desde la emisión (RN-04)");
        }
        a.setFechaEmision(req.fechaEmision());
        a.setFechaVencimiento(vto);
        a.setArchivoUrl(req.archivoUrl());
        a.setEstado(a.calcularEstado(fechas.hoy()));
    }

    private AptoMedico buscar(Long id) {
        return aptos.findById(id).orElseThrow(() -> new NoEncontradoException("Apto médico", id));
    }
}
