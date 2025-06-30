import { ComponentData, ChecklistItem, SampleProperty, ValidationStatus, SamplingConditionProperty, AirContaminationProperty, RegulatoryComplianceItem, DateValidationDetails, DateValidationRuleStatus, ReportData, ProcessType } from './types';

export const D2_FACTOR_MOVING_RANGE = 1.128; // For n=2 (Currently unused, kept if legacy or future use)

export const LIME_GREEN = '#d5fb00';
export const DARK_PURPLE = '#1b0571';
export const LIGHT_PURPLE_BACKGROUND = 'bg-purple-50'; // Tailwind class for a light purple

// ANP 52/2013 Process Limits (Resolution ANP No 52, December 26, 2013)
export const ANP52_PRAZO_COLETA_EMISSAO_DIAS = 25; // 25 days: Collection to bulletin emission
export const ANP52_PRAZO_PROCESSO_NORMAL_DIAS = 28; // 28 days: Normal process (25 + 3 business days)
export const ANP52_PRAZO_PROCESSO_SEM_VALIDACAO_DIAS = 26; // 26 days: Process without validation (25 + 1 business day)
export const ANP52_PRAZO_NOVA_AMOSTRAGEM_DIAS_UTEIS = 3; // 3 business days for new sampling after critical analysis

const initialDateRuleStatus: DateValidationRuleStatus = { status: ValidationStatus.Pendente, message: null };

export const INITIAL_DATE_VALIDATION_DETAILS: DateValidationDetails = {
  seq_coleta_recebLab: { ...initialDateRuleStatus },
  seq_recebLab_analiseLab: { ...initialDateRuleStatus },
  seq_analiseLab_emissaoLab: { ...initialDateRuleStatus },
  seq_emissaoLab_recebSolic: { ...initialDateRuleStatus },
  seq_recebSolic_analiseCritica: { ...initialDateRuleStatus },
  anp52_prazoColetaEmissao: { ...initialDateRuleStatus },
  anp52_prazoColetaImplementacao: { ...initialDateRuleStatus },
  anp52_novaAmostragem: { ...initialDateRuleStatus },
};


export const INITIAL_COMPONENTS: ComponentData[] = [
  { id: 1, name: 'Metano (C₁)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 70, aga8Max: 100, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 2, name: 'Etano (C₂)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 10.0, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 3, name: 'Propano (C₃)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 3.5, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 4, name: 'i-Butano (iC₄)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 1.5, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 5, name: 'n-Butano (nC₄)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 1.5, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 6, name: 'i-Pentano (iC₅)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.5, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 7, name: 'n-Pentano (nC₅)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.5, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 8, name: 'Hexano (C₆)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.15, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente }, 
  { id: 9, name: 'Heptano (C₇)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.05, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 10, name: 'Octano (C₈)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.05, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 11, name: 'Nonano (C₉)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.05, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 12, name: 'Decano (C₁₀)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.05, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 13, name: 'Nitrogênio (N₂)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 20.0, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 14, name: 'Dióxido de Carbono (CO₂)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 20.0, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente }, // Pipeline Quality AGA-8 Part 2
  { id: 15, name: 'Sulfeto de Hidrogênio (H₂S)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.02, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 16, name: 'Oxigênio (O₂)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.02, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  // Componentes AGA-8 adicionais (Range A)
  { id: 20, name: 'Água (H₂O)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.05, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 21, name: 'Monóxido de Carbono (CO)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 1.0, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
];

export const INITIAL_STANDARD_PROPERTIES: SampleProperty[] = [ 
  { id: 'pcs', name: 'PCS (Poder calorífico superior - kJ/m³)', value: '', referencia: '', incertezaExpandida: '', cepLowerLimit: '', cepUpperLimit: '', cepStatus: ValidationStatus.Pendente },
  { id: 'pci', name: 'PCI (Poder calorífico inferior - kJ/m³)', value: '', referencia: '', incertezaExpandida: '', cepLowerLimit: '', cepUpperLimit: '', cepStatus: ValidationStatus.Pendente },
  { id: 'compressibilityFactor', name: 'Compressibilidade Z (Cond. Ref: 20°C/1atm)', value: '', referencia: '', incertezaExpandida: '', cepLowerLimit: '', cepUpperLimit: '', cepStatus: ValidationStatus.Pendente },
  { id: 'molarMass', name: 'Peso molecular total (g/mol)', value: '', referencia: '', incertezaExpandida: '', cepLowerLimit: '', cepUpperLimit: '', cepStatus: ValidationStatus.Pendente },
  { id: 'viscosity', name: 'Viscosidade do gás (cP)', value: '', referencia: '', incertezaExpandida: '', cepLowerLimit: '', cepUpperLimit: '', cepStatus: ValidationStatus.Pendente },
  { id: 'adiabaticCoefficient', name: 'Coeficiente Adiabático', value: '', referencia: '', incertezaExpandida: '', cepLowerLimit: '', cepUpperLimit: '', cepStatus: ValidationStatus.Pendente },
  { id: 'realDensity', name: 'Densidade real (kg/m³) (Cond. Ref: 20°C/1atm)', value: '', referencia: '', incertezaExpandida: '', cepLowerLimit: '', cepUpperLimit: '', cepStatus: ValidationStatus.Pendente },
  { id: 'relativeDensity', name: 'Densidade relativa (ar = 1,0)', value: '', referencia: '', incertezaExpandida: '', cepLowerLimit: '', cepUpperLimit: '', cepStatus: ValidationStatus.Pendente },
  { id: 'isentropicCoefficient', name: 'Coeficiente Isentrópico', value: '', referencia: '', incertezaExpandida: '', cepLowerLimit: '', cepUpperLimit: '', cepStatus: ValidationStatus.Pendente },
];

export const INITIAL_SAMPLING_CONDITION_PROPERTIES: SamplingConditionProperty[] = [
    { id: 'densitySampling', name: 'Densidade (kg/m³)', value: '', referencia: '', incertezaExpandida: '' },
    { id: 'relativeDensitySampling', name: 'Densidade relativa', value: '', referencia: '', incertezaExpandida: '' }, 
    { id: 'adiabaticCoefficientSampling', name: 'Coeficiente Adiabático', value: '', referencia: '', incertezaExpandida: '' },
    { id: 'viscositySampling', name: 'Viscosidade do gás (cP)', value: '', referencia: '', incertezaExpandida: '' },
    { id: 'compressibilityFactorSampling', name: 'Compressibilidade Z', value: '', referencia: '', incertezaExpandida: '' },
    { id: 'wobbeIndex', name: 'Índice de Wobbe (kJ/m³)', value: '', referencia: '', incertezaExpandida: '' },
    { id: 'isentropicCoefficientSampling', name: 'Coeficiente Isentrópico', value: '', referencia: '', incertezaExpandida: '' },
];

export const INITIAL_AIR_CONTAMINATION_PROPERTIES: AirContaminationProperty[] = [
    { id: 'oxygenFromAir', name: 'Oxigênio do Ar (mol%)', molPercent: '', referencia: '', incertezaExpandida: '' },
    { id: 'nitrogenFromAir', name: 'Nitrogênio do Ar (mol%)', molPercent: '', referencia: '', incertezaExpandida: '' },
    { id: 'totalAir', name: 'Ar total (mol%)', molPercent: '', referencia: '', incertezaExpandida: '' },
];


export const INITIAL_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 1, description: 'Identificação do boletim de resultado analítico', status: null, observation: '' },
  { id: 2, description: 'Identificação da amostra', status: null, observation: '' },
  { id: 3, description: 'Descrição da data de amostragem', status: null, observation: '' },
  { id: 4, description: 'Descrição da data de recebimento da amostra pelo laboratório', status: null, observation: '' },
  { id: 5, description: 'Descrição da data de realização das análises', status: null, observation: '' },
  { id: 6, description: 'Descrição da data de emissão do BRA', status: null, observation: '' },
  { id: 7, description: 'Identificação do campo produtor ou da Instalação', status: null, observation: '' },
  { id: 8, description: 'Identificação do Agente Regulado', status: null, observation: '' },
  { id: 9, description: 'Identificação do ponto de medição e/ou do poço quando aplicável.', status: null, observation: '' },
  { id: 10, description: 'Resultados das análises e normas ou procedimentos utilizados', status: null, observation: '' },
  { id: 11, description: 'Descrição das características do processo do ponto de amostragem do fluido (pressão e temperatura)', status: null, observation: '' },
  { id: 12, description: 'Identificação do responsável pela amostragem', status: null, observation: '' },
  { id: 13, description: 'Indicação das incertezas de medição, com descrição do nível de confiança e fator de abrangência.', status: null, observation: '' },
  { id: 14, description: 'Identificação dos responsáveis técnicos pela realização da análise.', status: null, observation: '' },
  { id: 15, description: 'Identificação dos responsáveis pela elaboração e aprovação do boletim', status: null, observation: '' },
];

export const INITIAL_REGULATORY_COMPLIANCE_ITEMS: RegulatoryComplianceItem[] = [
    { id: 'metano_aga8', parameter: 'Metano (C₁)', limit: '≥ 70,0 % mol', bulletinValue: '', status: ValidationStatus.Pendente },
    { id: 'co2_aga8', parameter: 'Dióxido de carbono (CO₂)', limit: '≤ 20,0 % mol', bulletinValue: '', status: ValidationStatus.Pendente },
    { id: 'n2_aga8', parameter: 'Nitrogênio (N₂)', limit: '≤ 20,0 % mol', bulletinValue: '', status: ValidationStatus.Pendente },
    { id: 'h2s_aga8', parameter: 'Sulfeto de hidrogênio (H₂S)', limit: '≤ 0,02 % mol', bulletinValue: '', status: ValidationStatus.Pendente },
    { id: 'temperatura_aga8', parameter: 'Temperatura', limit: '-4°C a 62°C', bulletinValue: '', status: ValidationStatus.Pendente },
    { id: 'pressao_aga8', parameter: 'Pressão', limit: '≤ 10.342 kPa (DETAIL)', bulletinValue: '', status: ValidationStatus.Pendente },
];

// Template System
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'offshore' | 'onshore' | 'industrial' | 'laboratory';
  icon: string;
  data: Partial<ReportData>;
}

export const AVAILABLE_TEMPLATES: ReportTemplate[] = [
  {
    id: 'offshore-standard',
    name: 'Plataforma Offshore - Padrão',
    description: 'Template para análise de gás natural de plataformas offshore com parâmetros típicos',
    category: 'offshore',
    icon: '🛢️',
    data: {
      objetivo: 'Validar os resultados analíticos do boletim cromatográfico de gás natural offshore, assegurando conformidade com A.G.A Report Nº8 e requisitos regulatórios ANP.',
      plataforma: 'Plataforma Offshore',
      sistemaMedicao: 'Sistema de Medição Fiscal',
      bulletinInfo: {
        laboratorioEmissor: 'Laboratório Certificado INMETRO',
        equipamentoCromatografoUtilizado: 'Cromatógrafo a Gás - GC-TCD/FID',
        metodoNormativo: 'ASTM D1945, ISO 6976',
        dataRecebimentoAmostra: '',
        dataAnaliseLaboratorial: '',
        dataEmissaoBoletim: '',
        dataRecebimentoBoletimSolicitante: '',
        dataImplementacao: '',
        tipoProcesso: ProcessType.ProcessoNormal
      },
      components: INITIAL_COMPONENTS.map(comp => ({
        ...comp,
        // Valores típicos para offshore
        ...(comp.name === 'Metano (C₁)' && { molarPercent: '89.5', cepLowerLimit: '87.0', cepUpperLimit: '92.0' }),
        ...(comp.name === 'Etano (C₂)' && { molarPercent: '6.2', cepLowerLimit: '5.0', cepUpperLimit: '8.0' }),
        ...(comp.name === 'Propano (C₃)' && { molarPercent: '2.8', cepLowerLimit: '2.0', cepUpperLimit: '4.0' }),
        ...(comp.name === 'Dióxido de Carbono (CO₂)' && { molarPercent: '1.2', cepLowerLimit: '0.5', cepUpperLimit: '3.0' }),
        ...(comp.name === 'Nitrogênio (N₂)' && { molarPercent: '0.3', cepLowerLimit: '0.1', cepUpperLimit: '1.0' })
      }))
    }
  },
  {
    id: 'onshore-standard',
    name: 'Campo Onshore - Padrão',
    description: 'Template para análise de gás natural de campos terrestres',
    category: 'onshore',
    icon: '🏭',
    data: {
      objetivo: 'Validar os resultados analíticos do boletim cromatográfico de gás natural onshore, verificando conformidade regulatória e critérios de CEP.',
      plataforma: 'Campo de Produção Terrestre',
      sistemaMedicao: 'Sistema de Medição de Transferência de Custódia',
      bulletinInfo: {
        laboratorioEmissor: 'Laboratório Credenciado INMETRO',
        equipamentoCromatografoUtilizado: 'Cromatógrafo a Gás - GC-MS',
        metodoNormativo: 'ASTM D1945, ASTM D1946, ISO 6976',
        dataRecebimentoAmostra: '',
        dataAnaliseLaboratorial: '',
        dataEmissaoBoletim: '',
        dataRecebimentoBoletimSolicitante: '',
        dataImplementacao: '',
        tipoProcesso: ProcessType.ProcessoNormal
      },
      components: INITIAL_COMPONENTS.map(comp => ({
        ...comp,
        // Valores típicos para onshore
        ...(comp.name === 'Metano (C₁)' && { molarPercent: '91.2', cepLowerLimit: '88.0', cepUpperLimit: '94.0' }),
        ...(comp.name === 'Etano (C₂)' && { molarPercent: '4.8', cepLowerLimit: '3.0', cepUpperLimit: '7.0' }),
        ...(comp.name === 'Propano (C₃)' && { molarPercent: '2.1', cepLowerLimit: '1.5', cepUpperLimit: '3.5' }),
        ...(comp.name === 'Dióxido de Carbono (CO₂)' && { molarPercent: '1.8', cepLowerLimit: '1.0', cepUpperLimit: '3.0' }),
        ...(comp.name === 'Nitrogênio (N₂)' && { molarPercent: '0.1', cepLowerLimit: '0.05', cepUpperLimit: '0.5' })
      }))
    }
  },
  {
    id: 'laboratory-qc',
    name: 'Controle de Qualidade - Laboratório',
    description: 'Template para validação de padrões e materiais de referência em laboratório',
    category: 'laboratory',
    icon: '🧪',
    data: {
      objetivo: 'Validar resultados de análise de material de referência certificado (MRC) para controle de qualidade analítica.',
      plataforma: 'Laboratório de Análises',
      sistemaMedicao: 'Controle de Qualidade Analítica',
      bulletinInfo: {
        laboratorioEmissor: 'Laboratório de Referência',
        equipamentoCromatografoUtilizado: 'Cromatógrafo de Referência - GC-TCD/FID',
        metodoNormativo: 'ASTM D1945, ISO 6974, ISO 6975',
        dataRecebimentoAmostra: '',
        dataAnaliseLaboratorial: '',
        dataEmissaoBoletim: '',
        dataRecebimentoBoletimSolicitante: '',
        dataImplementacao: '',
        tipoProcesso: ProcessType.ProcessoNormal
      },
      components: INITIAL_COMPONENTS.map(comp => ({
        ...comp,
        // Limites mais rigorosos para QC
        ...(comp.name === 'Metano (C₁)' && { cepLowerLimit: '89.8', cepUpperLimit: '90.2' }),
        ...(comp.name === 'Etano (C₂)' && { cepLowerLimit: '5.95', cepUpperLimit: '6.05' }),
        ...(comp.name === 'Propano (C₃)' && { cepLowerLimit: '2.95', cepUpperLimit: '3.05' })
      }))
    }
  },
  {
    id: 'industrial-application',
    name: 'Aplicação Industrial',
    description: 'Template para gás natural destinado a aplicações industriais',
    category: 'industrial',
    icon: '🏗️',
    data: {
      objetivo: 'Validar qualidade do gás natural para uso industrial, verificando especificações técnicas e requisitos operacionais.',
      plataforma: 'Unidade Industrial',
      sistemaMedicao: 'Sistema de Medição Industrial',
      bulletinInfo: {
        laboratorioEmissor: 'Laboratório Industrial Certificado',
        equipamentoCromatografoUtilizado: 'Cromatógrafo Industrial - GC Online',
        metodoNormativo: 'ASTM D1945, NBR 15213',
        dataRecebimentoAmostra: '',
        dataAnaliseLaboratorial: '',
        dataEmissaoBoletim: '',
        dataRecebimentoBoletimSolicitante: '',
        dataImplementacao: '',
        tipoProcesso: ProcessType.ProcessoNormal
      },
      standardProperties: INITIAL_STANDARD_PROPERTIES.map(prop => ({
        ...prop,
        // Especificações industriais
        ...(prop.id === 'pcs' && { cepLowerLimit: '35000', cepUpperLimit: '42000' }),
        ...(prop.id === 'relativeDensity' && { cepLowerLimit: '0.55', cepUpperLimit: '0.75' }),
        ...(prop.id === 'wobbeIndex' && { cepLowerLimit: '46000', cepUpperLimit: '52000' })
      }))
    }
  }
];

export const INPUT_CLASS = "mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-lime-custom focus:border-lime-custom sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 hover:border-gray-600 transition-colors duration-200";
export const LABEL_CLASS = "block text-sm font-medium text-gray-700";
export const TABLE_TH_CLASS = "px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-600 border-r border-blue-400/50";
export const TABLE_TD_CLASS = "px-4 py-2 whitespace-nowrap text-sm text-gray-700 border-b border-gray-200";
export const SECTION_TITLE_CLASS = "text-xl font-semibold text-lime-custom bg-purple-custom p-3 my-4 rounded-t-md border border-gray-300 shadow-sm";
export const SUB_SECTION_TITLE_CLASS = "text-lg font-semibold text-gray-800 my-3 pb-1 border-b border-gray-300"; 
export const PART_TITLE_CLASS = "text-3xl font-bold text-lime-custom bg-purple-custom p-4 my-6 rounded-xl shadow-lg text-center border border-gray-300";
