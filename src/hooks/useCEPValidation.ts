/**
 * Hook Otimizado para Validação CEP
 * Interface compatível com App.tsx - incluindo validação de múltiplos componentes e propriedades
 */

import { useState, useCallback } from 'react';
import { ComponentData, SampleProperty, ValidationStatus } from '../../types';
import { CEPHistoricalSample } from '../../types';

interface CEPComponentResult {
  componentName: string;
  status: ValidationStatus;
  currentValue: number;
  statistics: {
    mean: number;
    lowerControlLimit: number;
    upperControlLimit: number;
    sampleCount: number;
    standardDeviation: number;
  };
  violations: string[];
}

interface CEPPropertyResult {
  componentName: string;
  status: ValidationStatus;
  currentValue: number;
  statistics: {
    mean: number;
    lowerControlLimit: number;
    upperControlLimit: number;
    sampleCount: number;
    standardDeviation: number;
  };
  violations: string[];
}

export const useCEPValidation = (
  components: ComponentData[], 
  properties: SampleProperty[], 
  boletimNumber: string
) => {
  // ============================================================================
  // CONFIGURAÇÕES CEP - JANELA DESLIZANTE DINÂMICA
  // ============================================================================
  const CEP_STORAGE_KEY = 'cep_historical_samples';
  const CEP_MAX_HISTORY = 20;        // Total de amostras armazenadas (backup)
  const CEP_CALCULATION_WINDOW = 8;  // Amostras usadas no cálculo CEP (janela deslizante)
  
  // ⚠️  IMPORTANTE: A cada nova amostra salva:
  // - Nova amostra entra na posição [0] (mais recente)
  // - Apenas as primeiras 8 amostras [0-7] são usadas no cálculo CEP
  // - Amostra mais antiga (posição [8+]) sai da janela de cálculo 
  // - Estatísticas CEP (LCI/LCS) são recalculadas automaticamente
  // ============================================================================

  const [componentResults, setComponentResults] = useState<CEPComponentResult[]>([]);
  const [propertyResults, setPropertyResults] = useState<CEPPropertyResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<ValidationStatus>(ValidationStatus.Pendente);
  const [isValidating, setIsValidating] = useState(false);

  // Função para obter amostras históricas
  const getHistoricalSamples = useCallback((): CEPHistoricalSample[] => {
    try {
      const stored = localStorage.getItem(CEP_STORAGE_KEY);
      if (!stored) return [];
      
      const samples = JSON.parse(stored) as CEPHistoricalSample[];
      return samples.sort((a, b) => 
        new Date(b.dataValidacao).getTime() - new Date(a.dataValidacao).getTime()
      );
    } catch (error) {
      console.error('Erro ao carregar histórico CEP:', error);
      return [];
    }
  }, []);

  // Função para salvar nova amostra no histórico (JANELA DESLIZANTE)
  const saveHistoricalSample = useCallback((sample: CEPHistoricalSample): void => {
    try {
      const existing = getHistoricalSamples();
      // 🔄 LÓGICA DINÂMICA: Nova amostra entra em [0], mantém backup de 20
      const updated = [sample, ...existing.slice(0, CEP_MAX_HISTORY - 1)];
      localStorage.setItem(CEP_STORAGE_KEY, JSON.stringify(updated));
      
      console.log(`📊 CEP: Nova amostra adicionada. Total: ${updated.length}, Janela cálculo: ${Math.min(updated.length, CEP_CALCULATION_WINDOW)}`);
    } catch (error) {
      console.error('Erro ao salvar amostra CEP:', error);
    }
  }, [getHistoricalSamples]);

  // Mapear nome químico para nome do componente
  const mapComponentName = useCallback((componentName: string): string => {
    const mapping: Record<string, string> = {
      'CH4': 'Metano (C₁)',
      'C2H6': 'Etano (C₂)', 
      'C3H8': 'Propano (C₃)',
      'iC4H10': 'i-Butano (iC₄)',
      'nC4H10': 'n-Butano (nC₄)',
      'iC5H12': 'i-Pentano (iC₅)',
      'nC5H12': 'n-Pentano (nC₅)',
      'C6H14': 'Hexano (C₆)',
      'C7H16': 'Heptano (C₇)',
      'C8H18': 'Octano (C₈)',
      'C9H20': 'Nonano (C₉)',
      'C10H22': 'Decano (C₁₀)',
      'O2': 'Oxigênio (O₂)',
      'N2': 'Nitrogênio (N₂)',
      'CO2': 'Dióxido de Carbono (CO₂)'
    };
    return mapping[componentName] || componentName;
  }, []);

  // Mapear nome da propriedade
  const mapPropertyName = useCallback((propertyName: string): string => {
    const mapping: Record<string, string> = {
      'compressibilityFactor': 'Fator de Compressibilidade',
      'relativeDensity': 'Massa Específica',
      'molarMass': 'Massa Molecular'
    };
    return mapping[propertyName] || propertyName;
  }, []);

  // Calcular estatísticas CEP para um componente/propriedade
  const calculateCEPStatistics = useCallback((
    currentValue: number,
    historicalValues: number[]
  ) => {
    if (historicalValues.length < 2) {
      return {
        mean: currentValue,
        lowerControlLimit: 0,
        upperControlLimit: currentValue * 2,
        sampleCount: 1,
        standardDeviation: 0,
        status: ValidationStatus.Pendente as ValidationStatus,
        violations: ['Dados insuficientes para CEP (mínimo 2 amostras)']
      };
    }

    // Calcular média
    const allValues = [currentValue, ...historicalValues];
    const mean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;

    // Calcular amplitudes móveis
    const mobileRanges: number[] = [];
    for (let i = 1; i < allValues.length; i++) {
      mobileRanges.push(Math.abs(allValues[i] - allValues[i - 1]));
    }

    const mobileRangeMean = mobileRanges.length > 0 
      ? mobileRanges.reduce((sum, range) => sum + range, 0) / mobileRanges.length 
      : 0;

    // Limites de controle (método amplitude móvel)
    const controlFactor = 3 * (mobileRangeMean / 1.128);
    const upperControlLimit = mean + controlFactor;
    const lowerControlLimit = Math.max(0, mean - controlFactor);

    // Verificar status
    const violations: string[] = [];
    let status: ValidationStatus;

    if (currentValue < lowerControlLimit) {
      violations.push(`Valor ${currentValue.toFixed(4)} abaixo do LCI ${lowerControlLimit.toFixed(4)}`);
      status = ValidationStatus.ForaDaFaixa;
    } else if (currentValue > upperControlLimit) {
      violations.push(`Valor ${currentValue.toFixed(4)} acima do LCS ${upperControlLimit.toFixed(4)}`);
      status = ValidationStatus.ForaDaFaixa;
         } else {
       status = ValidationStatus.OK;
     }

    return {
      mean: Number(mean.toFixed(4)),
      lowerControlLimit: Number(lowerControlLimit.toFixed(4)),
      upperControlLimit: Number(upperControlLimit.toFixed(4)),
      sampleCount: allValues.length,
      standardDeviation: Number(mobileRangeMean.toFixed(4)),
      status,
      violations
    };
  }, []);

  // Validação CEP principal
  const runValidation = useCallback(() => {
    setIsValidating(true);

    try {
      const historicalSamples = getHistoricalSamples();

      // Validar componentes
      const newComponentResults: CEPComponentResult[] = [];
      for (const component of components) {
        const currentValue = parseFloat(component.molarPercent) || 0;
        if (currentValue > 0) {
          const mappedName = mapComponentName(component.name);
          
          // Buscar valores históricos (JANELA DESLIZANTE)
          const historicalValues = historicalSamples
            .map(sample => (sample.components as any)[mappedName])
            .filter(val => val > 0)
            .slice(0, CEP_CALCULATION_WINDOW); // Últimas N amostras da janela
          
          const stats = calculateCEPStatistics(currentValue, historicalValues);
          
          newComponentResults.push({
            componentName: component.name,
            status: stats.status,
            currentValue,
            statistics: {
              mean: stats.mean,
              lowerControlLimit: stats.lowerControlLimit,
              upperControlLimit: stats.upperControlLimit,
              sampleCount: stats.sampleCount,
              standardDeviation: stats.standardDeviation
            },
            violations: stats.violations
          });
        }
      }

      // Validar propriedades
      const newPropertyResults: CEPPropertyResult[] = [];
      for (const property of properties) {
        const currentValue = parseFloat(property.value) || 0;
        if (currentValue > 0) {
          const mappedName = mapPropertyName(property.id);
          
          // Buscar valores históricos (JANELA DESLIZANTE)
          const historicalValues = historicalSamples
            .map(sample => {
              switch (property.id) {
                case 'compressibilityFactor':
                  return sample.properties.fatorCompressibilidade;
                case 'relativeDensity':
                  return sample.properties.massaEspecifica;
                case 'molarMass':
                  return sample.properties.massaMolecular;
                default:
                  return 0;
              }
            })
            .filter(val => val > 0)
            .slice(0, CEP_CALCULATION_WINDOW); // Últimas N amostras da janela
          
          const stats = calculateCEPStatistics(currentValue, historicalValues);
          
          newPropertyResults.push({
            componentName: mappedName,
            status: stats.status,
            currentValue,
            statistics: {
              mean: stats.mean,
              lowerControlLimit: stats.lowerControlLimit,
              upperControlLimit: stats.upperControlLimit,
              sampleCount: stats.sampleCount,
              standardDeviation: stats.standardDeviation
            },
            violations: stats.violations
          });
        }
      }

      setComponentResults(newComponentResults);
      setPropertyResults(newPropertyResults);

      // Calcular status geral
      const allResults = [...newComponentResults, ...newPropertyResults];
      const hasViolations = allResults.some(result => result.status === ValidationStatus.ForaDaFaixa);
      const hasPending = allResults.some(result => result.status === ValidationStatus.Pendente);
      
      if (hasViolations) {
        setOverallStatus(ValidationStatus.ForaDaFaixa);
      } else if (hasPending) {
        setOverallStatus(ValidationStatus.Pendente);
             } else {
         setOverallStatus(ValidationStatus.OK);
       }

    } catch (error) {
      console.error('Erro na validação CEP:', error);
      setOverallStatus(ValidationStatus.ForaDaFaixa);
    } finally {
      setIsValidating(false);
    }
  }, [components, properties, getHistoricalSamples, mapComponentName, mapPropertyName, calculateCEPStatistics]);

  // Adicionar amostra atual ao histórico
  const addCurrentSampleToHistory = useCallback(() => {
    if (!boletimNumber) {
      console.warn('Número do boletim necessário para adicionar ao histórico CEP');
      return;
    }

    const newSample: CEPHistoricalSample = {
      id: Date.now().toString(),
      boletimNumber,
      dataColeta: new Date().toISOString().split('T')[0],
      dataEmissaoRelatorio: new Date().toISOString().split('T')[0],
      dataValidacao: new Date().toISOString().split('T')[0],
      components: {
        'Metano (C₁)': parseFloat(components.find(c => c.name === 'CH4')?.molarPercent || '0'),
        'Etano (C₂)': parseFloat(components.find(c => c.name === 'C2H6')?.molarPercent || '0'),
        'Propano (C₃)': parseFloat(components.find(c => c.name === 'C3H8')?.molarPercent || '0'),
        'i-Butano (iC₄)': parseFloat(components.find(c => c.name === 'iC4H10')?.molarPercent || '0'),
        'n-Butano (nC₄)': parseFloat(components.find(c => c.name === 'nC4H10')?.molarPercent || '0'),
        'i-Pentano (iC₅)': parseFloat(components.find(c => c.name === 'iC5H12')?.molarPercent || '0'),
        'n-Pentano (nC₅)': parseFloat(components.find(c => c.name === 'nC5H12')?.molarPercent || '0'),
        'Hexano (C₆)': parseFloat(components.find(c => c.name === 'C6H14')?.molarPercent || '0'),
        'Heptano (C₇)': parseFloat(components.find(c => c.name === 'C7H16')?.molarPercent || '0'),
        'Octano (C₈)': parseFloat(components.find(c => c.name === 'C8H18')?.molarPercent || '0'),
        'Nonano (C₉)': parseFloat(components.find(c => c.name === 'C9H20')?.molarPercent || '0'),
        'Decano (C₁₀)': parseFloat(components.find(c => c.name === 'C10H22')?.molarPercent || '0'),
        'Oxigênio (O₂)': parseFloat(components.find(c => c.name === 'O2')?.molarPercent || '0'),
        'Nitrogênio (N₂)': parseFloat(components.find(c => c.name === 'N2')?.molarPercent || '0'),
        'Dióxido de Carbono (CO₂)': parseFloat(components.find(c => c.name === 'CO2')?.molarPercent || '0'),
      },
      totalComposicao: components.reduce((sum, comp) => sum + (parseFloat(comp.molarPercent) || 0), 0),
      properties: {
        fatorCompressibilidade: parseFloat(properties.find(p => p.id === 'compressibilityFactor')?.value || '0'),
        massaEspecifica: parseFloat(properties.find(p => p.id === 'relativeDensity')?.value || '0'),
        massaMolecular: parseFloat(properties.find(p => p.id === 'molarMass')?.value || '0'),
        condicaoReferencia: '20°C/1 atm'
      },
      editHistory: []
    };

    saveHistoricalSample(newSample);
    console.log('✅ Amostra adicionada ao histórico CEP:', newSample.id);
    
    // Re-executar validação para atualizar estatísticas
    setTimeout(() => runValidation(), 500);
  }, [components, properties, boletimNumber, saveHistoricalSample, runValidation]);

  // Limpar histórico
  const clearHistory = useCallback(() => {
    localStorage.removeItem(CEP_STORAGE_KEY);
    setComponentResults([]);
    setPropertyResults([]);
    setOverallStatus(ValidationStatus.Pendente);
    console.log('🗑️ Histórico CEP limpo');
  }, []);

  return {
    componentResults,
    propertyResults,
    overallStatus,
    isValidating,
    runValidation,
    addCurrentSampleToHistory,
    clearHistory,
    getHistoricalSamples
  };
}; 