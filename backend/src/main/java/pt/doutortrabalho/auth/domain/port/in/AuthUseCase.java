package pt.doutortrabalho.auth.domain.port.in;

import pt.doutortrabalho.auth.application.dto.ChangePasswordRequest;
import pt.doutortrabalho.auth.application.dto.ForgotPasswordRequest;
import pt.doutortrabalho.auth.application.dto.LoginRequest;
import pt.doutortrabalho.auth.application.dto.LoginResponse;
import pt.doutortrabalho.auth.application.dto.RefreshRequest;
import pt.doutortrabalho.auth.application.dto.RegisterRequest;
import pt.doutortrabalho.auth.application.dto.RegisterResponse;

/**
 * Inbound port defining the authentication use cases.
 * All identity management is delegated to the external Identity Provider (Keycloak).
 */
public interface AuthUseCase {

    /**
     * Authenticates a user with email/password credentials and returns JWT tokens.
     */
    LoginResponse login(LoginRequest request);

    /**
     * Invalidates the refresh token, effectively logging the user out.
     */
    void logout(String refreshToken, String userId);

    /**
     * Registers a new user in the Identity Provider and triggers email verification.
     */
    RegisterResponse register(RegisterRequest request);

    /**
     * Exchanges a valid refresh token for a new access token.
     */
    LoginResponse refresh(RefreshRequest request);

    /**
     * Triggers a password reset email for the given user.
     */
    void forgotPassword(ForgotPasswordRequest request);

    /**
     * Changes the password of the currently authenticated user.
     */
    void changePassword(ChangePasswordRequest request, String userId);
}
