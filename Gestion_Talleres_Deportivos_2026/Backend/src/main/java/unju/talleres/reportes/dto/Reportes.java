package unju.talleres.reportes.dto;

import java.time.LocalDate;

/**
 * Filas de los reportes de gestión (RF-16). Todos son datos agregados, salvo los "Detalle",
 * que son nominales y solo los ven ADMINISTRATIVO y COORDINADOR (RN-12).
 */
public final class Reportes {

    private Reportes() {
    }

    public record Resumen(
            Long participantesActivos,
            Long habilitados,
            Long noHabilitados,
            Long conRequisitosPendientes,
            Long inscripcionesActivas,
            Long preinscripcionesPendientes,
            Long enListaEspera,
            Long asistenciasUltimos30Dias,
            Long ingresosRechazadosUltimos30Dias,
            Long aptosPorVencer,
            Long alertasActivas) {
    }

    public record PorTaller(
            Long idTaller,
            String taller,
            String disciplina,
            String modalidad,
            String periodo,
            Integer cupoMaximo,
            Long inscriptosActivos,
            Long pendientesRevision,
            Long enListaEspera) {
    }

    public record PorDisciplina(String disciplina, Long participantes, Long inscripciones) {
    }

    /** Para "por facultad" y "por sexo". */
    public record PorCategoria(String categoria, Long participantes) {
    }

    public record EvolucionMensual(String mes, Long preinscripciones, Long inscripciones) {
    }

    public record AsistenciaPorTaller(
            Long idTaller,
            String taller,
            Long habilitados,
            Long rechazados,
            Long participantesDistintos,
            Long diasConRegistro) {
    }

    public record AptoPorVencerDetalle(Long idParticipante, String dni, String nombre, String apellido,
                                       LocalDate fechaVencimiento) {
    }

    public record DocumentacionPendienteDetalle(Long idParticipante, String dni, String nombre, String apellido,
                                                String estadoHabilitacion, String pendientes) {
    }
}
