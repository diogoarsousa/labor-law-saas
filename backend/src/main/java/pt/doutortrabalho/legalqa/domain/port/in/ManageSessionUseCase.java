package pt.doutortrabalho.legalqa.domain.port.in;

import pt.doutortrabalho.legalqa.application.dto.SessionSummaryResponse;

import java.util.List;
import java.util.UUID;

/**
 * Driving port for managing Q&A conversation sessions.
 */
public interface ManageSessionUseCase {

    /**
     * List all active sessions for a user within a tenant.
     */
    List<SessionSummaryResponse> listSessions(UUID tenantId, String userId);

    /**
     * Get a specific session with its full exchange history.
     */
    SessionSummaryResponse getSession(UUID sessionId, UUID tenantId, String userId);

    /**
     * Rename a session.
     */
    void renameSession(UUID sessionId, String newTitle, UUID tenantId, String userId);

    /**
     * Soft-delete a session.
     */
    void deleteSession(UUID sessionId, UUID tenantId, String userId);
}
