/**
 * Módulo de Validação Automática dos Critérios AGA8
 * Integrado ao sistema de validação cromatográfica existente
 * 
 * Baseado nas diretrizes do AGA Report No. 8 e na estrutura atual da aplicação
 */

import { ComponentData, ReportData, ValidationStatus } from './types';
import { determineGasQuality, GasQuality } from './src/utils/gas-quality-classifier';
import { determineValidationMethod, ValidationMethod } from './src/utils/validation-method-selector';
import { AGA8_PIPELINE_QUALITY_LIMITS, AGA8_INTERMEDIATE_QUALITY_LIMITS } from './src/constants/aga8-limits';

export interface AGA8CriteriaLimits {
  pressao_max_kpa: number;
  temperatura_min_C: number;
  temperatura_max_C: number;
  componentes: Record<string, number>;
}

export interface AGA8CriteriaResult {
  metodo: ValidationMethod;
  gasQuality: GasQuality;
  operationalRange: 'normal' | 'extended';
  isValid: boolean;
  reason: string;
  componentValidations: Array<{
    component: string;
    value: number;
    status: ValidationStatus;
    limits: string | null;
    qualityType: string;
  }>;
  
  criterio: string;
  detalhes: string;
}

/**
 * Limites normativos dos critérios AGA8 
 * Baseados na documentação oficial e integrados aos nomes de componentes da aplicação
 */
export function obterLimitesCriterios(): Record<string, AGA8CriteriaLimits> {
  return {
    "DETAIL": {
      pressao_max_kpa: 10342,  // ~1500 psia (Range A)
      temperatura_min_C: -4,
      temperatura_max_C: 62,
      componentes: {
        "Nitrogênio (N₂)": 0.50,
        "Dióxido de Carbono (CO₂)": 0.30,
        "Etano (C₂)": 0.10,
        "Propano (C₃)": 0.04,
        "i-Butano (iC₄)": 0.004,
        "n-Butano (nC₄)": 0.006,
        "i-Pentano (iC₅)": 0.003,
        "n-Pentano (nC₅)": 0.003,
        "Hexano (C₆)": 0.0012,
        "Heptano (C₇)": 0.0004,
        "Hidrogênio (H₂)": 0.05,
        "Sulfeto de Hidrogênio (H₂S)": 0.001,
        "Água (H₂O)": 0.0005,
        "Oxigênio (O₂)": 0.002
      }
    },
    "GROSS": {
      pressao_max_kpa: 20684,  // ~3000 psia
      temperatura_min_C: -4,
      temperatura_max_C: 62,
      componentes: {
        "Nitrogênio (N₂)": 0.07,
        "Dióxido de Carbono (CO₂)": 0.03,
        "Etano (C₂)": 0.02,
        "Propano (C₃)": 0.005,
        "i-Butano (iC₄)": 0.003,
        "n-Butano (nC₄)": 0.003,
        "i-Pentano (iC₅)": 0.002,
        "n-Pentano (nC₅)": 0.002,
        "Hexano (C₆)": 0.0004,
        "Hidrogênio (H₂)": 0.002,
        "Sulfeto de Hidrogênio (H₂S)": 0.0008,
        "Água (H₂O)": 0.0003,
        "Oxigênio (O₂)": 0.002
      }
    },
    "GERG-2008": {
      pressao_max_kpa: 70000,  // até 70 MPa
      temperatura_min_C: -160,
      temperatura_max_C: 200,
      componentes: {} // Flexível - aceita qualquer composição
    }
  };
}



/**
 * Função principal de seleção automática do critério AGA8
 * Integrada à estrutura existente da aplicação
 */
export function escolherCriterioAGA8(
  components: ComponentData[],
  temperatura_C: number,
  pressao_kPa: number
): AGA8CriteriaResult {
  
  // Converter temperatura para Kelvin
  const temperatura_K = temperatura_C + 273.15;
  
  // Determinar qualidade e método automaticamente
  const gasQuality = determineGasQuality(components);
  const validationCriteria = determineValidationMethod(components, temperatura_K, pressao_kPa);
  
  // Verificar se cada componente está dentro dos limites
  const componentValidations = components.map(component => {
    let limits;
    let qualityType;
    
    if (gasQuality === GasQuality.Pipeline) {
      limits = (AGA8_PIPELINE_QUALITY_LIMITS as any)[component.name];
      qualityType = 'Pipeline';
    } else {
      limits = (AGA8_INTERMEDIATE_QUALITY_LIMITS as any)[component.name];
      qualityType = 'Intermediate';
    }
    
    if (!limits) {
      return {
        component: component.name,
        value: parseFloat(component.molarPercent),
        status: 'OK' as ValidationStatus,
        limits: null,
        qualityType
      };
    }
    
    const value = parseFloat(component.molarPercent);
    const isValid = value >= limits.min && value <= limits.max;
    
    return {
      component: component.name,
      value,
      status: isValid ? 'OK' as ValidationStatus : 'Fora da Faixa' as ValidationStatus,
      limits: `${limits.min} - ${limits.max}%`,
      qualityType
    };
  });
  
  return {
    metodo: validationCriteria.method,
    gasQuality: gasQuality,
    operationalRange: validationCriteria.operationalRange,
    isValid: validationCriteria.isValid,
    reason: validationCriteria.reason,
    componentValidations,
    
    criterio: validationCriteria.method,
    detalhes: validationCriteria.reason
  };
}



/**
 * Integração com o sistema existente de validação AGA8
 * Atualiza os campos de validação baseado no critério selecionado
 */
export function atualizarValidacaoAGA8Automatica(reportData: ReportData): Partial<ReportData> {
  const temperatura = parseFloat(reportData.sampleInfo?.temperaturaAmostraC || '20');
  const pressao = parseFloat(reportData.sampleInfo?.pressaoAmostraAbsolutaKpaA || '0');
  
  const resultado = escolherCriterioAGA8(reportData.components, temperatura, pressao);
  
  // Gerar descrições detalhadas
  const faixaPressao = gerarDescricaoFaixaPressao(resultado);
  const faixaTemperatura = gerarDescricaoFaixaTemperatura(resultado);
  const compatibilidade = resultado.isValid ? 'Compatível' : 'Não Compatível';
  const metodoZ = gerarDescricaoMetodoZ(resultado, reportData);
  
  return {
    aga8ValidationData: {
      ...reportData.aga8ValidationData,
      faixaPressaoValida: faixaPressao,
      faixaTemperaturaValida: faixaTemperatura,
      faixaComposicaoCompativel: compatibilidade,
      zCalculadoPorMetodo: metodoZ
    }
  };
}

/**
 * Funções auxiliares para gerar descrições dos campos
 */
function gerarDescricaoFaixaPressao(resultado: AGA8CriteriaResult): string {
  switch (resultado.metodo) {
    case ValidationMethod.AGA8_DETAIL:
      return '0 a 10.3 MPa (AGA-8 DETAIL)';
    case ValidationMethod.AGA8_GROSS:
      return '0 a 20.7 MPa (AGA-8 GROSS)';
    case ValidationMethod.GERG2008:
      return '0 a 70 MPa (GERG-2008)';
    default:
      return '0 a 70 MPa (Padrão)';
  }
}

function gerarDescricaoFaixaTemperatura(resultado: AGA8CriteriaResult): string {
  switch (resultado.metodo) {
    case ValidationMethod.AGA8_DETAIL:
    case ValidationMethod.AGA8_GROSS:
      return '-4°C a 62°C (AGA-8)';
    case ValidationMethod.GERG2008:
      return '-160°C a 200°C (GERG-2008)';
    default:
      return '-30°C a 150°C (Padrão)';
  }
}

function gerarDescricaoMetodoZ(resultado: AGA8CriteriaResult, reportData: ReportData): string {
  const temComposicaoCompleta = reportData.components.filter(c => 
    parseFloat(c.molarPercent) > 0
  ).length >= 10;
  
  const pcs = parseFloat(reportData.standardProperties.find(p => p.id === 'pcs')?.value || '0');
  const densidade = parseFloat(reportData.standardProperties.find(p => p.id === 'relativeDensity')?.value || '0');
  
  if (resultado.metodo === ValidationMethod.AGA8_DETAIL && temComposicaoCompleta) {
    return 'Detalhado (AGA-8 DETAIL)';
  } else if (resultado.metodo === ValidationMethod.AGA8_GROSS || (pcs > 0 && densidade > 0)) {
    return 'Gross Method (AGA-8 GROSS)';
  } else if (resultado.metodo === ValidationMethod.GERG2008) {
    return 'GERG-2008 (Fora dos limites AGA-8)';
  } else {
    return 'N/A (Dados Insuficientes)';
  }
}

/**
 * Função para logging/debugging da seleção de critério
 */
export function logSelecaoCriterio(
  composicao: ComponentData[], 
  temperatura: number, 
  pressao: number
): void {
  const resultado = escolherCriterioAGA8(composicao, temperatura, pressao);
  
  console.group('🔍 Seleção Automática de Critério AGA8');
  console.log('📊 Modelo Selecionado:', resultado.metodo);
  console.log('📋 Critério:', resultado.criterio);
  console.log('✅ Válido:', resultado.isValid);
  
  if (resultado.componentValidations.length > 0) {
    console.log('⚠️ Componentes fora dos limites:', resultado.componentValidations.filter(c => c.status === 'Fora da Faixa').map(c => c.component));
  }
  
  console.log('🌡️ Temperatura:', temperatura, '°C');
  console.log('💨 Pressão:', pressao, 'kPa');
  console.log('📈 Status detalhado:', resultado.detalhes);
  console.groupEnd();
}

 