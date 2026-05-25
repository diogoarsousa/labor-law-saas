package pt.doutortrabalho.auth.infrastructure.adapter.in.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.doutortrabalho.auth.application.dto.ChangePasswordRequest;
import pt.doutortrabalho.auth.application.dto.ForgotPasswordRequest;
import pt.doutortrabalho.auth.application.dto.LoginRequest;
import pt.doutortrabalho.auth.application.dto.LoginResponse;
import pt.doutortrabalho.auth.application.dto.RefreshRequest;
import pt.doutortrabalho.auth.application.dto.RegisterRequest;
import pt.doutortrabalho.auth.application.dto.RegisterResponse;
import pt.doutortrabalho.auth.domain.port.in.AuthUseCase;
import pt.doutortrabalho.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/doutor-trabalho/auth")
@Tag(name = "Authentication", description = "User authentication with local JWT")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthUseCase authUseCase;

    public AuthController(AuthUseCase authUseCase) {
        this.authUseCase = authUseCase;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Returns a short-lived access token (15 min) and a refresh token (7 days).")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        log.info("POST /auth/login - email={}", request.email());
        LoginResponse response = authUseCase.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Stateless logout — client must discard stored tokens.")
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        log.info("POST /auth/logout - userId={}", userId);
        authUseCase.logout(request.refreshToken(), userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Creates a new user account.")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        log.info("POST /auth/register - email={}", request.email());
        RegisterResponse response = authUseCase.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Exchanges a valid refresh token for a new access token.")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @Valid @RequestBody RefreshRequest request) {
        log.debug("POST /auth/refresh");
        LoginResponse response = authUseCase.refresh(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Logs the request. Returns 200 regardless of email existence to prevent user enumeration.")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        log.info("POST /auth/forgot-password - email={}", request.email());
        authUseCase.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Changes the password of the currently authenticated user.")
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        log.info("POST /auth/change-password - userId={}", userId);
        authUseCase.changePassword(request, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
