package pt.doutortrabalho.legalqa.domain.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Aggregate root for a Legal Q&A conversation session.
 * Each session belongs to a user within a tenant and contains
 * an ordered list of question-answer exchanges.
 */
@Entity
@Table(name = "qa_sessions")
public class QaSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "title", length = 255)
    private String title;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<QaExchange> exchanges = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    protected QaSession() {
        // JPA
    }

    public QaSession(UUID tenantId, String userId, String title) {
        this.tenantId = tenantId;
        this.userId = userId;
        this.title = title;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public QaExchange addExchange(String question, String answer, List<Citation> citations) {
        QaExchange exchange = new QaExchange(this, question, answer, citations);
        this.exchanges.add(exchange);
        this.updatedAt = Instant.now();
        return exchange;
    }

    public void rename(String newTitle) {
        this.title = newTitle;
        this.updatedAt = Instant.now();
    }

    public void softDelete() {
        this.deletedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public boolean isDeleted() {
        return this.deletedAt != null;
    }

    // Getters
    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public String getUserId() { return userId; }
    public String getTitle() { return title; }
    public List<QaExchange> getExchanges() { return List.copyOf(exchanges); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getDeletedAt() { return deletedAt; }
}
