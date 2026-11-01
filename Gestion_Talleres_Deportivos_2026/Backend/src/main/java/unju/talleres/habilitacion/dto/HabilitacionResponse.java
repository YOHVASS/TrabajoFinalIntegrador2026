package unju.talleres.habilitacion.dto;

import unju.talleres.habilitacion.service.EvaluadorHabilitacion.Situacion;
import unju.talleres.participantes.model.EstadoHabilitacion;

import java.time.LocalDate;
import java.util.List;

/**
 * Detalle del estado de habilitación (RF-08). No incluye datos clínicos: solo si el apto
 * está vigente y hasta cuándo, que es lo necesario para operar.
 */
public record HabilitacionResponse(
        Long idParticipante,
        String dni,
        String nombre,
        String apellido,
        EstadoHabilitacion estadoHabilitacion,
        boolean documentacionCompleta,
        List<DocumentoRequerido> documentos,
        Situacion seguro,
        LocalDate seguroVigenciaHasta,
        Situacion aptoMedico,
        LocalDate aptoMedicoVencimiento,
        List<String> motivos) {

    public record DocumentoRequerido(Long idTipoDocumento, String nombre, Situacion situacion,
                                     LocalDate fechaVencimiento) {
    }
}
