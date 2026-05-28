package pt.doutortrabalho.auth.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for user registration.
 */
public record RegisterRequest(

        @NotBlank(message = "O primeiro nome e obrigatorio")
        @Size(max = 100, message = "O primeiro nome nao pode exceder 100 caracteres")
        String firstName,

        @NotBlank(message = "O ultimo nome e obrigatorio")
        @Size(max = 100, message = "O ultimo nome nao pode exceder 100 caracteres")
        String lastName,

        @NotBlank(message = "O email e obrigatorio")
        @Email(message = "O email deve ser valido")
        String email,

        @NotBlank(message = "A password e obrigatoria")
        @Size(min = 8, max = 128, message = "A password deve ter entre 8 e 128 caracteres")
        String password,

        @Size(max = 200, message = "O nome da organizacao nao pode exceder 200 caracteres")
        String organizationName
) {
}
