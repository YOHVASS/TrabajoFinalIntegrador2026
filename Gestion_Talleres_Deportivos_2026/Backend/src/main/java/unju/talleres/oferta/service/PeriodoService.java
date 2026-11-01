package unju.talleres.oferta.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unju.talleres.common.exception.NegocioException;
import unju.talleres.common.exception.NoEncontradoException;
import unju.talleres.common.util.Fechas;
import unju.talleres.oferta.dto.PeriodoDto;
import unju.talleres.oferta.model.Periodo;
import unju.talleres.oferta.repository.PeriodoRepository;
import unju.talleres.oferta.repository.TallerRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PeriodoService {

    private final PeriodoRepository periodos;
    private final TallerRepository talleres;
    private final Fechas fechas;

    public PeriodoService(PeriodoRepository periodos, TallerRepository talleres, Fechas fechas) {
        this.periodos = periodos;
        this.talleres = talleres;
        this.fechas = fechas;
    }

    @Transactional(readOnly = true)
    public List<PeriodoDto> listar() {
        return periodos.findAllByOrderByFechaInicioDesc().stream()
                .map(p -> PeriodoDto.de(p, fechas.hoy())).toList();
    }

    @Transactional(readOnly = true)
    public PeriodoDto obtener(Long id) {
        return PeriodoDto.de(buscar(id), fechas.hoy());
    }

    @Transactional(readOnly = true)
    public Optional<PeriodoDto> vigente() {
        return periodos.findVigente(fechas.hoy()).map(p -> PeriodoDto.de(p, fechas.hoy()));
    }

    @Transactional
    public PeriodoDto crear(PeriodoDto req) {
        validar(req);
        if (periodos.existsByCodigoIgnoreCase(req.codigo().trim())) {
            throw new NegocioException("Ya existe el período '" + req.codigo() + "'");
        }
        Periodo p = new Periodo();
        copiar(req, p);
        return PeriodoDto.de(periodos.save(p), fechas.hoy());
    }

    @Transactional
    public PeriodoDto actualizar(Long id, PeriodoDto req) {
        validar(req);
        Periodo p = buscar(id);
        if (periodos.existsByCodigoIgnoreCaseAndIdNot(req.codigo().trim(), id)) {
            throw new NegocioException("Ya existe el período '" + req.codigo() + "'");
        }
        copiar(req, p);
        return PeriodoDto.de(p, fechas.hoy());
    }

    @Transactional
    public void eliminar(Long id) {
        Periodo p = buscar(id);
        if (talleres.existsByPeriodoId(id)) {
            throw new NegocioException("No se puede eliminar: el período tiene talleres asociados");
        }
        periodos.delete(p);
        periodos.flush();
    }

    @Transactional(readOnly = true)
    public Periodo buscar(Long id) {
        return periodos.findById(id).orElseThrow(() -> new NoEncontradoException("Período", id));
    }

    private void validar(PeriodoDto req) {
        if (req.fechaFin().isBefore(req.fechaInicio())) {
            throw new NegocioException(HttpStatus.BAD_REQUEST, "La fecha de fin no puede ser anterior a la de inicio");
        }
    }

    private void copiar(PeriodoDto req, Periodo p) {
        p.setCodigo(req.codigo().trim().toUpperCase());
        p.setFechaInicio(req.fechaInicio());
        p.setFechaFin(req.fechaFin());
    }
}
