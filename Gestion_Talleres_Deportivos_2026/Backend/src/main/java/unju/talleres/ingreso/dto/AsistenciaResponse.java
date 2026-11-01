package unju.talleres.ingreso.dto;

import unju.talleres.ingreso.model.Asistencia;
import unju.talleres.ingreso.model.MetodoVerificacion;
import unju.talleres.ingreso.model.ResultadoHabilitacion;

import java.time.LocalDate;
import java.time.LocalTime;

public record AsistenciaResponse(
        Long id,
        LocalDate fecha,
        LocalTime horaIngreso,
        MetodoVerificacion metodoVerificacion,
        ResultadoHabilitacion resultadoHabilitacion,
        Long idParticipante,
        String dni,
        String participante,
        Long idTaller,
        String taller,
        String registradoPor) {

    public static AsistenciaResponse de(Asistencia a) {
        var p = a.getParticipante();
        var u = a.getUsuarioRegistro();
        return new AsistenciaResponse(a.getId(), a.getFecha(), a.getHoraIngreso(), a.getMetodoVerificacion(),
                a.getResultadoHabilitacion(), p.getId(), p.getDni(), p.getApellido() + ", " + p.getNombre(),
                a.getTaller().getId(), a.getTaller().getNombre(), u.getNombre() + " " + u.getApellido());
    }
}
