// ✅ FAIXAS OPERACIONAIS - Faixas operacionais conforme AGA-8 Part 2 Tabela 6
export const AGA8_OPERATIONAL_RANGES = {
  normal: {
    pressure: { 
      min: 0,        // kPa
      max: 35000,    // kPa (5.075 psia)
      unit: 'kPa'
    },
    temperature: { 
      min: 90,       // K (-183°C)
      max: 450,      // K (177°C)  
      unit: 'K'
    }
  },
  extended: {
    pressure: { 
      min: 0,        // kPa
      max: 70000,    // kPa (10.150 psia)
      unit: 'kPa'
    },
    temperature: { 
      min: 60,       // K (-213°C)
      max: 700,      // K (427°C)
      unit: 'K'
    }
  }
};

// Função para validar se está dentro das faixas
export function validateOperationalRange(
  pressure: number, 
  temperature: number, 
  range: 'normal' | 'extended' = 'normal'
) {
  const limits = AGA8_OPERATIONAL_RANGES[range];
  
  const pressureOK = pressure >= limits.pressure.min && pressure <= limits.pressure.max;
  const temperatureOK = temperature >= limits.temperature.min && temperature <= limits.temperature.max;
  
  return {
    isValid: pressureOK && temperatureOK,
    pressure: pressureOK,
    temperature: temperatureOK,
    range: range,
    warnings: [
      ...(!pressureOK ? [`Pressão ${pressure} kPa fora da faixa ${range}: ${limits.pressure.min}-${limits.pressure.max} kPa`] : []),
      ...(!temperatureOK ? [`Temperatura ${temperature} K fora da faixa ${range}: ${limits.temperature.min}-${limits.temperature.max} K`] : [])
    ]
  };
} 