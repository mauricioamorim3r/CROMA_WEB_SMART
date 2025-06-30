export enum ValidationStatus {
  OK = 'OK',
  ForaDaFaixa = 'Fora da Faixa',
  Pendente = 'Pendente',
  NA = 'N/A'
}

export enum ChecklistStatus {
  SIM = 'SIM',
  NAO = 'NÃO',
  NaoAplicavel = 'NÃO APLICÁVEL'
}

export enum FinalDecisionStatus {
  Validado = 'VALIDADO',
  ValidadoComRestricoes = 'VALIDADO COM RESTRIÇÕES',
  NaoValidadoReprovado = 'NÃO VALIDADO - REPROVADO'
}

export enum ProcessType {
  ProcessoNormal = 'PROCESSO NORMAL',
  ProcessoSemValidacao = 'PROCESSO SEM VALIDAÇÃO'
}

// ✅ NOVOS TIPOS - Novos tipos para classificação
export enum GasQuality {
  Pipeline = 'Pipeline Quality',
  Intermediate = 'Intermediate Quality',
  OutOfSpecification = 'Out of Specification'
}

export enum ValidationMethod {
  AGA8_DETAIL = 'AGA-8 DETAIL',
  AGA8_GROSS = 'AGA-8 GROSS',
  GERG2008 = 'GERG-2008'
}

export interface ComponentData {
  id: number;
  name: string;
  molarPercent: string; // string to allow empty input
  incertezaAssociadaPercent: string; // string to allow empty input
  // incertezaAssociadaMgM3: string; // Removed as per user request
  aga8Min: number;
  aga8Max: number;
  cepLowerLimit: string;
  cepUpperLimit: string;
  aga8Status: ValidationStatus;
  cepStatus: ValidationStatus;
  // Limite de especificação ANP (RTM nº 52, AGA8, CEP) - handled by aga8Min/Max and cepLimits
  // Status de conformidade (✓ ou ✗) - handled by aga8Status, cepStatus
}

export interface SampleProperty { // For standard conditions properties
  id: string;
  name: string;
  value: string; // string to allow empty input
  referencia: string;
  incertezaExpandida: string; // string to allow empty input
  cepLowerLimit: string;
  cepUpperLimit: string;
  cepStatus: ValidationStatus;
}

export interface SamplingConditionProperty {
  id: string;
  name: string;
  value: string; // string to allow empty input
  referencia: string; // e.g. "Mol%" or other unit/basis
  incertezaExpandida: string; // string to allow empty input
}

export interface AirContaminationProperty {
  id: string;
  name: string;
  molPercent: string; // string to allow empty input
  referencia: string; // e.g. "Mol%" or other unit/basis
  incertezaExpandida: string; // string to allow empty input
}

export interface SolicitanteInfo {
  nomeClienteSolicitante: string;
  enderecoLocalizacaoClienteSolicitante: string;
  contatoResponsavelSolicitacao: string;
}

export interface SampleInfo {
  numeroAmostra: string;
  dataHoraColeta: string; // datetime-local
  localColeta: string;
  pontoColetaTAG: string; // reuses existing pontoColeta
  pocoApropriacao: string;
  numeroCilindroAmostra: string;
  responsavelAmostragem: string;
  pressaoAmostraAbsolutaKpaA: string;
  pressaoAmostraManometricaKpa: string;
  temperaturaAmostraK: string;
  temperaturaAmostraC: string;
}

export interface BulletinInfo {
  dataRecebimentoAmostra: string; // date
  dataAnaliseLaboratorial: string; // date
  dataEmissaoBoletim: string; // date - existing
  dataRecebimentoBoletimSolicitante: string; //date
  dataImplementacao: string; // date - NEW: Data efetiva de implementação dos resultados
  laboratorioEmissor: string;
  equipamentoCromatografoUtilizado: string;
  metodoNormativo: string;
  tipoProcesso: ProcessType; // New field for ANP 52/2013 process type
}

export interface Aga8ValidationData {
  faixaPressaoValida: string; // e.g. "0 a 70 MPa" - could be a fixed display or input
  faixaTemperaturaValida: string; // e.g. "-30°C a 150°C" - could be fixed display or input
  faixaComposicaoCompativel: string; // Status: Compatível / Não Compatível / Pendente
  zCalculadoPorMetodo: string; // e.g. Detalhado / Gross Method / N/A
  consistenciaZCondPadraoZAmostragem: string; // Status: Consistente / Inconsistente / Pendente
}

export interface RegulatoryComplianceItem {
  id: string;
  parameter: string;
  limit: string;
  bulletinValue: string;
  status: ValidationStatus;
}

export interface StatisticalProcessControlData {
  tendenciaHistoricaComposicao: string;
  resultadosDentroFaixaCartasControle: string; // Sim / Não / N/A
  deteccaoDesviosSignificativos: string;
}

// Removed TraceabilityUncertaintyData interface

export interface RecommendedActions {
  implementarComputadorVazao: boolean;
  dataImplementacaoComputadorVazao: string;
  novaAmostragem: boolean;
  investigacaoCausaRaiz: boolean;
  contatoComLaboratorio: boolean;
  outraAcaoRecomendada: boolean;
  outraAcaoRecomendadaDescricao: string;
}

export interface ChecklistItem {
  id: number;
  description: string;
  status: ChecklistStatus | null;
  observation: string;
}

export interface DateValidationRuleStatus {
  status: ValidationStatus;
  message: string | null;
}

export interface DateValidationDetails {
  seq_coleta_recebLab: DateValidationRuleStatus;
  seq_recebLab_analiseLab: DateValidationRuleStatus;
  seq_analiseLab_emissaoLab: DateValidationRuleStatus;
  seq_emissaoLab_recebSolic: DateValidationRuleStatus;
  seq_recebSolic_analiseCritica: DateValidationRuleStatus;
  anp52_prazoColetaEmissao: DateValidationRuleStatus; // New: ANP 52 25 days collection to bulletin
  anp52_prazoColetaImplementacao: DateValidationRuleStatus; // New: ANP 52 process-specific limits (26-28 days)
  anp52_novaAmostragem: DateValidationRuleStatus; // New: 3 business days for new sampling
}


export interface ReportData {
  // Parte 1 - Identificação do Registro (some here, some in header component directly)
  numeroUnicoRastreabilidade: string;
  dataRealizacaoAnaliseCritica: string; // date (was dataEmissaoRelatorio)
  revisaoAnaliseCritica: string;
  
  // Objetivo (from original structure)
  objetivo: string;

  // Parte 1 - Informações do Solicitante
  solicitantInfo: SolicitanteInfo;

  // Parte 1 - Informações da Amostra
  sampleInfo: SampleInfo;

  // Parte 1 - Dados do Boletim
  bulletinInfo: BulletinInfo;
  numeroBoletim: string; // Kept as it's a key identifier for the bulletin itself
  plataforma: string; // Contextual info, kept at top level or move to sample general info
  sistemaMedicao: string;
  // classificacao: string; // Removed as per user request

  // Parte 1 - Validações de Datas
  dateValidationDetails: DateValidationDetails;

  // Parte 1 - Checklist
  checklistItems: ChecklistItem[];

  // Parte 1 - Composição Molar e Incertezas
  components: ComponentData[];

  // Parte 1 - Propriedades do Gás – Condições Padrão
  standardProperties: SampleProperty[]; // Renamed from 'properties'

  // Parte 1 - Propriedades do Gás – Condições de Amostragem
  samplingConditionsProperties: SamplingConditionProperty[];

  // Parte 1 - Contaminação por Ar
  airContaminationProperties: AirContaminationProperty[];
  
  // Parte 1 - Observações (do boletim)
  observacoesBoletim: string; // Renamed from observacoesComplementares for clarity

  // ✅ NOVOS CAMPOS - Adicionando novos campos de qualidade
  gasQuality?: GasQuality;
  validationMethod?: ValidationMethod; 
  operationalRange?: 'normal' | 'extended';
  qualityValidationDetails?: {
    pipelineCompliant: boolean;
    intermediateCompliant: boolean;
    violations: {
      pipeline: string[];
      intermediate: string[];
    };
  };

  // Parte 2 – Validação Técnica e Metrológica
  aga8ValidationData: Aga8ValidationData;
  regulatoryComplianceItems: RegulatoryComplianceItem[];
  statisticalProcessControlData: StatisticalProcessControlData;
  // traceabilityUncertaintyData: TraceabilityUncertaintyData; // Removed

  // Parte 3 – Conclusão e Decisão Final
  decisaoFinal: FinalDecisionStatus | null;
  justificativaTecnica: string;
  acoesRecomendadas: RecommendedActions;
  
  // Statuses for summary (kept from original, inform the final decision)
  referenciaCepStatus: ValidationStatus;
  referenciaAga8Status: ValidationStatus;
  referenciaChecklistStatus: ValidationStatus;
  // overallResult is now 'decisaoFinal'

  // Parte 3 - Responsáveis (was ApprovalSection)
  responsavelAnaliseNome: string; // was executadoPor
  responsavelAnaliseData: string; // was executadoEm
  aprovacaoAnaliseNome: string; // was aprovadoPor
  aprovacaoAnaliseData: string; // was aprovadoEm
}

// ✅ INTERFACE CEP EXPANDIDA - Conforme Excel mostrado nas imagens
export interface CEPHistoricalSample {
  id: string;
  boletimNumber: string;
  
  // Datas principais
  dataColeta: string;           // Data da Coleta
  dataEmissaoRelatorio: string; // Data da Emissão do Relatório  
  dataValidacao: string;        // Data da Validação
  
  // Componentes do gás (% mol)
  components: {
    'Metano (C₁)': number;
    'Etano (C₂)': number;
    'Propano (C₃)': number;
    'i-Butano (iC₄)': number;
    'n-Butano (nC₄)': number;
    'i-Pentano (iC₅)': number;
    'n-Pentano (nC₅)': number;
    'Hexano (C₆)': number;
    'Heptano (C₇)': number;
    'Octano (C₈)': number;
    'Nonano (C₉)': number;
    'Decano (C₁₀)': number;
    'Oxigênio (O₂)': number;
    'Nitrogênio (N₂)': number;
    'Dióxido de Carbono (CO₂)': number;
  };
  
  // Total da composição
  totalComposicao: number;
  
  // Propriedades calculadas
  properties: {
    fatorCompressibilidade: number;  // Fator de Compressibilidade
    massaEspecifica: number;         // Massa Específica
    massaMolecular: number;          // Massa Molecular
  
  };
  
  // Histórico de edições
  editHistory?: {
    date: string;
    reason: string;
    changedFields: string[];
    previousValues: { [key: string]: number | string };
  }[];
}

// ✅ MAPEAMENTO DE COLUNAS CEP - Para exibição e exportação
export const CEP_COLUMNS_CONFIG = {
  dates: [
    { key: 'dataColeta', label: 'Data da Coleta' },
    { key: 'dataEmissaoRelatorio', label: 'Data da Emissão do Relatório' },
    { key: 'dataValidacao', label: 'Data da Validação' }
  ],
  metadata: [
    { key: 'boletimNumber', label: 'Boletim' }
  ],
  components: [
    { key: 'Metano (C₁)', label: 'Metano' },
    { key: 'Etano (C₂)', label: 'Etano' },
    { key: 'Propano (C₃)', label: 'Propano' },
    { key: 'i-Butano (iC₄)', label: 'Isobutano' },
    { key: 'n-Butano (nC₄)', label: 'n-Butano' },
    { key: 'i-Pentano (iC₅)', label: 'Isopentano' },
    { key: 'n-Pentano (nC₅)', label: 'N-Pentano' },
    { key: 'Hexano (C₆)', label: 'Hexano' },
    { key: 'Heptano (C₇)', label: 'Heptano' },
    { key: 'Octano (C₈)', label: 'Octano' },
    { key: 'Nonano (C₉)', label: 'Nonano' },
    { key: 'Decano (C₁₀)', label: 'Decano' },
    { key: 'Oxigênio (O₂)', label: 'Oxigênio' },
    { key: 'Nitrogênio (N₂)', label: 'Nitrogênio' },
    { key: 'Dióxido de Carbono (CO₂)', label: 'Dióxido de Carbono' }
  ],
  totals: [
    { key: 'totalComposicao', label: 'TOTAL' }
  ],
  properties: [
    { key: 'fatorCompressibilidade', label: 'Fator de Compressibilidade' },
    { key: 'massaEspecifica', label: 'Massa Específica' },
    { key: 'massaMolecular', label: 'Massa Molecular' },

  ]
} as const;