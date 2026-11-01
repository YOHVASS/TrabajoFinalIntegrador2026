package unju.talleres.common.exception;

import org.springframework.http.HttpStatus;

public class NoEncontradoException extends NegocioException {

    public NoEncontradoException(String entidad, Object id) {
        super(HttpStatus.NOT_FOUND, entidad + " no encontrado/a (id " + id + ")");
    }

    public NoEncontradoException(String mensaje) {
        super(HttpStatus.NOT_FOUND, mensaje);
    }
}
