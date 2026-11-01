package unju.talleres.documentacion.dto;

import unju.talleres.documentacion.model.Documentacion;
import unju.talleres.documentacion.model.EstadoDocumentacion;

import java.time.LocalDate;

public record DocumentacionResponse(
        Long id,
        Long idParticipante,
        Long idTipoDocumento,
        String tipoDocumento,
        boolean obligatorio,
        String archivoUrl,
        LocalDate fechaPresentacion,
        LocalDate fechaVencimiento,
        EstadoDocumentacion estado) {

    public static DocumentacionResponse de(Documentacion d) {
        return new DocumentacionResponse(d.getId(), d.getParticipante().getId(), d.getTipoDocumento().getId(),
                d.getTipoDocumento().getNombre(), d.getTipoDocumento().isObligatorio(), d.getArchivoUrl(),
                d.getFechaPresentacion(), d.getFechaVencimiento(), d.getEstado());
    }
}
