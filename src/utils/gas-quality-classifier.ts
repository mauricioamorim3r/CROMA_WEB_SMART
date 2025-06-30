import { AGA8_PIPELINE_QUALITY_LIMITS, AGA8_INTERMEDIATE_QUALITY_LIMITS } from '../constants/aga8-limits';

export enum GasQuality {
  Pipeline = 'Pipeline Quality',
  Intermediate = 'Intermediate Quality',
  OutOfSpecification = 'Out of Specification'
}

export interface ComponentData {
  name: string;
  molarPercent: string;
}

// ✅ FUNÇÃO PRINCIPAL - Função principal de classificação
export function determineGasQuality(components: ComponentData[]): GasQuality {
  if (isPipelineQuality(components)) {
    return GasQuality.Pipeline;
  }
  
  if (isIntermediateQuality(components)) {
    return GasQuality.Intermediate;
  }
  
  return GasQuality.OutOfSpecification;
}

// ✅ VALIDAÇÃO PIPELINE - Validação Pipeline Quality
function isPipelineQuality(components: ComponentData[]): boolean {
  return components.every(component => {
    const limits = (AGA8_PIPELINE_QUALITY_LIMITS as any)[component.name];
    if (!limits) return true; // Se não tem limite definido, passa
    
    const value = parseFloat(component.molarPercent);
    return value >= limits.min && value <= limits.max;
  });
}

// ✅ VALIDAÇÃO INTERMEDIATE - Validação Intermediate Quality  
function isIntermediateQuality(components: ComponentData[]): boolean {
  return components.every(component => {
    const limits = (AGA8_INTERMEDIATE_QUALITY_LIMITS as any)[component.name];
    if (!limits) return true; // Se não tem limite definido, passa
    
    const value = parseFloat(component.molarPercent);
    return value >= limits.min && value <= limits.max;
  });
}



// ✅ DETALHES DE VALIDAÇÃO - Obter detalhes da validação
export function getQualityValidationDetails(components: ComponentData[]) {
  const pipelineResult = isPipelineQuality(components);
  const intermediateResult = isIntermediateQuality(components);
  
  const violations = {
    pipeline: [] as string[],
    intermediate: [] as string[]
  };
  
  // Verificar violações pipeline
  components.forEach(component => {
    const pipelineLimits = (AGA8_PIPELINE_QUALITY_LIMITS as any)[component.name];
    if (pipelineLimits) {
      const value = parseFloat(component.molarPercent);
      if (value < pipelineLimits.min || value > pipelineLimits.max) {
        violations.pipeline.push(
          `${component.name}: ${value}% (limite: ${pipelineLimits.min}-${pipelineLimits.max}%)`
        );
      }
    }
  });
  
  // Verificar violações intermediate
  components.forEach(component => {
    const intermediateLimits = (AGA8_INTERMEDIATE_QUALITY_LIMITS as any)[component.name];
    if (intermediateLimits) {
      const value = parseFloat(component.molarPercent);
      if (value < intermediateLimits.min || value > intermediateLimits.max) {
        violations.intermediate.push(
          `${component.name}: ${value}% (limite: ${intermediateLimits.min}-${intermediateLimits.max}%)`
        );
      }
    }
  });
  
  return {
    quality: determineGasQuality(components),
    pipelineCompliant: pipelineResult,
    intermediateCompliant: intermediateResult,
    violations
  };
} 