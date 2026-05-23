package pt.doutortrabalho.legalqa.domain.port.in;

import pt.doutortrabalho.legalqa.application.dto.LegalQuestionRequest;
import pt.doutortrabalho.legalqa.application.dto.LegalAnswerResponse;

import java.util.UUID;

/**
 * Driving port for the core Legal Q&A use case.
 * Accepts a user question and returns an AI-generated answer
 * grounded in Portuguese labor law via RAG.
 */
public interface AskLegalQuestionUseCase {

    /**
     * Process a legal question and return a cited answer.
     *
     * @param request  the question request with session context
     * @param tenantId the tenant making the request
     * @param userId   the user making the request
     * @return the AI-generated answer with citations
     */
    LegalAnswerResponse ask(LegalQuestionRequest request, UUID tenantId, String userId);
}
