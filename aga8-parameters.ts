/**
 * AGA-8 Critical Parameters and Molar Masses
 * Based on Table A.1 - Critical Parameters and Molar Masses of the 21 Components
 * AGA Report No. 8, Part 1 - Third Edition, April 2017
 */

export interface AGA8CriticalParameters {
  molarMass: number;      // M/(g·mol⁻¹) - Molar mass
  dc: number;             // dc/(mol·dm⁻³) - Critical molar density  
  Tc: number;             // Tc/K - Critical temperature
}

/**
 * Critical parameters for all 21 AGA-8 components
 * Using exact component names from the existing system for compatibility
 */
export const AGA8_CRITICAL_PARAMETERS: Record<string, AGA8CriticalParameters> = {
  // Hydrocarbons - Main components
  'Metano (C₁)': {
    molarMass: 16.04246,
    dc: 10.13954,
    Tc: 190.564
  },
  'Etano (C₂)': {
    molarMass: 30.06904,
    dc: 6.87085,
    Tc: 305.322
  },
  'Propano (C₃)': {
    molarMass: 44.09562,
    dc: 5.00004,
    Tc: 369.825
  },
  
  // Butanes
  'i-Butano (iC₄)': {
    molarMass: 58.12222,
    dc: 3.86014,
    Tc: 407.817
  },
  'n-Butano (nC₄)': {
    molarMass: 58.12222,
    dc: 3.92001,
    Tc: 425.125
  },
  
  // Pentanes
  'i-Pentano (iC₅)': {
    molarMass: 72.14878,
    dc: 3.271,
    Tc: 460.35
  },
  'n-Pentano (nC₅)': {
    molarMass: 72.14878,
    dc: 3.21558,
    Tc: 469.7
  },
  
  // Heavy hydrocarbons (C6+)
  'Hexano (C₆)': {
    molarMass: 86.17536,
    dc: 2.70588,
    Tc: 507.82
  },
  'Heptano (C₇)': {
    molarMass: 100.20194,
    dc: 2.31532,
    Tc: 540.13
  },
  'Octano (C₈)': {
    molarMass: 114.22852,
    dc: 2.05640,
    Tc: 569.32
  },
  'Nonano (C₉)': {
    molarMass: 128.25510,
    dc: 1.81,
    Tc: 594.55
  },
  'Decano (C₁₀)': {
    molarMass: 142.28168,
    dc: 1.64,
    Tc: 617.7
  },
  
  // Non-hydrocarbon gases
  'Nitrogênio (N₂)': {
    molarMass: 28.01340,
    dc: 11.1839,
    Tc: 126.192
  },
  'Dióxido de Carbono (CO₂)': {
    molarMass: 44.00950,
    dc: 10.62498,
    Tc: 304.1282
  },
  'Sulfeto de Hidrogênio (H₂S)': {
    molarMass: 34.08088,
    dc: 10.19,
    Tc: 373.1
  },
  'Oxigênio (O₂)': {
    molarMass: 31.99880,
    dc: 13.63,
    Tc: 154.595
  },
  
  // Special components
  'Água (H₂O)': {
    molarMass: 18.01528,
    dc: 17.87372,
    Tc: 647.096
  },
  'Monóxido de Carbono (CO)': {
    molarMass: 28.01010,
    dc: 10.85,
    Tc: 132.86
  }
};

/**
 * Utility function to get critical parameters for a component
 * Includes validation to ensure component exists
 */
export function getCriticalParameters(componentName: string): AGA8CriticalParameters | null {
  const params = AGA8_CRITICAL_PARAMETERS[componentName];
  if (!params) {
    console.warn(`Critical parameters not found for component: ${componentName}`);
    return null;
  }
  return params;
}

/**
 * Utility function to get molar mass for a component
 * Backward compatibility with existing molar mass calculations
 */
export function getComponentMolarMass(componentName: string): number {
  const params = getCriticalParameters(componentName);
  return params ? params.molarMass : 0;
}

/**
 * Utility function to get all component names that have critical parameters
 */
export function getAvailableComponents(): string[] {
  return Object.keys(AGA8_CRITICAL_PARAMETERS);
}

/**
 * Utility function to validate if all components in a list have critical parameters
 */
export function validateComponentsHaveCriticalParameters(componentNames: string[]): {
  valid: boolean;
  missingComponents: string[];
} {
  const missing = componentNames.filter(name => !AGA8_CRITICAL_PARAMETERS[name]);
  return {
    valid: missing.length === 0,
    missingComponents: missing
  };
} 