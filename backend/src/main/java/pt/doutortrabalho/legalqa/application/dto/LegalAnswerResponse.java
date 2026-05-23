package pt.doutortrabalho.legalqa.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for a legal Q&A answer.
 * Contains the AI-generated answer, citations, and metadata.
 */
public record LegalAnswerResponse(
        UUID sessionId,
        UUID exchangeId,
        String question,
        String answer,
        List<CitationDto> citations,
        AnswerMetadata metadata
) {

    public record CitationDto(
            String lawNumber,
            String article,
            String articleText,
            String sourceUrl,
            String corpusType
    ) {
    }

    public record AnswerMetadata(
            Integer tokensInput,
            Integer tokensOutput,
            Long latencyMs,
            Instant timestamp
    ) {
    }
}
