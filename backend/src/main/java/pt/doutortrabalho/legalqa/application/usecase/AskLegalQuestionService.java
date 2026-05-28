package pt.doutortrabalho.legalqa.application.usecase;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.doutortrabalho.legalqa.application.dto.LegalAnswerResponse;
import pt.doutortrabalho.legalqa.application.dto.LegalQuestionRequest;
import pt.doutortrabalho.legalqa.domain.model.Citation;
import pt.doutortrabalho.legalqa.domain.model.CorpusType;
import pt.doutortrabalho.legalqa.domain.model.QaSession;
import pt.doutortrabalho.legalqa.domain.port.in.AskLegalQuestionUseCase;
import pt.doutortrabalho.legalqa.domain.port.out.AiLegalAdvisor;
import pt.doutortrabalho.legalqa.domain.port.out.QaSessionRepository;
import pt.doutortrabalho.shared.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Application service implementing the core Legal Q&A use case.
 * Orchestrates session management, AI interaction, and persistence.
 */
@Service
@Transactional
public class AskLegalQuestionService implements AskLegalQuestionUseCase {

    private static final Logger log = LoggerFactory.getLogger(AskLegalQuestionService.class);

    private final QaSessionRepository sessionRepository;
    private final AiLegalAdvisor aiLegalAdvisor;

    public AskLegalQuestionService(QaSessionRepository sessionRepository,
                                    AiLegalAdvisor aiLegalAdvisor) {
        this.sessionRepository = sessionRepository;
        this.aiLegalAdvisor = aiLegalAdvisor;
    }

    @Override
    public LegalAnswerResponse ask(LegalQuestionRequest request, UUID tenantId, String userId) {
        log.info("Processing legal question for user={}, tenant={}, sessionId={}",
                userId, tenantId, request.sessionId());

        // Find or create session
        QaSession session = resolveSession(request.sessionId(), tenantId, userId, request.question());

        // Get AI answer via the driven port
        LegalAnswerResponse aiResponse = aiLegalAdvisor.advise(request.question(), session.getId());

        // Convert citation DTOs to domain entities and persist the exchange
        List<Citation> domainCitations = aiResponse.citations().stream()
                .map(c -> new Citation(
                        c.lawNumber(),
                        c.article(),
                        c.articleText(),
                        c.sourceUrl(),
                        parseCorpusType(c.corpusType())))
                .toList();

        var exchange = session.addExchange(
                request.question(),
                aiResponse.answer(),
                domainCitations);

        if (aiResponse.metadata() != null) {
            exchange.recordMetrics(
                    aiResponse.metadata().tokensInput() != null ? aiResponse.metadata().tokensInput() : 0,
                    aiResponse.metadata().tokensOutput() != null ? aiResponse.metadata().tokensOutput() : 0,
                    aiResponse.metadata().latencyMs() != null ? aiResponse.metadata().latencyMs() : 0L);
        }

        sessionRepository.save(session);

        log.info("Legal question answered: sessionId={}, exchangeId={}, citations={}",
                session.getId(), exchange.getId(), domainCitations.size());

        // Return response with the persisted exchange ID and session ID
        return new LegalAnswerResponse(
                session.getId(),
                exchange.getId(),
                request.question(),
                aiResponse.answer(),
                aiResponse.citations(),
                aiResponse.metadata());
    }

    private QaSession resolveSession(UUID sessionId, UUID tenantId, String userId, String question) {
        if (sessionId != null) {
            return sessionRepository.findByIdAndTenantIdAndDeletedAtIsNull(sessionId, tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("QaSession", sessionId.toString()));
        }
        // Auto-generate title from first question (truncate to 80 chars)
        String title = question.length() > 80
                ? question.substring(0, 77) + "..."
                : question;
        return sessionRepository.save(new QaSession(tenantId, userId, title));
    }

    private CorpusType parseCorpusType(String corpusType) {
        if (corpusType == null || corpusType.isBlank()) {
            return CorpusType.CODIGO_TRABALHO;
        }
        try {
            return CorpusType.valueOf(corpusType.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown corpus type '{}', defaulting to CODIGO_TRABALHO", corpusType);
            return CorpusType.CODIGO_TRABALHO;
        }
    }
}
