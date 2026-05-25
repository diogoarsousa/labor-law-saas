package pt.doutortrabalho.legalqa.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for a Q&A session summary.
 */
public record SessionSummaryResponse(
        UUID id,
        String title,
        int exchangeCount,
        Instant createdAt,
        Instant updatedAt,
        List<LegalAnswerResponse> exchanges
) {

    /**
     * Factory for a summary without exchanges (list view).
     */
    public static SessionSummaryResponse summary(UUID id, String title,
                                                   int exchangeCount,
                                                   Instant createdAt,
                                                   Instant updatedAt) {
        return new SessionSummaryResponse(id, title, exchangeCount, createdAt, updatedAt, null);
    }
}
