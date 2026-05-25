package pt.doutortrabalho.auth.infrastructure.adapter.out.persistence;

import org.springframework.stereotype.Component;
import pt.doutortrabalho.auth.domain.model.User;
import pt.doutortrabalho.auth.domain.port.out.UserRepository;
import pt.doutortrabalho.shared.exception.ResourceNotFoundException;

import java.util.Optional;
import java.util.UUID;

@Component
public class UserPersistenceAdapter implements UserRepository {

    private final SpringDataUserRepository jpaRepository;

    public UserPersistenceAdapter(SpringDataUserRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public User save(User user) {
        return jpaRepository.save(UserEntity.fromDomain(user)).toDomain();
    }

    @Override
    public Optional<User> findById(UUID id) {
        return jpaRepository.findById(id).map(UserEntity::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email).map(UserEntity::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    @Override
    public void updatePassword(UUID id, String newPasswordHash) {
        UserEntity entity = jpaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizador", id.toString()));
        entity.setPasswordHash(newPasswordHash);
        jpaRepository.save(entity);
    }
}
