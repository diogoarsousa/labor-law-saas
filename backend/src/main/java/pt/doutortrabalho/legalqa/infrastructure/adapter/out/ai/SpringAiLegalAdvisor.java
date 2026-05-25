package pt.doutortrabalho.legalqa.infrastructure.adapter.out.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import pt.doutortrabalho.legalqa.application.dto.LegalAnswerResponse;
import pt.doutortrabalho.legalqa.domain.port.out.AiLegalAdvisor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class SpringAiLegalAdvisor implements AiLegalAdvisor {

    private static final Logger log = LoggerFactory.getLogger(SpringAiLegalAdvisor.class);

    private final ChatClient chatClient;
    private final ChatMemory chatMemory;
    private final VectorStore vectorStore;

    @Value("${app.legal-qa.rag.top-k:20}")
    private int topK;

    @Value("${app.legal-qa.rag.similarity-threshold:0.7}")
    private double similarityThreshold;

    public SpringAiLegalAdvisor(
            @Qualifier("legalQaChatClient") ChatClient chatClient,
            ChatMemory chatMemory,
            VectorStore vectorStore) {
        this.chatClient = chatClient;
        this.chatMemory = chatMemory;
        this.vectorStore = vectorStore;
    }

    @Override
    public LegalAnswerResponse advise(String question, UUID sessionId) {
        log.debug("Sending question to AI: sessionId={}, question='{}'",
                sessionId, truncate(question, 100));

        long startTime = System.currentTimeMillis();

        // RAG: retrieve relevant legal documents from pgvector
        List<Document> relevantDocs = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(topK)
                        .similarityThreshold(similarityThreshold)
                        .build());

        String ragContext = relevantDocs.stream()
                .map(Document::getText)
                .filter(text -> text != null && !text.isBlank())
                .collect(Collectors.joining("\n\n---\n\n"));

        String userMessage = ragContext.isEmpty() ? question :
                "CONTEXTO LEGAL:\n" + ragContext + "\n\nPERGUNTA:\n" + question;

        log.debug("RAG retrieved {} documents for sessionId={}", relevantDocs.size(), sessionId);

        ChatResponse chatResponse = chatClient.prompt()
                .advisors(
                        MessageChatMemoryAdvisor.builder(chatMemory)
                                .conversationId(sessionId.toString())
                                .build()
                )
                .user(userMessage)
                .call()
                .chatResponse();

        long latencyMs = System.currentTimeMillis() - startTime;

        String answer = chatResponse.getResult().getOutput().getText();

        Integer tokensInput = null;
        Integer tokensOutput = null;
        if (chatResponse.getMetadata() != null && chatResponse.getMetadata().getUsage() != null) {
            var usage = chatResponse.getMetadata().getUsage();
            tokensInput = (int) usage.getPromptTokens();
            tokensOutput = (int) usage.getCompletionTokens();
        }

        log.info("AI response received: sessionId={}, latency={}ms, tokensIn={}, tokensOut={}, ragDocs={}",
                sessionId, latencyMs, tokensInput, tokensOutput, relevantDocs.size());

        return new LegalAnswerResponse(
                sessionId,
                null,
                question,
                answer,
                List.of(),
                new LegalAnswerResponse.AnswerMetadata(
                        tokensInput, tokensOutput, latencyMs, Instant.now()));
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) + "..." : text;
    }
}
