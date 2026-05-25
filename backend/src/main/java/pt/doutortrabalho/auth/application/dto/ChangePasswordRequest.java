package pt.doutortrabalho.auth.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for changing the password of the authenticated user.
 */
public record ChangePasswordRequest(

        @NotBlank(message = "A password atual e obrigatoria")
        String currentPassword,

        @NotBlank(message = "A nova password e obrigatoria")
        @Size(min = 8, max = 128, message = "A nova password deve ter entre 8 e 128 caracteres")
        String newPassword,

        @NotBlank(message = "A confirmacao da password e obrigatoria")
        String confirmPassword
) {
}
