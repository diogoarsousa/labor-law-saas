package pt.doutortrabalho.auth.infrastructure.adapter.out.local;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pt.doutortrabalho.auth.application.dto.LoginResponse;
import pt.doutortrabalho.auth.domain.exception.AuthenticationException;
import pt.doutortrabalho.auth.domain.exception.UserAlreadyExistsException;
import pt.doutortrabalho.auth.domain.model.User;
import pt.doutortrabalho.auth.domain.model.UserRole;
import pt.doutortrabalho.auth.domain.port.out.IdentityProviderClient;
import pt.doutortrabalho.auth.domain.port.out.UserRepository;
import pt.doutortrabalho.auth.infrastructure.security.JwtService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class LocalAuthClient implements IdentityProviderClient {

    private static final Logger log = LoggerFactory.getLogger(LocalAuthClient.class);

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public LocalAuthClient(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public LoginResponse authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("Credenciais invalidas. Verifique o email e a password."));

        if (!passwordEncoder.matches(password, user.passwordHash())) {
            throw new AuthenticationException("Credenciais invalidas. Verifique o email e a password.");
        }

        return buildTokenResponse(user);
    }

    @Override
    public void logout(String refreshToken) {
        // Stateless logout — client discards tokens.
        // Token blacklist via Redis can be added when needed.
        log.debug("Logout processed (stateless)");
    }

    @Override
    public String createUser(String firstName, String lastName, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(email);
        }

        User user = new User(
                UUID.randomUUID(),
                email,
                passwordEncoder.encode(password),
                firstName,
                lastName,
                UserRole.USER,
                false,
                LocalDateTime.now()
        );

        User saved = userRepository.save(user);
        log.info("User created: id={}, email={}", saved.id(), saved.email());
        return saved.id().toString();
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        try {
            Claims claims = jwtService.extractAllClaims(refreshToken);

            if (!"refresh".equals(claims.get("type"))) {
                throw new AuthenticationException("Token invalido.");
            }

            User user = userRepository.findById(UUID.fromString(claims.getSubject()))
                    .orElseThrow(() -> new AuthenticationException("Utilizador nao encontrado."));

            return buildTokenResponse(user);
        } catch (JwtException ex) {
            throw new AuthenticationException("Refresh token invalido ou expirado.");
        }
    }

    @Override
    public void sendPasswordResetEmail(String email) {
        // MVP: envio de email nao implementado — registar apenas
        log.info("Password reset requested for email={} (email sending not yet implemented)", email);
    }

    @Override
    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new AuthenticationException("Utilizador nao encontrado."));

        if (!passwordEncoder.matches(currentPassword, user.passwordHash())) {
            throw new AuthenticationException("A password atual esta incorreta.");
        }

        userRepository.updatePassword(UUID.fromString(userId), passwordEncoder.encode(newPassword));
        log.info("Password changed for userId={}", userId);
    }

    private LoginResponse buildTokenResponse(User user) {
        List<String> roles = List.of("ROLE_" + user.role().name());
        String accessToken = jwtService.generateAccessToken(
                user.id().toString(), user.email(), user.firstName(), user.lastName(), roles);
        String refresh = jwtService.generateRefreshToken(user.id().toString());
        long expiresIn = jwtService.getAccessTokenExpirationMs() / 1000;
        return new LoginResponse(accessToken, refresh, "Bearer", expiresIn);
    }
}
