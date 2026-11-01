package unju.talleres.oferta.dto;

import jakarta.validation.constraints.Positive;

/** Nuevo cupo máximo (null = sin límite). */
public record CupoRequest(@Positive Integer cupoMaximo) {
}
