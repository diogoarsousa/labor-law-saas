package pt.doutortrabalho.auth.infrastructure.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtService")
class JwtServiceTest {

    private JwtService jwtService;

    private static final String SECRET = "test-jwt-secret-key-minimum-256-bits-long-for-testing!!";
    private static final String USER_ID = "550e8400-e29b-41d4-a716-446655440000";
    private static final String EMAIL = "joao@empresa.pt";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 900_000L, 604_800_000L);
    }

    @Nested
    @DisplayName("generateAccessToken")
    class GenerateAccessToken {

        @Test
        @DisplayName("should contain correct claims")
        void shouldContainCorrectClaims() {
            String token = jwtService.generateAccessToken(USER_ID, EMAIL, "Joao", "Silva", List.of("ROLE_USER"));

            Claims claims = jwtService.extractAllClaims(token);

            assertThat(claims.getSubject()).isEqualTo(USER_ID);
            assertThat(claims.get("email")).isEqualTo(EMAIL);
            assertThat(claims.get("type")).isEqualTo("access");
            assertThat(claims.get("firstName")).isEqualTo("Joao");
            assertThat(claims.get("lastName")).isEqualTo("Silva");
        }
    }

    @Nested
    @DisplayName("generateRefreshToken")
    class GenerateRefreshToken {

        @Test
        @DisplayName("should have type=refresh claim")
        void shouldHaveRefreshTypeClaim() {
            String token = jwtService.generateRefreshToken(USER_ID);

            Claims claims = jwtService.extractAllClaims(token);

            assertThat(claims.getSubject()).isEqualTo(USER_ID);
            assertThat(claims.get("type")).isEqualTo("refresh");
        }
    }

    @Nested
    @DisplayName("extractAllClaims")
    class ExtractAllClaims {

        @Test
        @DisplayName("should throw on tampered token")
        void shouldThrowOnTamperedToken() {
            String token = jwtService.generateAccessToken(USER_ID, EMAIL, "Joao", "Silva", List.of("ROLE_USER"));
            String tampered = token + "tampered";

            assertThatThrownBy(() -> jwtService.extractAllClaims(tampered))
                    .isInstanceOf(Exception.class);
        }

        @Test
        @DisplayName("should throw on token signed with different secret")
        void shouldThrowOnWrongSecret() {
            JwtService otherService = new JwtService("completely-different-secret-key-256-bits-min!!", 900_000L, 604_800_000L);
            String token = otherService.generateAccessToken(USER_ID, EMAIL, "Joao", "Silva", List.of());

            assertThatThrownBy(() -> jwtService.extractAllClaims(token))
                    .isInstanceOf(Exception.class);
        }
    }
}
