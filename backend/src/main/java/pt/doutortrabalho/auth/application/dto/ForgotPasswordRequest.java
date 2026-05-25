package pt.doutortrabalho.auth.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for triggering a password reset email.
 */
public record ForgotPasswordRequest(

        @NotBlank(message = "O email e obrigatorio")
        @Email(message = "O email deve ser valido")
        String email
) {
}
