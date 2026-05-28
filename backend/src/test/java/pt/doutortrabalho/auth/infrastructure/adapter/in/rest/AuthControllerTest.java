package pt.doutortrabalho.auth.infrastructure.adapter.in.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pt.doutortrabalho.auth.application.dto.ChangePasswordRequest;
import pt.doutortrabalho.auth.application.dto.ForgotPasswordRequest;
import pt.doutortrabalho.auth.application.dto.LoginRequest;
import pt.doutortrabalho.auth.application.dto.LoginResponse;
import pt.doutortrabalho.auth.application.dto.RefreshRequest;
import pt.doutortrabalho.auth.application.dto.RegisterRequest;
import pt.doutortrabalho.auth.application.dto.RegisterResponse;
import pt.doutortrabalho.auth.domain.exception.AuthenticationException;
import pt.doutortrabalho.auth.domain.exception.UserAlreadyExistsException;
import pt.doutortrabalho.auth.domain.port.in.AuthUseCase;
import pt.doutortrabalho.shared.exception.GlobalExceptionHandler;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {AuthController.class, GlobalExceptionHandler.class})
@DisplayName("AuthController")
class AuthControllerTest {

    private static final String AUTH_BASE = "/api/v1/doutor-trabalho/auth";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthUseCase authUseCase;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @TestConfiguration
    @EnableWebSecurity
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(csrf -> csrf.disable())
                    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers(
                                    AUTH_BASE + "/login",
                                    AUTH_BASE + "/register",
                                    AUTH_BASE + "/refresh",
                                    AUTH_BASE + "/forgot-password"
                            ).permitAll()
                            .anyRequest().authenticated()
                    )
                    .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));
            return http.build();
        }
    }

    @Nested
    @DisplayName("POST /auth/login")
    class LoginEndpoint {

        @Test
        @DisplayName("should return 200 with tokens on successful login")
        void shouldReturnTokensOnSuccess() throws Exception {
            var request = new LoginRequest("joao@empresa.pt", "Segura123!");
            var response = new LoginResponse("access-token", "refresh-token", "Bearer", 300);
            when(authUseCase.login(any(LoginRequest.class))).thenReturn(response);

            mockMvc.perform(post(AUTH_BASE + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                    .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
                    .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.data.expiresIn").value(300));
        }

        @Test
        @DisplayName("should return 401 on invalid credentials")
        void shouldReturn401OnInvalidCredentials() throws Exception {
            var request = new LoginRequest("joao@empresa.pt", "wrong");
            when(authUseCase.login(any(LoginRequest.class)))
                    .thenThrow(new AuthenticationException("Credenciais invalidas."));

            mockMvc.perform(post(AUTH_BASE + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errors[0].code").value("AUTHENTICATION_FAILED"));
        }

        @Test
        @DisplayName("should return 422 when email is blank")
        void shouldReturn422WhenEmailBlank() throws Exception {
            var request = new LoginRequest("", "Segura123!");

            mockMvc.perform(post(AUTH_BASE + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.errors").isNotEmpty());
        }

        @Test
        @DisplayName("should return 422 when email is invalid format")
        void shouldReturn422WhenEmailInvalid() throws Exception {
            var request = new LoginRequest("not-an-email", "Segura123!");

            mockMvc.perform(post(AUTH_BASE + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.errors").isNotEmpty());
        }

        @Test
        @DisplayName("should not require authentication")
        void shouldBePublic() throws Exception {
            var request = new LoginRequest("joao@empresa.pt", "Segura123!");
            var response = new LoginResponse("token", "refresh", "Bearer", 300);
            when(authUseCase.login(any())).thenReturn(response);

            mockMvc.perform(post(AUTH_BASE + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /auth/register")
    class RegisterEndpoint {

        @Test
        @DisplayName("should return 201 on successful registration")
        void shouldReturn201OnSuccess() throws Exception {
            var request = new RegisterRequest("Joao", "Silva", "joao@empresa.pt", "Segura123!", "Empresa SA");
            var response = new RegisterResponse("user-123", "joao@empresa.pt", "Registado com sucesso.");
            when(authUseCase.register(any(RegisterRequest.class))).thenReturn(response);

            mockMvc.perform(post(AUTH_BASE + "/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.userId").value("user-123"))
                    .andExpect(jsonPath("$.data.email").value("joao@empresa.pt"));
        }

        @Test
        @DisplayName("should return 409 when email already exists")
        void shouldReturn409WhenEmailTaken() throws Exception {
            var request = new RegisterRequest("Joao", "Silva", "joao@empresa.pt", "Segura123!", "Empresa SA");
            when(authUseCase.register(any(RegisterRequest.class)))
                    .thenThrow(new UserAlreadyExistsException("joao@empresa.pt"));

            mockMvc.perform(post(AUTH_BASE + "/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.errors[0].code").value("USER_ALREADY_EXISTS"));
        }

        @Test
        @DisplayName("should return 422 when password is too short")
        void shouldReturn422WhenPasswordTooShort() throws Exception {
            var request = new RegisterRequest("Joao", "Silva", "joao@empresa.pt", "123", "Empresa SA");

            mockMvc.perform(post(AUTH_BASE + "/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.errors").isNotEmpty());
        }

        @Test
        @DisplayName("should not require authentication")
        void shouldBePublic() throws Exception {
            var request = new RegisterRequest("Joao", "Silva", "joao@empresa.pt", "Segura123!", null);
            var response = new RegisterResponse("user-123", "joao@empresa.pt", "OK");
            when(authUseCase.register(any())).thenReturn(response);

            mockMvc.perform(post(AUTH_BASE + "/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("POST /auth/refresh")
    class RefreshEndpoint {

        @Test
        @DisplayName("should return 200 with new tokens on valid refresh")
        void shouldReturnNewTokens() throws Exception {
            var request = new RefreshRequest("valid-refresh-token");
            var response = new LoginResponse("new-access", "new-refresh", "Bearer", 300);
            when(authUseCase.refresh(any(RefreshRequest.class))).thenReturn(response);

            mockMvc.perform(post(AUTH_BASE + "/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.accessToken").value("new-access"))
                    .andExpect(jsonPath("$.data.refreshToken").value("new-refresh"));
        }

        @Test
        @DisplayName("should return 401 on expired refresh token")
        void shouldReturn401OnExpiredToken() throws Exception {
            var request = new RefreshRequest("expired-token");
            when(authUseCase.refresh(any(RefreshRequest.class)))
                    .thenThrow(new AuthenticationException("Refresh token invalido ou expirado."));

            mockMvc.perform(post(AUTH_BASE + "/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.errors[0].code").value("AUTHENTICATION_FAILED"));
        }
    }

    @Nested
    @DisplayName("POST /auth/forgot-password")
    class ForgotPasswordEndpoint {

        @Test
        @DisplayName("should return 200 regardless of email existence")
        void shouldReturn200Always() throws Exception {
            var request = new ForgotPasswordRequest("qualquer@email.pt");

            mockMvc.perform(post(AUTH_BASE + "/forgot-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            verify(authUseCase).forgotPassword(any(ForgotPasswordRequest.class));
        }

        @Test
        @DisplayName("should return 422 when email format is invalid")
        void shouldReturn422WhenEmailInvalid() throws Exception {
            var request = new ForgotPasswordRequest("not-an-email");

            mockMvc.perform(post(AUTH_BASE + "/forgot-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity());
        }
    }

    @Nested
    @DisplayName("POST /auth/logout")
    class LogoutEndpoint {

        @Test
        @DisplayName("should return 200 on successful logout")
        void shouldReturn200OnSuccess() throws Exception {
            var request = new RefreshRequest("refresh-token-to-revoke");

            mockMvc.perform(post(AUTH_BASE + "/logout")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(jwt().jwt(builder -> builder
                                    .subject("user-123")
                                    .claim("preferred_username", "joao@empresa.pt"))))
                    .andExpect(status().isOk());

            verify(authUseCase).logout("refresh-token-to-revoke", "user-123");
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            var request = new RefreshRequest("some-token");

            mockMvc.perform(post(AUTH_BASE + "/logout")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /auth/change-password")
    class ChangePasswordEndpoint {

        @Test
        @DisplayName("should return 200 on successful password change")
        void shouldReturn200OnSuccess() throws Exception {
            var request = new ChangePasswordRequest("OldPassword1!", "NewPassword1!", "NewPassword1!");

            mockMvc.perform(post(AUTH_BASE + "/change-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(jwt().jwt(builder -> builder
                                    .subject("user-123")
                                    .claim("preferred_username", "joao@empresa.pt"))))
                    .andExpect(status().isOk());

            verify(authUseCase).changePassword(any(ChangePasswordRequest.class), eq("user-123"));
        }

        @Test
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            var request = new ChangePasswordRequest("old", "new12345", "new12345");

            mockMvc.perform(post(AUTH_BASE + "/change-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 422 when new password is too short")
        void shouldReturn422WhenNewPasswordTooShort() throws Exception {
            var request = new ChangePasswordRequest("OldPassword1!", "abc", "abc");

            mockMvc.perform(post(AUTH_BASE + "/change-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(jwt().jwt(builder -> builder.subject("user-123"))))
                    .andExpect(status().isUnprocessableEntity());
        }
    }
}
