package pt.doutortrabalho.auth.domain.exception;

import pt.doutortrabalho.shared.exception.DoutorTrabalhoException;

/**
 * Thrown when authentication fails (invalid credentials, expired token, etc.).
 */
public class AuthenticationException extends DoutorTrabalhoException {

    public AuthenticationException(String message) {
        super("AUTHENTICATION_FAILED", message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super("AUTHENTICATION_FAILED", message, cause);
    }
}
