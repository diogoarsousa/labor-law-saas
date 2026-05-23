package pt.doutortrabalho.shared.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import pt.doutortrabalho.legalqa.infrastructure.adapter.out.ai.LaborLawCalculatorTools;

/**
 * Spring AI configuration for the Legal Q&A bounded context.
 * Configures the ChatClient with RAG advisors, memory, and tool calling.
 */
@Configuration
public class AiConfig {

    @Value("${app.legal-qa.max-history-messages:10}")
    private int maxHistoryMessages;

    @Value("${app.legal-qa.rag.top-k:20}")
    private int topK;

    @Value("${app.legal-qa.rag.similarity-threshold:0.7}")
    private double similarityThreshold;

    private static final String LEGAL_QA_SYSTEM_PROMPT = """
            You are Doutor do Trabalho, an expert AI assistant specializing in Portuguese Labor Law
            (Codigo do Trabalho - Lei n.o 7/2009 and related legislation).

            ## Your Role
            - Answer questions about Portuguese labor law accurately and comprehensively
            - Always cite specific articles (e.g., "Artigo 238.o do Codigo do Trabalho")
            - When uncertain, clearly state your level of confidence
            - Respond in Portuguese (European Portuguese) unless the user writes in another language

            ## Response Format
            1. Direct answer to the question
            2. Legal basis with specific article citations
            3. Practical implications or examples when relevant
            4. Caveats or exceptions to be aware of

            ## Important Rules
            - NEVER provide advice that contradicts current legislation
            - Always note when legislation has been recently amended
            - Distinguish between mandatory rules (normas imperativas) and default rules (normas supletivas)
            - Reference collective bargaining agreements (CCT) when relevant
            - If the question is outside Portuguese labor law, politely redirect

            ## Context
            Use the retrieved legal documents to ground your answers. Only cite articles that appear
            in the provided context. If the context does not contain relevant information, say so
            explicitly rather than inventing citations.
            """;

    @Bean
    public ChatMemory chatMemory() {
        return new InMemoryChatMemory();
    }

    @Bean("legalQaChatClient")
    public ChatClient legalQaChatClient(
            ChatClient.Builder builder,
            VectorStore vectorStore,
            ChatMemory chatMemory) {

        SearchRequest searchRequest = SearchRequest.builder()
                .topK(topK)
                .similarityThreshold(similarityThreshold)
                .build();

        return builder
                .defaultSystem(LEGAL_QA_SYSTEM_PROMPT)
                .defaultAdvisors(
                        new MessageChatMemoryAdvisor(chatMemory, maxHistoryMessages),
                        new QuestionAnswerAdvisor(vectorStore, searchRequest)
                )
                .defaultTools(new LaborLawCalculatorTools())
                .build();
    }
}
