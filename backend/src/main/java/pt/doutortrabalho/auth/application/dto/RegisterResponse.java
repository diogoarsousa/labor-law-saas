package pt.doutortrabalho.auth.application.dto;

/**
 * Response DTO for successful user registration.
 */
public record RegisterResponse(
        String userId,
        String email,
        String message
) {
}
