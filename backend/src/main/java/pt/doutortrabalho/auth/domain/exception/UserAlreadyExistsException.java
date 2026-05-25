package pt.doutortrabalho.auth.domain.exception;

import pt.doutortrabalho.shared.exception.DoutorTrabalhoException;

/**
 * Thrown when attempting to register with an email that already exists.
 */
public class UserAlreadyExistsException extends DoutorTrabalhoException {

    public UserAlreadyExistsException(String email) {
        super("USER_ALREADY_EXISTS",
                String.format("Ja existe um utilizador registado com o email: %s", email));
    }
}
