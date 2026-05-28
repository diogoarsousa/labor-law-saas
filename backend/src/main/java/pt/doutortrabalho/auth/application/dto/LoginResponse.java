package pt.doutortrabalho.auth.application.dto;

/**
 * Response DTO containing JWT tokens after successful authentication.
 */
public record LoginResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn
) {
}
