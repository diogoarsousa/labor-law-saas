package pt.doutortrabalho.auth.application.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for refreshing an access token.
 */
public record RefreshRequest(

        @NotBlank(message = "O refresh token e obrigatorio")
        String refreshToken
) {
}
