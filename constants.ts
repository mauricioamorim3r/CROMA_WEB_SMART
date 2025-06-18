import { ComponentData, ChecklistItem, SampleProperty, ValidationStatus, SamplingConditionProperty, AirContaminationProperty, RegulatoryComplianceItem, DateValidationDetails, DateValidationRuleStatus } from './types';

export const D2_FACTOR_MOVING_RANGE = 1.128; // For n=2 (Currently unused, kept if legacy or future use)

export const LIME_GREEN = '#d5fb00';
export const DARK_PURPLE = '#1b0571';
export const LIGHT_PURPLE_BACKGROUND = 'bg-purple-50'; // Tailwind class for a light purple

const initialDateRuleStatus: DateValidationRuleStatus = { status: ValidationStatus.Pendente, message: null };

export const INITIAL_DATE_VALIDATION_DETAILS: DateValidationDetails = {
  seq_coleta_recebLab: { ...initialDateRuleStatus },
  seq_recebLab_analiseLab: { ...initialDateRuleStatus },
  seq_analiseLab_emissaoLab: { ...initialDateRuleStatus },
  seq_emissaoLab_recebSolic: { ...initialDateRuleStatus },
  seq_recebSolic_analiseCritica: { ...initialDateRuleStatus },
  rtm52_prazoEmissaoBoletim: { ...initialDateRuleStatus },
  prazo_coleta_emissao_boletim: { ...initialDateRuleStatus },
};


export const INITIAL_COMPONENTS: ComponentData[] = [
  { id: 1, name: 'Metano (C₁)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 100, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 2, name: 'Etano (C₂)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 10.0, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 3, name: 'Propano (C₃)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 4.0, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 4, name: 'i-Butano (iC₄)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.4, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 5, name: 'n-Butano (nC₄)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.6, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 6, name: 'i-Pentano (iC₅)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.3, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 7, name: 'n-Pentano (nC₅)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.3, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 8, name: 'Hexano (C₆)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.12, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente }, 
  { id: 9, name: 'Heptano (C₇)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.04, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 10, name: 'Octano (C₈)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.03, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 11, name: 'Nonano (C₉⁺)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.06, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente }, // Approx for n-Nonane (0.03) + n-Decane (0.03)
  { id: 13, name: 'Nitrogênio (N₂)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 50.0, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 14, name: 'Dióxido de Carbono (CO₂)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 30.0, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente }, // Base max for CO2 from Range A
  { id: 15, name: 'Sulfeto de Hidrogênio (H₂S)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.1, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
  { id: 16, name: 'Oxigênio (O₂)', molarPercent: '', incertezaAssociadaPercent: '', aga8Min: 0, aga8Max: 0.2, cepLowerLimit: '', cepUpperLimit: '', aga8Status: ValidationStatus.Pendente, cepStatus: ValidationStatus.Pendente },
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
    { id: 'pcs_reg', parameter: 'Poder calorífico superior (PCS)', limit: '≥ 33,4 MJ/m³', bulletinValue: '', status: ValidationStatus.Pendente },
    { id: 'co2_reg', parameter: 'Dióxido de carbono (CO₂)', limit: '≤ 3,0 % mol', bulletinValue: '', status: ValidationStatus.Pendente },
    { id: 'h2s_reg', parameter: 'Sulfeto de hidrogênio (H₂S)', limit: '≤ 10 mg/m³', bulletinValue: '', status: ValidationStatus.Pendente },
    { id: 'inerts_reg', parameter: 'Inertes totais (CO₂ + N₂)', limit: '≤ 4,0 % mol', bulletinValue: '', status: ValidationStatus.Pendente },
    { id: 'c6plus_reg', parameter: 'Hidrocarbonetos pesados (C₆⁺)', limit: '≤ 0,2 % mol', bulletinValue: '', status: ValidationStatus.Pendente },
    { id: 'c1_reg', parameter: 'Metano (C₁)', limit: '≥ 85,0 % mol', bulletinValue: '', status: ValidationStatus.Pendente },
];


export const INPUT_CLASS = "mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-lime-custom focus:border-lime-custom sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 hover:border-gray-600 transition-colors duration-200";
export const LABEL_CLASS = "block text-sm font-medium text-gray-700";
export const TABLE_TH_CLASS = "px-4 py-2 text-center text-xs font-medium text-lime-custom uppercase tracking-wider bg-purple-custom";
export const TABLE_TD_CLASS = "px-4 py-2 whitespace-nowrap text-sm text-gray-700 border-b border-gray-200";
export const SECTION_TITLE_CLASS = "text-xl font-semibold text-lime-custom bg-purple-custom p-3 my-4 rounded-t-md border border-gray-300 shadow-sm";
export const SUB_SECTION_TITLE_CLASS = "text-lg font-semibold text-gray-800 my-3 pb-1 border-b border-gray-300"; 
export const PART_TITLE_CLASS = "text-6xl font-bold text-lime-custom bg-purple-custom p-4 my-6 rounded-xl shadow-lg text-center border border-gray-300";
