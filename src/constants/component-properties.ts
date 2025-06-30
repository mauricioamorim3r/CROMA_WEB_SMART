// ✅ MASSAS MOLARES - Massas molares conforme Tabela A.1 AGA-8 Part 2
export const COMPONENT_MOLAR_MASSES = {
  // Hidrocarbonetos
  'CH4': 16.04246,      // Metano
  'C2H6': 30.06904,     // Etano  
  'C3H8': 44.09562,     // Propano
  'iC4H10': 58.1222,    // Isobutano
  'nC4H10': 58.1222,    // n-Butano
  'iC5H12': 72.14878,   // Isopentano
  'nC5H12': 72.14878,   // n-Pentano
  'nC6H14': 86.17536,   // n-Hexano
  'nC7H16': 100.20194,  // n-Heptano
  'nC8H18': 114.22852,  // n-Octano
  'nC9H20': 128.2551,   // n-Nonano
  'nC10H22': 142.28168, // n-Decano
  
  // Não-hidrocarbonetos
  'N2': 28.0134,        // Nitrogênio
  'CO2': 44.0095,       // Dióxido de carbono
  'H2': 2.01588,        // Hidrogênio
  'O2': 31.9988,        // Oxigênio
  'CO': 28.0101,        // Monóxido de carbono
  'H2O': 18.01528,      // Água
  'H2S': 34.08088,      // Sulfeto de hidrogênio
  'He': 4.002602,       // Hélio
  'Ar': 39.948          // Argônio
};

// ✅ MASSA MOLAR AR - Massa molar do ar seco conforme AGA-8 Part 2
export const AIR_MOLAR_MASS = 28.9625; // g/mol (anteriormente era 28.9647) 