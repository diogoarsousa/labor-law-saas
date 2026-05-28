// ─── Shared envelope types ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  errors?: ApiError[];
}

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

// Matches backend LoginResponse record
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// Matches backend RegisterRequest record
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName?: string;
}

// Matches backend RegisterResponse record (201 Created)
export interface RegisterResponse {
  userId: string;
  email: string;
  message: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Local session user — populated by decoding the Keycloak JWT claims
export interface Utilizador {
  id: string;
  email: string;
  nome: string;
}

// ─── Legal Q&A ────────────────────────────────────────────────────────────────

// Matches backend LegalQuestionRequest record
export interface LegalQuestionRequest {
  sessionId?: string;
  question: string;
}

// Matches backend CitationDto record
export interface LegalCitationDto {
  lawNumber: string;
  article: string;
  articleText: string;
  sourceUrl?: string;
  corpusType: string;
}

export interface LegalAnswerMetadata {
  tokensInput?: number;
  tokensOutput?: number;
  latencyMs?: number;
  timestamp: string;
}

// Matches backend LegalAnswerResponse record
export interface LegalAnswerResponse {
  sessionId: string;
  exchangeId: string;
  question: string;
  answer: string;
  citations: LegalCitationDto[];
  metadata: LegalAnswerMetadata;
}

// Matches backend SessionSummaryResponse record
export interface SessionSummary {
  id: string;
  title: string;
  exchangeCount: number;
  createdAt: string;
  updatedAt: string;
  exchanges?: LegalAnswerResponse[];
}

// UI-level message — constructed from LegalAnswerResponse exchanges
export interface ChatMensagem {
  id: string;
  sessaoId: string;
  papel: "UTILIZADOR" | "ASSISTENTE";
  conteudo: string;
  citacoes?: LegalCitationDto[];
  criadoEm: string;
}

// Legacy citation type — still used by contracts/compliance (not yet implemented on BE)
export interface CitacaoLegal {
  artigo: string;
  diploma: string;
  texto: string;
  url?: string;
}

// ─── Cases ────────────────────────────────────────────────────────────────────

export type CasoEstado =
  | "ABERTO"
  | "EM_ANDAMENTO"
  | "AGUARDANDO_DOCUMENTOS"
  | "EM_REVISAO"
  | "RESOLVIDO"
  | "FECHADO";

export type CasoTipo =
  | "DESPEDIMENTO"
  | "ASSEDIO"
  | "SALARIO"
  | "HORAS_EXTRA"
  | "FERIAS"
  | "SUBSIDIO"
  | "CONTRATO"
  | "OUTRO";

export interface Caso {
  id: string;
  titulo: string;
  descricao: string;
  tipo: CasoTipo;
  estado: CasoEstado;
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";
  cliente?: string;
  trabalhador?: string;
  empresa?: string;
  dataAbertura: string;
  dataFecho?: string;
  responsavel?: string;
  notas?: string;
  documentos?: DocumentoAnexo[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface CasoCreateRequest {
  titulo: string;
  descricao: string;
  tipo: CasoTipo;
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";
  cliente?: string;
  trabalhador?: string;
  empresa?: string;
}

export interface CasoUpdateRequest extends Partial<CasoCreateRequest> {
  estado?: CasoEstado;
  dataFecho?: string;
  notas?: string;
}

export interface DocumentoAnexo {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  criadoEm: string;
}

// ─── Contracts ────────────────────────────────────────────────────────────────

export interface Contrato {
  id: string;
  nome: string;
  tipo: ContratoTipo;
  estado: "PENDENTE" | "ANALISADO" | "APROVADO" | "REJEITADO";
  analise?: ContratoAnalise;
  criadoEm: string;
  atualizadoEm: string;
}

export type ContratoTipo =
  | "CONTRATO_TRABALHO"
  | "CONTRATO_PRESTACAO_SERVICOS"
  | "ACORDO_CESSACAO"
  | "ADITAMENTO"
  | "OUTRO";

export interface ContratoAnalise {
  pontuacaoRisco: number;
  violacoes: ViolacaoLegal[];
  recomendacoes: string[];
  sumario: string;
  artigosRelevantes: CitacaoLegal[];
}

export interface ViolacaoLegal {
  artigo: string;
  descricao: string;
  gravidade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  sugestao: string;
}

export interface ContratoAnalyzeRequest {
  textoContrato: string;
  tipoAnalise: "CONFORMIDADE" | "RISCOS" | "COMPLETA";
}

// ─── Compliance ───────────────────────────────────────────────────────────────

export interface ComplianceCheckRequest {
  tipo: ComplianceTipo;
  dados: Record<string, unknown>;
}

export type ComplianceTipo =
  | "POLITICA_FERIAS"
  | "HORARIO_TRABALHO"
  | "SALARIO_MINIMO"
  | "DESPEDIMENTO"
  | "CONTRATACAO"
  | "SEGURANCA_HIGIENE";

export interface ComplianceResultado {
  id: string;
  tipo: ComplianceTipo;
  conforme: boolean;
  pontuacao: number;
  violacoes: ViolacaoLegal[];
  recomendacoes: string[];
  artigosAplicaveis: CitacaoLegal[];
  criadoEm: string;
}

// ─── Calculators ──────────────────────────────────────────────────────────────

export interface CalculoIndemnizacaoRequest {
  salarioBase: number;
  diuturnidades?: number;
  dataAdmissao: string;
  dataFim: string;
  motivoDespedimento: MotivoDespedimento;
  categoriaProfissional?: string;
}

export type MotivoDespedimento =
  | "COLETIVO"
  | "EXTINÇÃO_POSTO"
  | "INADAPTACAO"
  | "JUSTA_CAUSA"
  | "ACORDO";

export interface CalculoIndemnizacaoResponse {
  indemnizacaoBase: number;
  indemnizacaoTotal: number;
  anosServico: number;
  mesesServico: number;
  detalhe: string;
  baseCalculo: string;
  artigosAplicaveis: string[];
}

export interface CalculoSalarioRequest {
  salarioBruto: number;
  numeroDependentes: number;
  deficiencia?: boolean;
  outrosRendimentos?: number;
}

export interface CalculoSalarioResponse {
  salarioBruto: number;
  irsRetido: number;
  segurancaSocial: number;
  salarioLiquido: number;
  taxaIrs: number;
  escalaoIrs: string;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export type DocumentoTipo =
  | "CARTA_DESPEDIMENTO"
  | "CONTRATO_TRABALHO"
  | "ACORDO_CESSACAO"
  | "AVISO_PREVIO"
  | "RECIBO_VENCIMENTO"
  | "DECLARACAO_TRABALHO"
  | "REGULAMENTO_INTERNO";

export interface DocumentoGerado {
  id: string;
  tipo: DocumentoTipo;
  titulo: string;
  conteudo: string;
  estado: "RASCUNHO" | "REVISTO" | "APROVADO";
  criadoEm: string;
  atualizadoEm: string;
}

export interface DocumentoGenerateRequest {
  tipo: DocumentoTipo;
  parametros: Record<string, unknown>;
}

// ─── Jurisprudence ────────────────────────────────────────────────────────────

export interface Jurisprudencia {
  id: string;
  tribunal: string;
  processo: string;
  data: string;
  sumario: string;
  descritores: string[];
  relator?: string;
  texto?: string;
  url?: string;
}

export interface JurisprudenciaSearchRequest {
  query: string;
  tribunal?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  size?: number;
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export interface AlteracaoLegislativa {
  id: string;
  titulo: string;
  diploma: string;
  tipo: "LEI" | "DECRETO_LEI" | "PORTARIA" | "DESPACHO" | "ACORDO";
  resumo: string;
  impacto: "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
  artigosAfetados: string[];
  dataPublicacao: string;
  dataEntradaVigor?: string;
  url?: string;
  lida: boolean;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  casosTotais: number;
  casosAbertos: number;
  casosResolvidos: number;
  contratosAnalisados: number;
  verificacoesConformidade: number;
  alertasLegislativos: number;
  atividadeRecente: AtividadeRecente[];
}

export interface AtividadeRecente {
  id: string;
  tipo: "CASO" | "CONTRATO" | "COMPLIANCE" | "DOCUMENTO" | "PESQUISA";
  descricao: string;
  criadoEm: string;
}
