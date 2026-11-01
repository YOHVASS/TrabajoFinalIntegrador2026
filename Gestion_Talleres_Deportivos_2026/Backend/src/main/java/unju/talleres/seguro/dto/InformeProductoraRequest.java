package unju.talleres.seguro.dto;

import java.util.List;

/**
 * RF-19: seguros a marcar como informados. Si {@code idsSeguros} viene vacío o nulo,
 * se marcan todas las altas pendientes (opcionalmente solo del {@code idPeriodo}).
 */
public record InformeProductoraRequest(List<Long> idsSeguros, Long idPeriodo) {
}
