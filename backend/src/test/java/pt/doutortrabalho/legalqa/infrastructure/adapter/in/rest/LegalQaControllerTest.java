package pt.doutortrabalho.legalqa.infrastructure.adapter.in.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pt.doutortrabalho.legalqa.application.dto.LegalAnswerResponse;
import pt.doutortrabalho.legalqa.application.dto.LegalQuestionRequest;
import pt.doutortrabalho.legalqa.application.dto.SessionSummaryResponse;
import pt.doutortrabalho.legalqa.domain.port.in.AskLegalQuestionUseCase;
import pt.doutortrabalho.legalqa.domain.port.in.ManageSessionUseCase;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LegalQaController.class)
@DisplayName("LegalQaController")
class LegalQaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AskLegalQuestionUseCase askLegalQuestionUseCase;

    @MockitoBean
    private ManageSessionUseCase manageSessionUseCase;

    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final String USER_ID = "user-789";

    @Nested
    @DisplayName("POST /api/v1/doutor-trabalho/legal-qa/ask")
    class AskEndpoint {

        @Test
        @DisplayName("should return 200 with answer when authenticated")
        void shouldReturnAnswer() throws Exception {
            var request = new LegalQuestionRequest(null, "Quantos dias de ferias tenho?");
            UUID sessionId = UUID.randomUUID();
            UUID exchangeId = UUID.randomUUID();

            var response = new LegalAnswerResponse(
                    sessionId, exchangeId, request.question(),
                    "Tem direito a 22 dias uteis de ferias.",
                    List.of(new LegalAnswerResponse.CitationDto(
                            "Lei 7/2009", "Artigo 238",
                            "O periodo anual de ferias tem a duracao minima de 22 dias uteis.",
                            "https://dre.pt/art238", "CODIGO_TRABALHO")),
                    new LegalAnswerResponse.AnswerMetadata(500, 200, 1500L, Instant.now()));

            when(askLegalQuestionUseCase.ask(any(), any(), any())).thenReturn(response);

            mockMvc.perform(post("/api/v1/doutor-trabalho/legal-qa/ask")
                            .with(jwt()
                                    .jwt(j -> j.claim("tenant_id", TENANT_ID.toString())
                                            .claim("sub", USER_ID)
                                            .claim("realm_access",
                                                    java.util.Map.of("roles", List.of("HR")))))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.answer").value("Tem direito a 22 dias uteis de ferias."))
                    .andExpect(jsonPath("$.data.citations[0].article").value("Artigo 238"))
                    .andExpect(jsonPath("$.data.sessionId").value(sessionId.toString()))
                    .andExpect(jsonPath("$.meta.timestamp").exists());
        }

        @Test
        @DisplayName("should return 422 when question is blank")
        void shouldRejectBlankQuestion() throws Exception {
            var request = new LegalQuestionRequest(null, "");

            mockMvc.perform(post("/api/v1/doutor-trabalho/legal-qa/ask")
                            .with(jwt()
                                    .jwt(j -> j.claim("tenant_id", TENANT_ID.toString())
                                            .claim("sub", USER_ID)))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.errors").isArray());
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void shouldRejectUnauthenticated() throws Exception {
            var request = new LegalQuestionRequest(null, "Uma pergunta qualquer");

            mockMvc.perform(post("/api/v1/doutor-trabalho/legal-qa/ask")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/doutor-trabalho/legal-qa/sessions")
    class ListSessionsEndpoint {

        @Test
        @DisplayName("should return list of sessions")
        void shouldReturnSessions() throws Exception {
            var sessions = List.of(
                    SessionSummaryResponse.summary(
                            UUID.randomUUID(), "Ferias", 3,
                            Instant.now(), Instant.now()));

            when(manageSessionUseCase.listSessions(any(), any())).thenReturn(sessions);

            mockMvc.perform(get("/api/v1/doutor-trabalho/legal-qa/sessions")
                            .with(jwt()
                                    .jwt(j -> j.claim("tenant_id", TENANT_ID.toString())
                                            .claim("sub", USER_ID))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].title").value("Ferias"))
                    .andExpect(jsonPath("$.data[0].exchangeCount").value(3));
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/doutor-trabalho/legal-qa/sessions/{id}")
    class DeleteSessionEndpoint {

        @Test
        @DisplayName("should return 204 when session deleted")
        void shouldReturn204() throws Exception {
            UUID sessionId = UUID.randomUUID();

            mockMvc.perform(delete("/api/v1/doutor-trabalho/legal-qa/sessions/" + sessionId)
                            .with(jwt()
                                    .jwt(j -> j.claim("tenant_id", TENANT_ID.toString())
                                            .claim("sub", USER_ID)))
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }
    }
}
