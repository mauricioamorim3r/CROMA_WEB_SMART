// ✅ NOVOS LIMITES - Limites corretos conforme AGA-8 Part 2 Tabela 5
export const AGA8_PIPELINE_QUALITY_LIMITS = {
  // Componente 1: Metano
  CH4: { min: 70.0, max: 100.0 },   // % molar
  
  // Componente 2: Nitrogênio  
  N2: { min: 0.0, max: 20.0 },      // % molar
  
  // Componente 3: Dióxido de carbono
  CO2: { min: 0.0, max: 20.0 },     // % molar
  
  // Componente 4: Etano
  C2H6: { min: 0.0, max: 10.0 },    // % molar
  
  // Componente 5: Propano
  C3H8: { min: 0.0, max: 3.5 },     // % molar
  
  // Componentes 6+7: Isobutano + n-Butano
  iC4H10: { min: 0.0, max: 1.5 },   // % molar (soma total C4)
  nC4H10: { min: 0.0, max: 1.5 },   // % molar (soma total C4)
  
  // Componentes 8+9: Isopentano + n-Pentano  
  iC5H12: { min: 0.0, max: 0.5 },   // % molar (soma total C5)
  nC5H12: { min: 0.0, max: 0.5 },   // % molar (soma total C5)
  
  // Componente 10: n-Hexano
  nC6H14: { min: 0.0, max: 0.15 },   // % molar (conforme AGA-8 Part 2)
  
  // Componente 11: n-Heptano
  nC7H16: { min: 0.0, max: 0.05 },  // % molar
  
  // Componentes 12+13+14: Octano + Nonano + Decano
  C8_plus: { min: 0.0, max: 0.05 }, // % molar
  
  // Componente 15: Hidrogênio
  H2: { min: 0.0, max: 10.0 },      // % molar
  
  // Componente 16: Oxigênio
  O2: { min: 0.0, max: 0.02 },      // % molar
  
  // Componente 17: Monóxido de carbono  
  CO: { min: 0.0, max: 3.0 },       // % molar
  
  // Componente 18: Água
  H2O: { min: 0.0, max: 0.015 },    // % molar
  
  // Componente 19: Sulfeto de hidrogênio
  H2S: { min: 0.0, max: 0.02 },     // % molar
  
  // Componente 20: Hélio
  He: { min: 0.0, max: 0.5 },       // % molar
  
  // Componente 21: Argônio
  Ar: { min: 0.0, max: 0.02 }       // % molar
};

export const AGA8_INTERMEDIATE_QUALITY_LIMITS = {
  CH4: { min: 30.0, max: 100.0 },   // % molar
  N2: { min: 0.0, max: 55.0 },      // % molar
  CO2: { min: 0.0, max: 30.0 },     // % molar
  C2H6: { min: 0.0, max: 25.0 },    // % molar
  C3H8: { min: 0.0, max: 14.0 },    // % molar
  iC4H10: { min: 0.0, max: 6.0 },   // % molar
  nC4H10: { min: 0.0, max: 6.0 },   // % molar
  iC5H12: { min: 0.0, max: 0.5 },   // % molar (mantido igual pipeline)
  nC5H12: { min: 0.0, max: 0.5 },   // % molar (mantido igual pipeline)
  nC6H14: { min: 0.0, max: 0.2 },   // % molar
  nC7H16: { min: 0.0, max: 0.1 },   // % molar
  C8_plus: { min: 0.0, max: 0.05 }, // % molar (mantido igual pipeline)
  H2: { min: 0.0, max: 40.0 },      // % molar
  O2: { min: 0.0, max: 2.0 },       // % molar
  CO: { min: 0.0, max: 13.0 },      // % molar
  H2O: { min: 0.0, max: 0.02 },     // % molar
  H2S: { min: 0.0, max: 27.0 },     // % molar
  He: { min: 0.0, max: 0.5 },       // % molar (mantido igual pipeline)
  Ar: { min: 0.0, max: 0.05 }       // % molar
}; 