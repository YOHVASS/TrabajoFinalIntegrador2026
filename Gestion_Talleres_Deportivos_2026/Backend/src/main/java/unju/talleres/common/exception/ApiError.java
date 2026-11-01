package unju.talleres.common.exception;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Formato único de error que recibe el frontend.
 * {@code errores} solo viene cuando falla la validación de campos (clave = campo, valor = mensaje).
 */
public record ApiError(
        OffsetDateTime timestamp,
        int status,
        String error,
        String mensaje,
        String path,
        Map<String, String> errores) {
}
