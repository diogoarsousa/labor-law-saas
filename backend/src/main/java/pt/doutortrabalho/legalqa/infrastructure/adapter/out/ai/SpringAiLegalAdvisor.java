package pt.doutortrabalho.legalqa.infrastructure.adapter.out.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import pt.doutortrabalho.legalqa.application.dto.LegalAnswerResponse;
import pt.doutortrabalho.legalqa.domain.port.out.AiLegalAdvisor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Infrastructure adapter that bridges the domain port to Spring AI ChatClient.
 * Uses the pre-configured legalQaChatClient with RAG advisors and tool calling.
 */
@Component
public class SpringAiLegalAdvisor implements AiLegalAdvisor {

    private static final Logger log = LoggerFactory.getLogger(SpringAiLegalAdvisor.class);

    private final ChatClient chatClient;

    public SpringAiLegalAdvisor(@Qualifier("legalQaChatClient") ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public LegalAnswerResponse advise(String question, UUID sessionId) {
        log.debug("Sending question to AI: sessionId={}, question='{}'",
                sessionId, truncate(question, 100));

        long startTime = System.currentTimeMillis();

        ChatResponse chatResponse = chatClient.prompt()
                .advisors(advisorSpec -> advisorSpec.param(
                        MessageChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY,
                        sessionId.toString()))
                .user(question)
                .call()
                .chatResponse();

        long latencyMs = System.currentTimeMillis() - startTime;

        String answer = chatResponse.getResult().getOutput().getText();

        // Extract token usage from the response metadata
        Integer tokensInput = null;
        Integer tokensOutput = null;
        if (chatResponse.getMetadata() != null && chatResponse.getMetadata().getUsage() != null) {
            var usage = chatResponse.getMetadata().getUsage();
            tokensInput = (int) usage.getPromptTokens();
            tokensOutput = (int) usage.getCompletionTokens();
        }

        log.info("AI response received: sessionId={}, latency={}ms, tokensIn={}, tokensOut={}",
                sessionId, latencyMs, tokensInput, tokensOutput);

        // For MVP, citations are extracted from the answer text.
        // A dedicated CitationExtractionAdvisor will be added in a future sprint.
        return new LegalAnswerResponse(
                sessionId,
                null, // exchangeId is assigned after persistence
                question,
                answer,
                List.of(), // Citations to be extracted by post-processing
                new LegalAnswerResponse.AnswerMetadata(
                        tokensInput, tokensOutput, latencyMs, Instant.now()));
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) + "..." : text;
    }
}
