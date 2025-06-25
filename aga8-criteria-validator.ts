/**
 * Módulo de Validação Automática dos Critérios AGA8
 * Integrado ao sistema de validação cromatográfica existente
 * 
 * Baseado nas diretrizes do AGA Report No. 8 e na estrutura atual da aplicação
 */

import { ComponentData, ReportData } from './types';

export interface AGA8CriteriaLimits {
  pressao_max_kpa: number;
  temperatura_min_C: number;
  temperatura_max_C: number;
  componentes: Record<string, number>;
}

export interface AGA8CriteriaResult {
  modelo: 'DETAIL' | 'GROSS' | 'GERG-2008';
  criterio: string;
  motivosExcedidos: string[];
  isValid: boolean;
  detalhes: {
    pressaoStatus: boolean;
    temperaturaStatus: boolean;
    composicaoStatus: boolean;
    metanoMinimo: boolean;
  };
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
 * Converte ComponentData para o formato esperado pela validação
 */
function converterComposicaoParaValidacao(components: ComponentData[]): Record<string, number> {
  const composicao: Record<string, number> = {};
  
  components.forEach(comp => {
    const valor = parseFloat(comp.molarPercent) || 0;
    if (valor > 0) {
      composicao[comp.name] = valor / 100; // Converter % para fração
    }
  });
  
  return composicao;
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
  
  const composicao = converterComposicaoParaValidacao(components);
  const limites = obterLimitesCriterios();
  
  // Verificar metano mínimo (requisito básico para todos os critérios)
  const metano = composicao["Metano (C₁)"] || 0;
  const metanoMinimo = metano >= 0.60; // 60% mínimo
  
  // Verificar DETAIL
  const detailExcedidos = verificarCriterio(limites["DETAIL"], composicao, temperatura_C, pressao_kPa);
  
  // Verificar GROSS
  const grossExcedidos = verificarCriterio(limites["GROSS"], composicao, temperatura_C, pressao_kPa);
  
  // Lógica de seleção baseada nos resultados
  if (!metanoMinimo) {
    return criarResultado('GERG-2008', 'GERG-2008 (Metano < 60%)', ['Metano abaixo do mínimo de 60% molar'], false, temperatura_C, pressao_kPa, 70000, metanoMinimo);
  }
  
  if (detailExcedidos.length === 0) {
    return criarResultado('DETAIL', 'AGA-8 DETAIL (Range A)', [], true, temperatura_C, pressao_kPa, 10342, metanoMinimo);
  } else if (grossExcedidos.length === 0) {
    return criarResultado('GROSS', 'AGA-8 GROSS Method', detailExcedidos, true, temperatura_C, pressao_kPa, 20684, metanoMinimo);
  } else {
    const todosMotivos = [...new Set([...detailExcedidos, ...grossExcedidos])];
    return criarResultado('GERG-2008', 'GERG-2008 (Fora dos limites AGA-8)', todosMotivos, false, temperatura_C, pressao_kPa, 70000, metanoMinimo);
  }
}

/**
 * Verifica se uma composição atende aos critérios de um modelo específico
 */
function verificarCriterio(
  limites: AGA8CriteriaLimits,
  composicao: Record<string, number>,
  temperatura_C: number,
  pressao_kPa: number
): string[] {
  
  const excedidos: string[] = [];
  
  // Verificar condições de processo
  if (temperatura_C < limites.temperatura_min_C || 
      temperatura_C > limites.temperatura_max_C || 
      pressao_kPa > limites.pressao_max_kpa) {
    excedidos.push("condições de processo");
  }
  
  // Verificar limites de composição
  for (const [componente, limite] of Object.entries(limites.componentes)) {
    const valor = composicao[componente] || 0;
    if (valor > limite) {
      excedidos.push(componente);
    }
  }
  
  return excedidos;
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
  switch (resultado.modelo) {
    case 'DETAIL':
      return '0 a 10.3 MPa (AGA-8 DETAIL)';
    case 'GROSS':
      return '0 a 20.7 MPa (AGA-8 GROSS)';
    case 'GERG-2008':
      return '0 a 70 MPa (GERG-2008)';
    default:
      return '0 a 70 MPa (Padrão)';
  }
}

function gerarDescricaoFaixaTemperatura(resultado: AGA8CriteriaResult): string {
  switch (resultado.modelo) {
    case 'DETAIL':
    case 'GROSS':
      return '-4°C a 62°C (AGA-8)';
    case 'GERG-2008':
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
  
  if (resultado.modelo === 'DETAIL' && temComposicaoCompleta) {
    return 'Detalhado (AGA-8 DETAIL)';
  } else if (resultado.modelo === 'GROSS' || (pcs > 0 && densidade > 0)) {
    return 'Gross Method (AGA-8 GROSS)';
  } else if (resultado.modelo === 'GERG-2008') {
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
  console.log('📊 Modelo Selecionado:', resultado.modelo);
  console.log('📋 Critério:', resultado.criterio);
  console.log('✅ Válido:', resultado.isValid);
  
  if (resultado.motivosExcedidos.length > 0) {
    console.log('⚠️ Motivos para não usar DETAIL/GROSS:', resultado.motivosExcedidos);
  }
  
  console.log('🌡️ Temperatura:', temperatura, '°C');
  console.log('💨 Pressão:', pressao, 'kPa');
  console.log('📈 Status detalhado:', resultado.detalhes);
  console.groupEnd();
}

function criarResultado(
  modelo: 'DETAIL' | 'GROSS' | 'GERG-2008',
  criterio: string,
  motivos: string[],
  isValid: boolean,
  temperatura: number,
  pressao: number,
  pressaoMax: number,
  metanoMinimo: boolean
): AGA8CriteriaResult {
  return {
    modelo,
    criterio,
    motivosExcedidos: motivos,
    isValid,
    detalhes: {
      pressaoStatus: pressao <= pressaoMax,
      temperaturaStatus: temperatura >= -4 && temperatura <= 62,
      composicaoStatus: isValid,
      metanoMinimo
    }
  };
} 