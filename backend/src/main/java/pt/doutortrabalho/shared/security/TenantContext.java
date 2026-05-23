package pt.doutortrabalho.shared.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Optional;
import java.util.UUID;

/**
 * Utility to extract tenant and user information from the JWT security context.
 * Multi-tenancy is enforced via a tenant_id claim in the JWT (ADR-004).
 */
public final class TenantContext {

    private TenantContext() {
        // Utility class
    }

    /**
     * Extract the tenant ID from the current JWT token.
     */
    public static Optional<UUID> getCurrentTenantId() {
        return getJwt()
                .map(jwt -> jwt.getClaimAsString("tenant_id"))
                .map(UUID::fromString);
    }

    /**
     * Extract the user ID from the current JWT token.
     */
    public static Optional<String> getCurrentUserId() {
        return getJwt()
                .map(jwt -> jwt.getClaimAsString("sub"));
    }

    /**
     * Extract the preferred username from the current JWT token.
     */
    public static Optional<String> getCurrentUsername() {
        return getJwt()
                .map(jwt -> jwt.getClaimAsString("preferred_username"));
    }

    private static Optional<Jwt> getJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return Optional.of(jwt);
        }
        return Optional.empty();
    }
}
