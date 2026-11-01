package unju.talleres.documentacion.model;

/**
 * Dato derivado. VIGENTE: sin vencimiento o con vencimiento futuro. VENCIDO: venció.
 * PENDIENTE: el tipo exige fecha de vencimiento y todavía no se cargó (no cuenta para la habilitación).
 */
public enum EstadoDocumentacion {
    VIGENTE,
    VENCIDO,
    PENDIENTE
}
