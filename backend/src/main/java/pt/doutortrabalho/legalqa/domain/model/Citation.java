package pt.doutortrabalho.legalqa.domain.model;

import jakarta.persistence.*;

import java.util.UUID;

/**
 * A citation to a specific article of Portuguese legislation
 * referenced in an AI-generated answer.
 */
@Entity
@Table(name = "citations")
public class Citation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exchange_id", nullable = false)
    private QaExchange exchange;

    @Column(name = "law_number", nullable = false, length = 100)
    private String lawNumber;

    @Column(name = "article", nullable = false, length = 50)
    private String article;

    @Column(name = "article_text", columnDefinition = "TEXT")
    private String articleText;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "corpus_type", nullable = false, length = 30)
    private CorpusType corpusType;

    protected Citation() {
        // JPA
    }

    public Citation(String lawNumber, String article, String articleText,
                    String sourceUrl, CorpusType corpusType) {
        this.lawNumber = lawNumber;
        this.article = article;
        this.articleText = articleText;
        this.sourceUrl = sourceUrl;
        this.corpusType = corpusType;
    }

    void setExchange(QaExchange exchange) {
        this.exchange = exchange;
    }

    // Getters
    public UUID getId() { return id; }
    public QaExchange getExchange() { return exchange; }
    public String getLawNumber() { return lawNumber; }
    public String getArticle() { return article; }
    public String getArticleText() { return articleText; }
    public String getSourceUrl() { return sourceUrl; }
    public CorpusType getCorpusType() { return corpusType; }
}
