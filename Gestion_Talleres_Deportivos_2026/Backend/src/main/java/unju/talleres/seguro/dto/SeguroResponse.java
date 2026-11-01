package unju.talleres.seguro.dto;

import unju.talleres.participantes.model.Participante;
import unju.talleres.seguro.model.EstadoSeguro;
import unju.talleres.seguro.model.Seguro;

import java.time.LocalDate;

public record SeguroResponse(
        Long id,
        Long idParticipante,
        String dni,
        String participante,
        Long idPeriodo,
        String periodo,
        String numeroPoliza,
        LocalDate fechaPago,
        LocalDate vigenciaDesde,
        LocalDate vigenciaHasta,
        EstadoSeguro estado,
        boolean informadoProductora) {

    public static SeguroResponse de(Seguro s) {
        Participante p = s.getParticipante();
        return new SeguroResponse(s.getId(), p.getId(), p.getDni(), p.getApellido() + ", " + p.getNombre(),
                s.getPeriodo().getId(), s.getPeriodo().getCodigo(), s.getNumeroPoliza(), s.getFechaPago(),
                s.getVigenciaDesde(), s.getVigenciaHasta(), s.getEstado(), s.isInformadoProductora());
    }
}
