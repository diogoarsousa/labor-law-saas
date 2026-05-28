package pt.doutortrabalho.legalqa.infrastructure.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.doutortrabalho.legalqa.domain.model.QaSession;
import pt.doutortrabalho.legalqa.domain.port.out.QaSessionRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA implementation of the QaSessionRepository driven port.
 * Spring Data JPA auto-generates the queries from method names.
 */
@Repository
public interface JpaQaSessionRepository extends JpaRepository<QaSession, UUID>, QaSessionRepository {

    @Override
    Optional<QaSession> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    @Override
    List<QaSession> findByTenantIdAndUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(
            UUID tenantId, String userId);
}
