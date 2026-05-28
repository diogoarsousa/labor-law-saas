package pt.doutortrabalho.auth.application.usecase;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.doutortrabalho.auth.application.dto.ChangePasswordRequest;
import pt.doutortrabalho.auth.application.dto.ForgotPasswordRequest;
import pt.doutortrabalho.auth.application.dto.LoginRequest;
import pt.doutortrabalho.auth.application.dto.LoginResponse;
import pt.doutortrabalho.auth.application.dto.RefreshRequest;
import pt.doutortrabalho.auth.application.dto.RegisterRequest;
import pt.doutortrabalho.auth.application.dto.RegisterResponse;
import pt.doutortrabalho.auth.domain.exception.AuthenticationException;
import pt.doutortrabalho.auth.domain.exception.UserAlreadyExistsException;
import pt.doutortrabalho.auth.domain.port.out.IdentityProviderClient;
import pt.doutortrabalho.shared.exception.DoutorTrabalhoException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private IdentityProviderClient identityProviderClient;

    @InjectMocks
    private AuthService authService;

    private static final String USER_ID = "user-abc-123";
    private static final String EMAIL = "joao@empresa.pt";
    private static final String PASSWORD = "Segura123!";

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("should return tokens when credentials are valid")
        void shouldReturnTokensOnValidCredentials() {
            // Given
            var request = new LoginRequest(EMAIL, PASSWORD);
            var expectedResponse = new LoginResponse(
                    "access-token-xyz", "refresh-token-xyz", "Bearer", 300
            );
            when(identityProviderClient.authenticate(EMAIL, PASSWORD))
                    .thenReturn(expectedResponse);

            // When
            LoginResponse result = authService.login(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.accessToken()).isEqualTo("access-token-xyz");
            assertThat(result.refreshToken()).isEqualTo("refresh-token-xyz");
            assertThat(result.tokenType()).isEqualTo("Bearer");
            assertThat(result.expiresIn()).isEqualTo(300);
            verify(identityProviderClient).authenticate(EMAIL, PASSWORD);
        }

        @Test
        @DisplayName("should propagate AuthenticationException when credentials are invalid")
        void shouldPropagateAuthenticationException() {
            // Given
            var request = new LoginRequest(EMAIL, "wrong-password");
            when(identityProviderClient.authenticate(EMAIL, "wrong-password"))
                    .thenThrow(new AuthenticationException("Credenciais invalidas."));

            // When/Then
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(AuthenticationException.class)
                    .hasMessageContaining("Credenciais invalidas");
        }
    }

    @Nested
    @DisplayName("logout")
    class Logout {

        @Test
        @DisplayName("should delegate to identity provider client")
        void shouldDelegateLogout() {
            // Given
            String refreshToken = "refresh-token-to-invalidate";

            // When
            authService.logout(refreshToken, USER_ID);

            // Then
            verify(identityProviderClient).logout(refreshToken);
        }
    }

    @Nested
    @DisplayName("register")
    class Register {

        @Test
        @DisplayName("should create user and return response with success message")
        void shouldCreateUserSuccessfully() {
            // Given
            var request = new RegisterRequest(
                    "Joao", "Silva", EMAIL, PASSWORD, "Empresa SA"
            );
            when(identityProviderClient.createUser("Joao", "Silva", EMAIL, PASSWORD))
                    .thenReturn(USER_ID);

            // When
            RegisterResponse result = authService.register(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.userId()).isEqualTo(USER_ID);
            assertThat(result.email()).isEqualTo(EMAIL);
            assertThat(result.message()).contains("registado com sucesso");
            verify(identityProviderClient).createUser("Joao", "Silva", EMAIL, PASSWORD);
        }

        @Test
        @DisplayName("should propagate UserAlreadyExistsException when email is taken")
        void shouldPropagateUserAlreadyExistsException() {
            // Given
            var request = new RegisterRequest(
                    "Joao", "Silva", EMAIL, PASSWORD, "Empresa SA"
            );
            when(identityProviderClient.createUser("Joao", "Silva", EMAIL, PASSWORD))
                    .thenThrow(new UserAlreadyExistsException(EMAIL));

            // When/Then
            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(UserAlreadyExistsException.class)
                    .hasMessageContaining(EMAIL);
        }
    }

    @Nested
    @DisplayName("refresh")
    class Refresh {

        @Test
        @DisplayName("should exchange refresh token for new tokens")
        void shouldRefreshTokens() {
            // Given
            var request = new RefreshRequest("old-refresh-token");
            var expectedResponse = new LoginResponse(
                    "new-access-token", "new-refresh-token", "Bearer", 300
            );
            when(identityProviderClient.refreshToken("old-refresh-token"))
                    .thenReturn(expectedResponse);

            // When
            LoginResponse result = authService.refresh(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.accessToken()).isEqualTo("new-access-token");
            assertThat(result.refreshToken()).isEqualTo("new-refresh-token");
            verify(identityProviderClient).refreshToken("old-refresh-token");
        }

        @Test
        @DisplayName("should propagate AuthenticationException for invalid refresh token")
        void shouldPropagateExceptionForInvalidRefreshToken() {
            // Given
            var request = new RefreshRequest("expired-token");
            when(identityProviderClient.refreshToken("expired-token"))
                    .thenThrow(new AuthenticationException("Refresh token invalido ou expirado."));

            // When/Then
            assertThatThrownBy(() -> authService.refresh(request))
                    .isInstanceOf(AuthenticationException.class)
                    .hasMessageContaining("invalido ou expirado");
        }
    }

    @Nested
    @DisplayName("forgotPassword")
    class ForgotPassword {

        @Test
        @DisplayName("should delegate password reset to identity provider")
        void shouldDelegateForgotPassword() {
            // Given
            var request = new ForgotPasswordRequest(EMAIL);

            // When
            authService.forgotPassword(request);

            // Then
            verify(identityProviderClient).sendPasswordResetEmail(EMAIL);
        }

        @Test
        @DisplayName("should not throw even if email does not exist (user enumeration prevention)")
        void shouldNotThrowForNonExistentEmail() {
            // Given
            var request = new ForgotPasswordRequest("naoexiste@empresa.pt");
            doNothing().when(identityProviderClient).sendPasswordResetEmail(anyString());

            // When/Then (no exception)
            authService.forgotPassword(request);
            verify(identityProviderClient).sendPasswordResetEmail("naoexiste@empresa.pt");
        }
    }

    @Nested
    @DisplayName("changePassword")
    class ChangePassword {

        @Test
        @DisplayName("should change password when request is valid")
        void shouldChangePasswordSuccessfully() {
            // Given
            var request = new ChangePasswordRequest(PASSWORD, "NovaPassword1!", "NovaPassword1!");

            // When
            authService.changePassword(request, USER_ID);

            // Then
            verify(identityProviderClient).changePassword(USER_ID, PASSWORD, "NovaPassword1!");
        }

        @Test
        @DisplayName("should throw when new password and confirmation do not match")
        void shouldThrowWhenPasswordsDoNotMatch() {
            // Given
            var request = new ChangePasswordRequest(PASSWORD, "NovaPassword1!", "Diferente123!");

            // When/Then
            assertThatThrownBy(() -> authService.changePassword(request, USER_ID))
                    .isInstanceOf(DoutorTrabalhoException.class)
                    .hasMessageContaining("nao coincidem");

            verify(identityProviderClient, never()).changePassword(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("should throw when new password is the same as current password")
        void shouldThrowWhenSamePassword() {
            // Given
            var request = new ChangePasswordRequest(PASSWORD, PASSWORD, PASSWORD);

            // When/Then
            assertThatThrownBy(() -> authService.changePassword(request, USER_ID))
                    .isInstanceOf(DoutorTrabalhoException.class)
                    .hasMessageContaining("diferente da password atual");

            verify(identityProviderClient, never()).changePassword(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("should propagate AuthenticationException when current password is wrong")
        void shouldPropagateWhenCurrentPasswordIsWrong() {
            // Given
            var request = new ChangePasswordRequest("wrong-password", "NovaPassword1!", "NovaPassword1!");
            doThrow(new AuthenticationException("A password atual esta incorreta."))
                    .when(identityProviderClient).changePassword(USER_ID, "wrong-password", "NovaPassword1!");

            // When/Then
            assertThatThrownBy(() -> authService.changePassword(request, USER_ID))
                    .isInstanceOf(AuthenticationException.class)
                    .hasMessageContaining("incorreta");
        }
    }
}
