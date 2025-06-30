import { GasQuality, determineGasQuality } from './gas-quality-classifier';
import { validateOperationalRange } from '../constants/operational-ranges';

export enum ValidationMethod {
  AGA8_DETAIL = 'AGA-8 DETAIL',
  AGA8_GROSS = 'AGA-8 GROSS', 
  GERG2008 = 'GERG-2008'
}

export interface ValidationCriteria {
  method: ValidationMethod;
  reason: string;
  gasQuality: GasQuality;
  operationalRange: 'normal' | 'extended';
  isValid: boolean;
}

interface ComponentData {
  name: string;
  molarPercent: string;
}

// ✅ SELEÇÃO AUTOMÁTICA - Seleção automática de método
export function determineValidationMethod(
  components: ComponentData[],
  temperature: number, // K
  pressure: number     // kPa
): ValidationCriteria {
  
  const gasQuality = determineGasQuality(components);
  const normalRange = validateOperationalRange(pressure, temperature, 'normal');
  const extendedRange = validateOperationalRange(pressure, temperature, 'extended');
  
  // Se fora de especificação, usar GERG-2008
  if (gasQuality === GasQuality.OutOfSpecification) {
    return {
      method: ValidationMethod.GERG2008,
      reason: 'Composição fora das especificações AGA-8, aplicando GERG-2008',
      gasQuality,
      operationalRange: extendedRange.isValid ? 'extended' : 'normal',
      isValid: extendedRange.isValid
    };
  }
  
  // Se qualidade intermediária, usar GERG-2008
  if (gasQuality === GasQuality.Intermediate) {
    return {
      method: ValidationMethod.GERG2008,
      reason: 'Qualidade intermediária detectada, aplicando GERG-2008',
      gasQuality,
      operationalRange: extendedRange.isValid ? 'extended' : 'normal',
      isValid: extendedRange.isValid
    };
  }
  
  // Para Pipeline Quality, verificar faixas operacionais
  if (normalRange.isValid) {
    // Dentro da faixa normal, verificar critérios DETAIL
    if (isDetailMethodApplicable(components, temperature, pressure)) {
      return {
        method: ValidationMethod.AGA8_DETAIL,
        reason: 'Pipeline Quality dentro dos critérios AGA-8 DETAIL',
        gasQuality,
        operationalRange: 'normal',
        isValid: true
      };
    } else {
      return {
        method: ValidationMethod.AGA8_GROSS,
        reason: 'Pipeline Quality dentro dos critérios AGA-8 GROSS',
        gasQuality,
        operationalRange: 'normal', 
        isValid: true
      };
    }
  }
  
  // Fora da faixa normal mas dentro da estendida
  if (extendedRange.isValid) {
    return {
      method: ValidationMethod.GERG2008,
      reason: 'Condições operacionais na faixa estendida, aplicando GERG-2008',
      gasQuality,
      operationalRange: 'extended',
      isValid: true
    };
  }
  
  // Fora de todas as faixas
  return {
    method: ValidationMethod.GERG2008,
    reason: 'Condições operacionais fora das faixas normativas',
    gasQuality,
    operationalRange: 'extended',
    isValid: false
  };
}

// ✅ CRITÉRIOS DETAIL - Critérios específicos DETAIL Method
function isDetailMethodApplicable(
  components: ComponentData[],
  temperature: number, // K  
  pressure: number     // kPa
): boolean {
  
  // Limites de pressão DETAIL: 0 - 10.342 kPa
  if (pressure > 10342) return false;
  
  // Limites de temperatura DETAIL: 269-335 K (-4°C a 62°C)
  if (temperature < 269 || temperature > 335) return false;
  
  // Verificar componentes críticos específicos DETAIL
  const methane = components.find(c => c.name === 'CH4');
  if (methane && parseFloat(methane.molarPercent) < 60) return false;
  
  return true;
}

 