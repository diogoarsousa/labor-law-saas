package pt.doutortrabalho.auth.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for user login.
 */
public record LoginRequest(

        @NotBlank(message = "O email e obrigatorio")
        @Email(message = "O email deve ser valido")
        String email,

        @NotBlank(message = "A password e obrigatoria")
        String password
) {
}
