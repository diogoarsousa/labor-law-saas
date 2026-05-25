package pt.doutortrabalho.auth.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

public record User(
        UUID id,
        String email,
        String passwordHash,
        String firstName,
        String lastName,
        UserRole role,
        boolean emailVerified,
        LocalDateTime createdAt
) {
}
