package pt.doutortrabalho.legalqa.domain.port.out;

import pt.doutortrabalho.legalqa.application.dto.LegalAnswerResponse;

import java.util.UUID;

/**
 * Driven port for the AI advisory service.
 * Abstracts the Spring AI ChatClient interaction so the domain
 * remains framework-independent.
 */
public interface AiLegalAdvisor {

    /**
     * Send a legal question to the AI and receive a grounded answer.
     *
     * @param question  the user's question in natural language
     * @param sessionId the conversation session ID for memory context
     * @return the AI answer with citations and metadata
     */
    LegalAnswerResponse advise(String question, UUID sessionId);
}
