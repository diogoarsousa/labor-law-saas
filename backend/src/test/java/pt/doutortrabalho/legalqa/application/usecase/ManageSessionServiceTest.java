package pt.doutortrabalho.legalqa.application.usecase;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.doutortrabalho.legalqa.application.dto.SessionSummaryResponse;
import pt.doutortrabalho.legalqa.domain.model.QaSession;
import pt.doutortrabalho.legalqa.domain.port.out.QaSessionRepository;
import pt.doutortrabalho.shared.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ManageSessionService")
class ManageSessionServiceTest {

    @Mock
    private QaSessionRepository sessionRepository;

    @InjectMocks
    private ManageSessionService service;

    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final String USER_ID = "user-456";

    @Nested
    @DisplayName("listSessions")
    class ListSessions {

        @Test
        @DisplayName("should return empty list when user has no sessions")
        void shouldReturnEmptyList() {
            when(sessionRepository.findByTenantIdAndUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(
                    TENANT_ID, USER_ID))
                    .thenReturn(List.of());

            List<SessionSummaryResponse> result = service.listSessions(TENANT_ID, USER_ID);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should return session summaries ordered by update date")
        void shouldReturnSessionSummaries() {
            var session1 = new QaSession(TENANT_ID, USER_ID, "Ferias");
            var session2 = new QaSession(TENANT_ID, USER_ID, "Despedimento");

            when(sessionRepository.findByTenantIdAndUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(
                    TENANT_ID, USER_ID))
                    .thenReturn(List.of(session2, session1));

            List<SessionSummaryResponse> result = service.listSessions(TENANT_ID, USER_ID);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).title()).isEqualTo("Despedimento");
            assertThat(result.get(1).title()).isEqualTo("Ferias");
        }
    }

    @Nested
    @DisplayName("getSession")
    class GetSession {

        @Test
        @DisplayName("should throw when session not found")
        void shouldThrowWhenNotFound() {
            UUID sessionId = UUID.randomUUID();
            when(sessionRepository.findByIdAndTenantIdAndDeletedAtIsNull(sessionId, TENANT_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.getSession(sessionId, TENANT_ID, USER_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should return session with exchanges")
        void shouldReturnSessionWithExchanges() {
            UUID sessionId = UUID.randomUUID();
            var session = new QaSession(TENANT_ID, USER_ID, "Test Session");

            when(sessionRepository.findByIdAndTenantIdAndDeletedAtIsNull(sessionId, TENANT_ID))
                    .thenReturn(Optional.of(session));

            SessionSummaryResponse result = service.getSession(sessionId, TENANT_ID, USER_ID);

            assertThat(result.title()).isEqualTo("Test Session");
            assertThat(result.exchanges()).isEmpty();
        }
    }

    @Nested
    @DisplayName("renameSession")
    class RenameSession {

        @Test
        @DisplayName("should rename session and save")
        void shouldRenameAndSave() {
            UUID sessionId = UUID.randomUUID();
            var session = new QaSession(TENANT_ID, USER_ID, "Old Title");

            when(sessionRepository.findByIdAndTenantIdAndDeletedAtIsNull(sessionId, TENANT_ID))
                    .thenReturn(Optional.of(session));
            when(sessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.renameSession(sessionId, "New Title", TENANT_ID, USER_ID);

            assertThat(session.getTitle()).isEqualTo("New Title");
            verify(sessionRepository).save(session);
        }
    }

    @Nested
    @DisplayName("deleteSession")
    class DeleteSession {

        @Test
        @DisplayName("should soft-delete session")
        void shouldSoftDelete() {
            UUID sessionId = UUID.randomUUID();
            var session = new QaSession(TENANT_ID, USER_ID, "To Delete");

            when(sessionRepository.findByIdAndTenantIdAndDeletedAtIsNull(sessionId, TENANT_ID))
                    .thenReturn(Optional.of(session));
            when(sessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.deleteSession(sessionId, TENANT_ID, USER_ID);

            assertThat(session.isDeleted()).isTrue();
            assertThat(session.getDeletedAt()).isNotNull();
            verify(sessionRepository).save(session);
        }
    }
}
