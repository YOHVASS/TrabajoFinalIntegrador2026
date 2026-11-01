package unju.talleres.aptomedico.dto;

import unju.talleres.aptomedico.model.AptoMedico;
import unju.talleres.aptomedico.model.EstadoAptoMedico;

import java.time.LocalDate;

public record AptoMedicoResponse(
        Long id,
        Long idParticipante,
        LocalDate fechaEmision,
        LocalDate fechaVencimiento,
        String archivoUrl,
        EstadoAptoMedico estado) {

    public static AptoMedicoResponse de(AptoMedico a) {
        return new AptoMedicoResponse(a.getId(), a.getParticipante().getId(), a.getFechaEmision(),
                a.getFechaVencimiento(), a.getArchivoUrl(), a.getEstado());
    }
}
