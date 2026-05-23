package pt.doutortrabalho.legalqa.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Request DTO for asking a legal question.
 */
public record LegalQuestionRequest(

        UUID sessionId,

        @NotBlank(message = "A pergunta nao pode estar vazia")
        @Size(min = 5, max = 5000, message = "A pergunta deve ter entre 5 e 5000 caracteres")
        String question
) {
}
