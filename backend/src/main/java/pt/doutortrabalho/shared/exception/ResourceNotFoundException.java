package pt.doutortrabalho.shared.exception;

/**
 * Thrown when a requested resource does not exist.
 */
public class ResourceNotFoundException extends DoutorTrabalhoException {

    public ResourceNotFoundException(String resourceType, String identifier) {
        super("RESOURCE_NOT_FOUND",
                String.format("%s not found with identifier: %s", resourceType, identifier));
    }
}
