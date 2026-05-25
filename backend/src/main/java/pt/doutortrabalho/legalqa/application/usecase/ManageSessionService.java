package pt.doutortrabalho.legalqa.application.usecase;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.doutortrabalho.legalqa.application.dto.LegalAnswerResponse;
import pt.doutortrabalho.legalqa.application.dto.SessionSummaryResponse;
import pt.doutortrabalho.legalqa.domain.model.QaExchange;
import pt.doutortrabalho.legalqa.domain.model.QaSession;
import pt.doutortrabalho.legalqa.domain.port.in.ManageSessionUseCase;
import pt.doutortrabalho.legalqa.domain.port.out.QaSessionRepository;
import pt.doutortrabalho.shared.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Application service for managing Q&A conversation sessions.
 */
@Service
@Transactional(readOnly = true)
public class ManageSessionService implements ManageSessionUseCase {

    private static final Logger log = LoggerFactory.getLogger(ManageSessionService.class);

    private final QaSessionRepository sessionRepository;

    public ManageSessionService(QaSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Override
    public List<SessionSummaryResponse> listSessions(UUID tenantId, String userId) {
        return sessionRepository
                .findByTenantIdAndUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(tenantId, userId)
                .stream()
                .map(s -> SessionSummaryResponse.summary(
                        s.getId(), s.getTitle(), s.getExchanges().size(),
                        s.getCreatedAt(), s.getUpdatedAt()))
                .toList();
    }

    @Override
    public SessionSummaryResponse getSession(UUID sessionId, UUID tenantId, String userId) {
        QaSession session = findSession(sessionId, tenantId);

        List<LegalAnswerResponse> exchanges = session.getExchanges().stream()
                .map(this::toExchangeDto)
                .toList();

        return new SessionSummaryResponse(
                session.getId(), session.getTitle(), exchanges.size(),
                session.getCreatedAt(), session.getUpdatedAt(), exchanges);
    }

    @Override
    @Transactional
    public void renameSession(UUID sessionId, String newTitle, UUID tenantId, String userId) {
        QaSession session = findSession(sessionId, tenantId);
        session.rename(newTitle);
        sessionRepository.save(session);
        log.info("Session renamed: id={}, newTitle={}", sessionId, newTitle);
    }

    @Override
    @Transactional
    public void deleteSession(UUID sessionId, UUID tenantId, String userId) {
        QaSession session = findSession(sessionId, tenantId);
        session.softDelete();
        sessionRepository.save(session);
        log.info("Session soft-deleted: id={}", sessionId);
    }

    private QaSession findSession(UUID sessionId, UUID tenantId) {
        return sessionRepository.findByIdAndTenantIdAndDeletedAtIsNull(sessionId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("QaSession", sessionId.toString()));
    }

    private LegalAnswerResponse toExchangeDto(QaExchange exchange) {
        var citations = exchange.getCitations().stream()
                .map(c -> new LegalAnswerResponse.CitationDto(
                        c.getLawNumber(), c.getArticle(), c.getArticleText(),
                        c.getSourceUrl(), c.getCorpusType().name()))
                .toList();

        return new LegalAnswerResponse(
                exchange.getSession().getId(),
                exchange.getId(),
                exchange.getQuestion(),
                exchange.getAnswer(),
                citations,
                new LegalAnswerResponse.AnswerMetadata(
                        exchange.getTokensInput(),
                        exchange.getTokensOutput(),
                        exchange.getLatencyMs(),
                        exchange.getCreatedAt()));
    }
}
