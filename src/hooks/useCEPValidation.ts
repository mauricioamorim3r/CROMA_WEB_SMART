/**
 * Hook Simplificado para Validação CEP
 * Baseado no material de referência, mas otimizado para integração rápida
 */

import { useState, useEffect, useCallback } from 'react';
import { ComponentData, SampleProperty, ValidationStatus } from '../../types';

interface CEPStatistics {
  mean: number;
  lowerControlLimit: number;
  upperControlLimit: number;
  sampleCount: number;
}

interface CEPValidationResult {
  componentName: string;
  currentValue: number;
  statistics: CEPStatistics;
  status: ValidationStatus;
}

interface CEPHistoricalSample {
  id: string;
  boletimNumber: string;
  date: string;
  components: Record<string, number>;
  properties: Record<string, number>;
}

const CEP_STORAGE_KEY = 'cep_historical_samples';
const MAX_SAMPLES = 8; // Últimas 8 amostras para cálculo
const D2_FACTOR = 1.128; // Fator para n=2 observações

// Função para normalizar valores de entrada (lida com vírgula e ponto decimal)
const normalizeNumericValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  
  // Substituir vírgula por ponto e remover espaços
  const normalized = value.replace(',', '.').trim();
  const parsed = parseFloat(normalized);
  
  return isNaN(parsed) ? 0 : parsed;
};

// Componentes monitorados (principais do gás natural)
const MONITORED_COMPONENTS = [
  'Metano (C₁)', 'Etano (C₂)', 'Propano (C₃)', 'i-Butano (iC₄)', 'n-Butano (nC₄)',
  'Dióxido de Carbono (CO₂)', 'Nitrogênio (N₂)'
];

export const useCEPValidation = (
  components: ComponentData[],
  properties: SampleProperty[],
  boletimNumber: string
) => {
  const [componentResults, setComponentResults] = useState<CEPValidationResult[]>([]);
  const [propertyResults, setPropertyResults] = useState<CEPValidationResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<ValidationStatus>(ValidationStatus.Pendente);
  const [isValidating, setIsValidating] = useState(false);

  // Carregar histórico do localStorage
  const loadHistoricalData = useCallback((): CEPHistoricalSample[] => {
    try {
      const stored = localStorage.getItem(CEP_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Salvar no histórico
  const saveToHistory = useCallback((newSample: CEPHistoricalSample) => {
    try {
      const existing = loadHistoricalData();
      const updated = [newSample, ...existing].slice(0, MAX_SAMPLES * 2); // Manter mais para rotatividade
      localStorage.setItem(CEP_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Erro ao salvar histórico CEP:', error);
    }
  }, [loadHistoricalData]);

  // Calcular estatísticas CEP
  const calculateCEPStatistics = useCallback((historicalValues: number[]): CEPStatistics => {
    if (historicalValues.length < 2) {
      return {
        mean: 0,
        lowerControlLimit: 0,
        upperControlLimit: 0,
        sampleCount: 0
      };
    }

    // Pegar últimas 8 amostras e garantir que estão em formato percentual (0-100)
    const recentValues = historicalValues.slice(0, MAX_SAMPLES).map(val => {
      // Se valor está entre 0-1, converter para percentual
      return val < 1 ? val * 100 : val;
    });
    
    const mean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;

    // Calcular amplitudes móveis
    const mobileRanges: number[] = [];
    for (let i = 1; i < recentValues.length; i++) {
      mobileRanges.push(Math.abs(recentValues[i] - recentValues[i - 1]));
    }

    const mobileRangeMean = mobileRanges.length > 0 
      ? mobileRanges.reduce((sum, range) => sum + range, 0) / mobileRanges.length 
      : 0;

    // Limites de controle: LCS = x̄ + 3(MR̄/d₂), LCI = x̄ - 3(MR̄/d₂)
    const controlFactor = 3 * (mobileRangeMean / D2_FACTOR);
    const upperControlLimit = mean + controlFactor;
    const lowerControlLimit = Math.max(0, mean - controlFactor);

    return {
      mean,
      lowerControlLimit,
      upperControlLimit,
      sampleCount: recentValues.length
    };
  }, []);

  // Validar componente individual
  const validateComponent = useCallback((component: ComponentData): CEPValidationResult => {
    const historicalData = loadHistoricalData();
    const historicalValues = historicalData
      .map(sample => sample.components[component.name])
      .filter(val => val !== undefined && val > 0);

    const currentValue = normalizeNumericValue(component.molarPercent);
    const statistics = calculateCEPStatistics(historicalValues);

    let status = ValidationStatus.Pendente;
    if (statistics.sampleCount >= 2 && currentValue > 0) {
      const withinLimits = currentValue >= statistics.lowerControlLimit && 
                          currentValue <= statistics.upperControlLimit;
      status = withinLimits ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa;
    }

    return {
      componentName: component.name,
      currentValue,
      statistics,
      status
    };
  }, [loadHistoricalData, calculateCEPStatistics]);

  // Validar propriedade individual
  const validateProperty = useCallback((property: SampleProperty): CEPValidationResult => {
    const historicalData = loadHistoricalData();
    const historicalValues = historicalData
      .map(sample => sample.properties[property.id])
      .filter(val => val !== undefined && val > 0);

    const currentValue = parseFloat(property.value) || 0;
    const statistics = calculateCEPStatistics(historicalValues);

    let status = ValidationStatus.Pendente;
    if (statistics.sampleCount >= 2) {
      const withinLimits = currentValue >= statistics.lowerControlLimit && 
                          currentValue <= statistics.upperControlLimit;
      status = withinLimits ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa;
    }

    return {
      componentName: property.name,
      currentValue,
      statistics,
      status
    };
  }, [loadHistoricalData, calculateCEPStatistics]);

  // Executar validação completa
  const runValidation = useCallback(async () => {
    setIsValidating(true);
    
    try {
      // Validar componentes monitorados
      const compResults = components
        .filter(comp => MONITORED_COMPONENTS.includes(comp.name))
        .map(validateComponent);
      setComponentResults(compResults);

      // Validar propriedades principais (fator compressibilidade, massa específica, massa molar)
      const mainProperties = properties.filter(prop => 
        ['compressibilityFactor', 'specificMass', 'molarMass'].includes(prop.id)
      );
      const propResults = mainProperties.map(validateProperty);
      setPropertyResults(propResults);

      // Determinar status geral
      const allResults = [...compResults, ...propResults];
      const hasOutOfLimits = allResults.some(r => r.status === ValidationStatus.ForaDaFaixa);
      const hasPending = allResults.some(r => r.status === ValidationStatus.Pendente);

      if (hasOutOfLimits) {
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
  }, [components, properties, validateComponent, validateProperty]);

  // Adicionar amostra atual ao histórico
  const addCurrentSampleToHistory = useCallback(() => {
    if (!boletimNumber || components.length === 0) return;

    const newSample: CEPHistoricalSample = {
      id: `${boletimNumber}_${Date.now()}`,
      boletimNumber,
      date: new Date().toISOString(),
      components: components.reduce((acc, comp) => {
        acc[comp.name] = parseFloat(comp.molarPercent) || 0;
        return acc;
      }, {} as Record<string, number>),
      properties: properties.reduce((acc, prop) => {
        acc[prop.id] = parseFloat(prop.value) || 0;
        return acc;
      }, {} as Record<string, number>)
    };

    saveToHistory(newSample);
  }, [boletimNumber, components, properties, saveToHistory]);

  // Limpar histórico
  const clearHistory = useCallback(() => {
    localStorage.removeItem(CEP_STORAGE_KEY);
    setComponentResults([]);
    setPropertyResults([]);
    setOverallStatus(ValidationStatus.Pendente);
  }, []);

  // Auto-validação quando dados mudam
  useEffect(() => {
    if (components.length > 0) {
      const timer = setTimeout(runValidation, 1000); // Debounce de 1s
      return () => clearTimeout(timer);
    }
  }, [components, properties, runValidation]);

  return {
    componentResults,
    propertyResults,
    overallStatus,
    isValidating,
    runValidation,
    addCurrentSampleToHistory,
    clearHistory,
    historicalSamplesCount: loadHistoricalData().length
  };
}; 