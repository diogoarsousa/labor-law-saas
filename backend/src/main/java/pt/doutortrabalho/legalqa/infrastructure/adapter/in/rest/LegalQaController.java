package pt.doutortrabalho.legalqa.infrastructure.adapter.in.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pt.doutortrabalho.legalqa.application.dto.LegalAnswerResponse;
import pt.doutortrabalho.legalqa.application.dto.LegalQuestionRequest;
import pt.doutortrabalho.legalqa.application.dto.SessionSummaryResponse;
import pt.doutortrabalho.legalqa.domain.port.in.AskLegalQuestionUseCase;
import pt.doutortrabalho.legalqa.domain.port.in.ManageSessionUseCase;
import pt.doutortrabalho.shared.dto.ApiResponse;
import pt.doutortrabalho.shared.security.TenantContext;

import java.util.List;
import java.util.UUID;

/**
 * REST adapter (driving adapter) for the Legal Q&A bounded context.
 * Exposes endpoints under /api/v1/doutor-trabalho/legal-qa/.
 */
@RestController
@RequestMapping("/api/v1/doutor-trabalho/legal-qa")
@Tag(name = "Legal Q&A", description = "AI-powered Portuguese Labor Law Q&A")
@SecurityRequirement(name = "bearer-jwt")
public class LegalQaController {

    private static final Logger log = LoggerFactory.getLogger(LegalQaController.class);

    private final AskLegalQuestionUseCase askLegalQuestionUseCase;
    private final ManageSessionUseCase manageSessionUseCase;

    public LegalQaController(AskLegalQuestionUseCase askLegalQuestionUseCase,
                              ManageSessionUseCase manageSessionUseCase) {
        this.askLegalQuestionUseCase = askLegalQuestionUseCase;
        this.manageSessionUseCase = manageSessionUseCase;
    }

    @PostMapping("/ask")
    @Operation(summary = "Ask a legal question",
            description = "Submit a Portuguese labor law question and receive an AI-generated answer with citations.")
    @PreAuthorize("hasAnyRole('WORKER', 'HR', 'LAWYER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LegalAnswerResponse>> askQuestion(
            @Valid @RequestBody LegalQuestionRequest request) {

        UUID tenantId = TenantContext.getCurrentTenantId()
                .orElseThrow(() -> new IllegalArgumentException("Tenant ID not found in token"));
        String userId = TenantContext.getCurrentUserId()
                .orElseThrow(() -> new IllegalArgumentException("User ID not found in token"));

        log.info("POST /legal-qa/ask - user={}, sessionId={}", userId, request.sessionId());

        LegalAnswerResponse response = askLegalQuestionUseCase.ask(request, tenantId, userId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(response));
    }

    @GetMapping("/sessions")
    @Operation(summary = "List conversation sessions",
            description = "Retrieve all active Q&A sessions for the current user.")
    @PreAuthorize("hasAnyRole('WORKER', 'HR', 'LAWYER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<SessionSummaryResponse>>> listSessions() {

        UUID tenantId = TenantContext.getCurrentTenantId()
                .orElseThrow(() -> new IllegalArgumentException("Tenant ID not found in token"));
        String userId = TenantContext.getCurrentUserId()
                .orElseThrow(() -> new IllegalArgumentException("User ID not found in token"));

        List<SessionSummaryResponse> sessions = manageSessionUseCase.listSessions(tenantId, userId);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @GetMapping("/sessions/{sessionId}")
    @Operation(summary = "Get a conversation session",
            description = "Retrieve a specific Q&A session with full exchange history.")
    @PreAuthorize("hasAnyRole('WORKER', 'HR', 'LAWYER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SessionSummaryResponse>> getSession(
            @PathVariable UUID sessionId) {

        UUID tenantId = TenantContext.getCurrentTenantId()
                .orElseThrow(() -> new IllegalArgumentException("Tenant ID not found in token"));
        String userId = TenantContext.getCurrentUserId()
                .orElseThrow(() -> new IllegalArgumentException("User ID not found in token"));

        SessionSummaryResponse session = manageSessionUseCase.getSession(sessionId, tenantId, userId);
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    @PatchMapping("/sessions/{sessionId}")
    @Operation(summary = "Rename a session",
            description = "Update the title of an existing Q&A session.")
    @PreAuthorize("hasAnyRole('WORKER', 'HR', 'LAWYER', 'ADMIN')")
    public ResponseEntity<Void> renameSession(
            @PathVariable UUID sessionId,
            @RequestParam String title) {

        UUID tenantId = TenantContext.getCurrentTenantId()
                .orElseThrow(() -> new IllegalArgumentException("Tenant ID not found in token"));
        String userId = TenantContext.getCurrentUserId()
                .orElseThrow(() -> new IllegalArgumentException("User ID not found in token"));

        manageSessionUseCase.renameSession(sessionId, title, tenantId, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/sessions/{sessionId}")
    @Operation(summary = "Delete a session",
            description = "Soft-delete a Q&A session.")
    @PreAuthorize("hasAnyRole('WORKER', 'HR', 'LAWYER', 'ADMIN')")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID sessionId) {

        UUID tenantId = TenantContext.getCurrentTenantId()
                .orElseThrow(() -> new IllegalArgumentException("Tenant ID not found in token"));
        String userId = TenantContext.getCurrentUserId()
                .orElseThrow(() -> new IllegalArgumentException("User ID not found in token"));

        manageSessionUseCase.deleteSession(sessionId, tenantId, userId);
        return ResponseEntity.noContent().build();
    }
}
