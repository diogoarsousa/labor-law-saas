package pt.doutortrabalho.auth.domain.exception;

import pt.doutortrabalho.shared.exception.DoutorTrabalhoException;

/**
 * Thrown when communication with the Identity Provider fails.
 */
public class IdentityProviderException extends DoutorTrabalhoException {

    public IdentityProviderException(String message) {
        super("IDENTITY_PROVIDER_ERROR", message);
    }

    public IdentityProviderException(String message, Throwable cause) {
        super("IDENTITY_PROVIDER_ERROR", message, cause);
    }
}
