package unju.talleres.ingreso.dto;

import unju.talleres.ingreso.model.MetodoVerificacion;
import unju.talleres.ingreso.model.ResultadoHabilitacion;
import unju.talleres.participantes.dto.ParticipanteResumen;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Respuesta de la pantalla de control de ingreso. {@code resultado} define el color (verde/rojo);
 * {@code motivos} explica el rechazo. {@code yaRegistradoHoy} indica que ya tenía un ingreso
 * HABILITADO hoy en este taller (no se duplica la asistencia).
 */
public record IngresoResponse(
        ResultadoHabilitacion resultado,
        List<String> motivos,
        boolean yaRegistradoHoy,
        Long idAsistencia,
        ParticipanteResumen participante,
        Long idTaller,
        String taller,
        LocalDate fecha,
        LocalTime hora,
        MetodoVerificacion metodo) {
}
