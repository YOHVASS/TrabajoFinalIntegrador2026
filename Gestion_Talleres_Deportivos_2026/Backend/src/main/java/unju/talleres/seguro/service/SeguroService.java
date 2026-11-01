package unju.talleres.seguro.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.util.Fechas;
import unju.talleres.habilitacion.service.HabilitacionService;
import unju.talleres.oferta.model.Periodo;
import unju.talleres.oferta.repository.PeriodoRepository;
import unju.talleres.oferta.service.PeriodoService;
import unju.talleres.participantes.model.Participante;
import unju.talleres.participantes.service.ParticipanteService;
import unju.talleres.seguro.dto.InformeProductoraRequest;
import unju.talleres.seguro.dto.SeguroRequest;
import unju.talleres.seguro.dto.SeguroResponse;
import unju.talleres.seguro.model.Seguro;
import unju.talleres.seguro.repository.SeguroRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/** Módulo Seguro: pago y vigencia del seguro anual (RF-06) e informe de altas a la productora (RF-19). */
@Service
public class SeguroService {

    private final SeguroRepository seguros;
    private final PeriodoRepository periodos;
    private final PeriodoService periodoService;
    private final ParticipanteService participanteService;
    private final HabilitacionService habilitacionService;
    private final Fechas fechas;

    public SeguroService(SeguroRepository seguros, PeriodoRepository periodos, PeriodoService periodoService,
                         ParticipanteService participanteService, HabilitacionService habilitacionService,
                         Fechas fechas) {
        this.seguros = seguros;
        this.periodos = periodos;
        this.periodoService = periodoService;
        this.participanteService = participanteService;
        this.habilitacionService = habilitacionService;
        this.fechas = fechas;
    }

    @Transactional(readOnly = true)
    public List<SeguroResponse> delParticipante(Long idParticipante) {
        participanteService.buscar(idParticipante);
        return seguros.findByParticipanteIdOrderByVigenciaDesdeDesc(idParticipante).stream()
                .map(SeguroResponse::de).toList();
    }

    @Transactional
    public SeguroResponse registrar(Long idParticipante, SeguroRequest req) {
        Participante p = participanteService.buscar(idParticipante);
        Periodo periodo = periodo(req.idPeriodo());
        // RN-02: el seguro se abona una sola vez por período.
        if (seguros.existsByParticipanteIdAndPeriodoId(idParticipante, periodo.getId())) {
            throw new NegocioException("El participante ya tiene registrado el seguro del período " + periodo.getCodigo());
        }
        Seguro s = new Seguro();
        s.setParticipante(p);
        s.setPeriodo(periodo);
        s.setInformadoProductora(false);
        copiar(req, s);
        seguros.save(s);
        habilitacionService.recalcular(p);
        return SeguroResponse.de(s);
    }

    @Transactional
    public SeguroResponse actualizar(Long id, SeguroRequest req) {
        Seguro s = buscar(id);
        Periodo periodo = req.idPeriodo() == null ? s.getPeriodo() : periodoService.buscar(req.idPeriodo());
        if (seguros.existsByParticipanteIdAndPeriodoIdAndIdNot(s.getParticipante().getId(), periodo.getId(), id)) {
            throw new NegocioException("El participante ya tiene registrado el seguro del período " + periodo.getCodigo());
        }
        s.setPeriodo(periodo);
        copiar(req, s);
        seguros.flush();
        habilitacionService.recalcular(s.getParticipante());
        return SeguroResponse.de(s);
    }

    @Transactional
    public void eliminar(Long id) {
        Seguro s = buscar(id);
        if (s.isInformadoProductora()) {
            throw new NegocioException("No se puede eliminar un seguro ya informado a la productora");
        }
        Participante p = s.getParticipante();
        seguros.delete(s);
        seguros.flush();
        habilitacionService.recalcular(p);
    }

    // ------------------------------------------------------------ RF-19 / RN-10

    @Transactional(readOnly = true)
    public List<SeguroResponse> altasPendientes(Long idPeriodo) {
        return seguros.pendientesDeInformar(idPeriodo).stream().map(SeguroResponse::de).toList();
    }

    @Transactional
    public List<SeguroResponse> marcarInformados(InformeProductoraRequest req) {
        List<Seguro> lista = (req == null || req.idsSeguros() == null || req.idsSeguros().isEmpty())
                ? seguros.pendientesDeInformar(req == null ? null : req.idPeriodo())
                : seguros.findAllById(req.idsSeguros());
        lista.forEach(s -> s.setInformadoProductora(true));
        return lista.stream().map(SeguroResponse::de).toList();
    }

    /** Planilla CSV (separador ';', abre directo en Excel) con las altas pendientes de informar. */
    @Transactional(readOnly = true)
    public String altasPendientesCsv(Long idPeriodo) {
        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        StringBuilder sb = new StringBuilder("﻿"); // BOM para que Excel respete los acentos
        sb.append("DNI;Apellido;Nombre;Fecha de nacimiento;Sexo;Período;N° póliza;Fecha de pago;Vigencia desde;Vigencia hasta\n");
        for (Seguro s : seguros.pendientesDeInformar(idPeriodo)) {
            Participante p = s.getParticipante();
            sb.append(String.join(";",
                    p.getDni(), csv(p.getApellido()), csv(p.getNombre()), f.format(p.getFechaNacimiento()),
                    p.getSexo().name(), s.getPeriodo().getCodigo(), csv(s.getNumeroPoliza()),
                    f.format(s.getFechaPago()), f.format(s.getVigenciaDesde()), f.format(s.getVigenciaHasta())))
                    .append('\n');
        }
        return sb.toString();
    }

    private static String csv(String valor) {
        return valor == null ? "" : valor.replace(";", ",").replace("\n", " ");
    }

    private void copiar(SeguroRequest req, Seguro s) {
        LocalDate desde = req.vigenciaDesde() != null ? req.vigenciaDesde() : req.fechaPago();
        LocalDate hasta = req.vigenciaHasta() != null ? req.vigenciaHasta() : desde.plusYears(1).minusDays(1);
        if (hasta.isBefore(desde)) {
            throw new NegocioException(HttpStatus.BAD_REQUEST, "La vigencia 'hasta' no puede ser anterior a 'desde'");
        }
        s.setNumeroPoliza(req.numeroPoliza());
        s.setFechaPago(req.fechaPago());
        s.setVigenciaDesde(desde);
        s.setVigenciaHasta(hasta);
        s.setEstado(s.calcularEstado(fechas.hoy()));
    }

    private Periodo periodo(Long idPeriodo) {
        if (idPeriodo != null) {
            return periodoService.buscar(idPeriodo);
        }
        return periodos.findVigente(fechas.hoy()).orElseThrow(() -> new NegocioException(HttpStatus.BAD_REQUEST,
                "No hay un período vigente: indique idPeriodo"));
    }

    private Seguro buscar(Long id) {
        return seguros.findById(id).orElseThrow(() -> new NoEncontradoException("Seguro", id));
    }
}
