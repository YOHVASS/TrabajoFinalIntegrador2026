package unju.talleres.participantes.model;

/**
 * Dato derivado (excepción documentada a 3FN). Lo mantiene HabilitacionService.
 * HABILITADO: cumple RN-05. NO_HABILITADO: algún requisito está vencido.
 * PENDIENTE: falta presentar algún requisito y ninguno está vencido.
 */
public enum EstadoHabilitacion {
    HABILITADO,
    NO_HABILITADO,
    PENDIENTE
}
