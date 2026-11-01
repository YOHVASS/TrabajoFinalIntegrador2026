package unju.talleres.oferta.dto;

import unju.talleres.oferta.model.Modalidad;

import java.time.LocalDate;
import java.util.List;

/**
 * Datos del taller para el portal y el sistema interno.
 * {@code lugaresDisponibles} null = sin cupo máximo.
 */
public record TallerResponse(
        Long id,
        String nombre,
        Modalidad modalidad,
        Integer cupoMaximo,
        Long lugaresDisponibles,
        Long inscriptosActivos,
        Long enListaEspera,
        Referencia disciplina,
        Referencia profesor,
        PeriodoRef periodo,
        List<HorarioDto> horarios,
        List<Referencia> ayudantes) {

    public record Referencia(Long id, String nombre) {
    }

    public record PeriodoRef(Long id, String codigo, LocalDate fechaInicio, LocalDate fechaFin) {
    }
}
