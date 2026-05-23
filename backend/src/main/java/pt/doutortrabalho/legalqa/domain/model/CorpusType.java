package pt.doutortrabalho.legalqa.domain.model;

/**
 * Types of legal corpus sources used in the RAG pipeline.
 * Aligns with the metadata.corpus_type field in the vector store.
 */
public enum CorpusType {
    CODIGO_TRABALHO,
    PORTARIA,
    DECRETO_LEI,
    JURISPRUDENCIA,
    REGULAMENTO,
    DIRETIVA_UE
}
