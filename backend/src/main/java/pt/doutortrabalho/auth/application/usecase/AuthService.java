package pt.doutortrabalho.auth.application.usecase;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pt.doutortrabalho.auth.application.dto.ChangePasswordRequest;
import pt.doutortrabalho.auth.application.dto.ForgotPasswordRequest;
import pt.doutortrabalho.auth.application.dto.LoginRequest;
import pt.doutortrabalho.auth.application.dto.LoginResponse;
import pt.doutortrabalho.auth.application.dto.RefreshRequest;
import pt.doutortrabalho.auth.application.dto.RegisterRequest;
import pt.doutortrabalho.auth.application.dto.RegisterResponse;
import pt.doutortrabalho.auth.domain.port.in.AuthUseCase;
import pt.doutortrabalho.auth.domain.port.out.IdentityProviderClient;
import pt.doutortrabalho.shared.exception.DoutorTrabalhoException;

/**
 * Application service implementing the authentication use cases.
 * Delegates all identity operations to the outbound IdentityProviderClient port.
 */
@Service
public class AuthService implements AuthUseCase {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final IdentityProviderClient identityProviderClient;

    public AuthService(IdentityProviderClient identityProviderClient) {
        this.identityProviderClient = identityProviderClient;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email={}", request.email());
        return identityProviderClient.authenticate(request.email(), request.password());
    }

    @Override
    public void logout(String refreshToken, String userId) {
        log.info("Logout for userId={}", userId);
        identityProviderClient.logout(refreshToken);
    }

    @Override
    public RegisterResponse register(RegisterRequest request) {
        log.info("Registration attempt for email={}", request.email());

        String userId = identityProviderClient.createUser(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.password()
        );

        log.info("User registered successfully: userId={}, email={}", userId, request.email());

        return new RegisterResponse(
                userId,
                request.email(),
                "Utilizador registado com sucesso."
        );
    }

    @Override
    public LoginResponse refresh(RefreshRequest request) {
        log.debug("Token refresh requested");
        return identityProviderClient.refreshToken(request.refreshToken());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("Password reset requested for email={}", request.email());
        // Silently handle non-existent emails to prevent user enumeration
        identityProviderClient.sendPasswordResetEmail(request.email());
    }

    @Override
    public void changePassword(ChangePasswordRequest request, String userId) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new DoutorTrabalhoException(
                    "PASSWORD_MISMATCH",
                    "A nova password e a confirmacao nao coincidem."
            );
        }

        if (request.currentPassword().equals(request.newPassword())) {
            throw new DoutorTrabalhoException(
                    "SAME_PASSWORD",
                    "A nova password deve ser diferente da password atual."
            );
        }

        log.info("Password change requested for userId={}", userId);
        identityProviderClient.changePassword(userId, request.currentPassword(), request.newPassword());
    }
}
