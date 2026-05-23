package pt.doutortrabalho.legalqa.application.usecase;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.doutortrabalho.legalqa.application.dto.LegalAnswerResponse;
import pt.doutortrabalho.legalqa.application.dto.LegalQuestionRequest;
import pt.doutortrabalho.legalqa.domain.model.QaSession;
import pt.doutortrabalho.legalqa.domain.port.out.AiLegalAdvisor;
import pt.doutortrabalho.legalqa.domain.port.out.QaSessionRepository;
import pt.doutortrabalho.shared.exception.ResourceNotFoundException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AskLegalQuestionService")
class AskLegalQuestionServiceTest {

    @Mock
    private QaSessionRepository sessionRepository;

    @Mock
    private AiLegalAdvisor aiLegalAdvisor;

    @InjectMocks
    private AskLegalQuestionService service;

    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final String USER_ID = "user-123";

    @Nested
    @DisplayName("when asking a new question")
    class NewQuestion {

        @Test
        @DisplayName("should create a new session when sessionId is null")
        void shouldCreateNewSession() {
            // Given
            var request = new LegalQuestionRequest(null, "Quantos dias de ferias tenho direito?");

            var savedSession = new QaSession(TENANT_ID, USER_ID, "Quantos dias de ferias tenho direito?");
            when(sessionRepository.save(any(QaSession.class))).thenReturn(savedSession);

            var aiResponse = new LegalAnswerResponse(
                    savedSession.getId(), null, request.question(),
                    "Tem direito a 22 dias uteis de ferias por ano.",
                    List.of(new LegalAnswerResponse.CitationDto(
                            "Lei 7/2009", "Artigo 238", "O periodo anual de ferias...",
                            "https://dre.pt/art238", "CODIGO_TRABALHO")),
                    new LegalAnswerResponse.AnswerMetadata(500, 200, 1500L, Instant.now()));

            when(aiLegalAdvisor.advise(eq(request.question()), any(UUID.class)))
                    .thenReturn(aiResponse);

            // When
            LegalAnswerResponse result = service.ask(request, TENANT_ID, USER_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.answer()).isEqualTo("Tem direito a 22 dias uteis de ferias por ano.");
            assertThat(result.citations()).hasSize(1);
            assertThat(result.citations().get(0).article()).isEqualTo("Artigo 238");

            // Verify session was saved twice (create + update with exchange)
            verify(sessionRepository, times(2)).save(any(QaSession.class));
        }

        @Test
        @DisplayName("should auto-generate title from question when creating new session")
        void shouldAutoGenerateTitle() {
            // Given
            String longQuestion = "A".repeat(100);
            var request = new LegalQuestionRequest(null, longQuestion);

            ArgumentCaptor<QaSession> sessionCaptor = ArgumentCaptor.forClass(QaSession.class);
            when(sessionRepository.save(sessionCaptor.capture()))
                    .thenAnswer(inv -> inv.getArgument(0));

            var aiResponse = new LegalAnswerResponse(
                    UUID.randomUUID(), null, longQuestion, "Answer",
                    List.of(),
                    new LegalAnswerResponse.AnswerMetadata(100, 50, 500L, Instant.now()));
            when(aiLegalAdvisor.advise(any(), any())).thenReturn(aiResponse);

            // When
            service.ask(request, TENANT_ID, USER_ID);

            // Then - first save is the new session creation
            QaSession createdSession = sessionCaptor.getAllValues().get(0);
            assertThat(createdSession.getTitle()).hasSize(80);
            assertThat(createdSession.getTitle()).endsWith("...");
        }
    }

    @Nested
    @DisplayName("when continuing an existing session")
    class ExistingSession {

        @Test
        @DisplayName("should use existing session when sessionId is provided")
        void shouldUseExistingSession() {
            // Given
            UUID sessionId = UUID.randomUUID();
            var request = new LegalQuestionRequest(sessionId, "E sobre o trabalho noturno?");

            var existingSession = new QaSession(TENANT_ID, USER_ID, "Ferias e horarios");
            when(sessionRepository.findByIdAndTenantIdAndDeletedAtIsNull(sessionId, TENANT_ID))
                    .thenReturn(Optional.of(existingSession));

            var aiResponse = new LegalAnswerResponse(
                    sessionId, null, request.question(),
                    "O trabalho noturno e regulado pelo Artigo 223.",
                    List.of(),
                    new LegalAnswerResponse.AnswerMetadata(300, 150, 1200L, Instant.now()));
            when(aiLegalAdvisor.advise(eq(request.question()), any())).thenReturn(aiResponse);
            when(sessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            // When
            LegalAnswerResponse result = service.ask(request, TENANT_ID, USER_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.answer()).contains("Artigo 223");
            // Session was found, not created - only one save for the exchange update
            verify(sessionRepository, times(1)).save(any(QaSession.class));
            verify(sessionRepository).findByIdAndTenantIdAndDeletedAtIsNull(sessionId, TENANT_ID);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when session does not exist")
        void shouldThrowWhenSessionNotFound() {
            // Given
            UUID sessionId = UUID.randomUUID();
            var request = new LegalQuestionRequest(sessionId, "Uma pergunta qualquer");

            when(sessionRepository.findByIdAndTenantIdAndDeletedAtIsNull(sessionId, TENANT_ID))
                    .thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> service.ask(request, TENANT_ID, USER_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining(sessionId.toString());
        }
    }

    @Nested
    @DisplayName("when AI response includes metrics")
    class MetricsRecording {

        @Test
        @DisplayName("should record token usage and latency metrics on the exchange")
        void shouldRecordMetrics() {
            // Given
            var request = new LegalQuestionRequest(null, "Qual o periodo experimental?");

            when(sessionRepository.save(any(QaSession.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            var aiResponse = new LegalAnswerResponse(
                    UUID.randomUUID(), null, request.question(),
                    "O periodo experimental varia...",
                    List.of(),
                    new LegalAnswerResponse.AnswerMetadata(450, 180, 2000L, Instant.now()));
            when(aiLegalAdvisor.advise(any(), any())).thenReturn(aiResponse);

            // When
            LegalAnswerResponse result = service.ask(request, TENANT_ID, USER_ID);

            // Then
            assertThat(result.metadata()).isNotNull();
            assertThat(result.metadata().tokensInput()).isEqualTo(450);
            assertThat(result.metadata().tokensOutput()).isEqualTo(180);
            assertThat(result.metadata().latencyMs()).isEqualTo(2000L);
        }
    }
}
