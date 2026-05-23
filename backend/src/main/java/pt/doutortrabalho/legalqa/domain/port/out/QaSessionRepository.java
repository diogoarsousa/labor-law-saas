package pt.doutortrabalho.legalqa.domain.port.out;

import pt.doutortrabalho.legalqa.domain.model.QaSession;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Driven port for QA session persistence.
 * Defined in the domain layer; implemented by the infrastructure adapter.
 */
public interface QaSessionRepository {

    QaSession save(QaSession session);

    Optional<QaSession> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<QaSession> findByTenantIdAndUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(
            UUID tenantId, String userId);
}
