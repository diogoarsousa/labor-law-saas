package pt.doutortrabalho.auth.domain.port.out;

import pt.doutortrabalho.auth.domain.model.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(UUID id);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    void updatePassword(UUID id, String newPasswordHash);
}
