package unju.talleres.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Error de regla de negocio. Por defecto responde 409 (Conflict); se puede indicar otro estado.
 */
public class NegocioException extends RuntimeException {

    private final HttpStatus status;

    public NegocioException(String mensaje) {
        this(HttpStatus.CONFLICT, mensaje);
    }

    public NegocioException(HttpStatus status, String mensaje) {
        super(mensaje);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
