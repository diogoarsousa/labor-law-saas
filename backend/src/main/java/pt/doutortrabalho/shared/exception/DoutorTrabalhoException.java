package pt.doutortrabalho.shared.exception;

/**
 * Base exception for all Doutor do Trabalho domain-specific errors.
 */
public class DoutorTrabalhoException extends RuntimeException {

    private final String errorCode;

    public DoutorTrabalhoException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public DoutorTrabalhoException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
