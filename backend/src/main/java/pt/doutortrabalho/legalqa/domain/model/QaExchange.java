package pt.doutortrabalho.legalqa.domain.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * A single question-answer exchange within a QA session.
 * Contains the user's question, the AI-generated answer,
 * and the list of legal citations referenced in the answer.
 */
@Entity
@Table(name = "qa_exchanges")
public class QaExchange {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private QaSession session;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "answer", nullable = false, columnDefinition = "TEXT")
    private String answer;

    @OneToMany(mappedBy = "exchange", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Citation> citations = new ArrayList<>();

    @Column(name = "tokens_input")
    private Integer tokensInput;

    @Column(name = "tokens_output")
    private Integer tokensOutput;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected QaExchange() {
        // JPA
    }

    public QaExchange(QaSession session, String question, String answer, List<Citation> citations) {
        this.session = session;
        this.question = question;
        this.answer = answer;
        this.createdAt = Instant.now();
        if (citations != null) {
            citations.forEach(c -> c.setExchange(this));
            this.citations.addAll(citations);
        }
    }

    public void recordMetrics(int tokensInput, int tokensOutput, long latencyMs) {
        this.tokensInput = tokensInput;
        this.tokensOutput = tokensOutput;
        this.latencyMs = latencyMs;
    }

    // Getters
    public UUID getId() { return id; }
    public QaSession getSession() { return session; }
    public String getQuestion() { return question; }
    public String getAnswer() { return answer; }
    public List<Citation> getCitations() { return List.copyOf(citations); }
    public Integer getTokensInput() { return tokensInput; }
    public Integer getTokensOutput() { return tokensOutput; }
    public Long getLatencyMs() { return latencyMs; }
    public Instant getCreatedAt() { return createdAt; }
}
