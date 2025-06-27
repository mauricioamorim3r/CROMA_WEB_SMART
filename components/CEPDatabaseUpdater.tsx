import React from 'react';

// Dados históricos completos baseados na tabela fornecida pelo usuário
const historicalDataSets = {
  primary: [
    { dataColeta: "20/01/2019", boletim: "414.19 REV.00", metano: 99.046, etano: 0.086, propano: 0.009, isobutano: 0.002, nbutano: 0.003, isopentano: 0.000, npentano: 0.001, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.594, massaEspecifica: 0.677, massaMolar: 16.300 },
    { dataColeta: "13/04/2019", boletim: "414.19 REV.00", metano: 99.046, etano: 0.086, propano: 0.009, isobutano: 0.002, nbutano: 0.003, isopentano: 0.000, npentano: 0.001, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.611, massaEspecifica: 0.677, massaMolar: 16.300 },
    { dataColeta: "09/05/2019", boletim: "518.19 REV.00", metano: 99.053, etano: 0.085, propano: 0.009, isobutano: 0.001, nbutano: 0.003, isopentano: 0.000, npentano: 0.001, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.599, massaEspecifica: 0.677, massaMolar: 16.300 },
    { dataColeta: "05/06/2019", boletim: "592.19 REV.00", metano: 98.982, etano: 0.091, propano: 0.010, isobutano: 0.000, nbutano: 0.005, isopentano: 0.000, npentano: 0.001, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.602, massaEspecifica: 0.678, massaMolar: 16.300 },
    { dataColeta: "25/06/2019", boletim: "693.19 REV.00", metano: 98.333, etano: 0.081, propano: 0.008, isobutano: 0.000, nbutano: 0.004, isopentano: 0.000, npentano: 0.000, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.721, massaEspecifica: 0.679, massaMolar: 16.300 },
    { dataColeta: "23/07/2019", boletim: "777.19 REV.00", metano: 98.873, etano: 0.090, propano: 0.008, isobutano: 0.000, nbutano: 0.005, isopentano: 0.000, npentano: 0.000, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.770, massaEspecifica: 0.679, massaMolar: 16.300 },
    { dataColeta: "11/08/2019", boletim: "892.19 REV.00", metano: 98.772, etano: 0.088, propano: 0.009, isobutano: 0.004, nbutano: 0.002, isopentano: 0.001, npentano: 0.001, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.777, massaEspecifica: 0.679, massaMolar: 16.300 },
    { dataColeta: "05/09/2019", boletim: "944.19 REV.00", metano: 98.896, etano: 0.089, propano: 0.009, isobutano: 0.004, nbutano: 0.001, isopentano: 0.000, npentano: 0.000, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.783, massaEspecifica: 0.679, massaMolar: 16.300 },
    { dataColeta: "23/09/2019", boletim: "992.19 REV.00", metano: 98.216, etano: 0.081, propano: 0.008, isobutano: 0.002, nbutano: 0.004, isopentano: 0.000, npentano: 0.000, hexano: 0.000, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.750, massaEspecifica: 0.679, massaMolar: 16.300 },
    { dataColeta: "18/10/2019", boletim: "1074.19 REV.00", metano: 98.857, etano: 0.093, propano: 0.010, isobutano: 0.003, nbutano: 0.004, isopentano: 0.001, npentano: 0.001, hexano: 0.000, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.798, massaEspecifica: 0.679, massaMolar: 16.300 },
    { dataColeta: "11/11/2019", boletim: "1149.19 REV.00", metano: 98.846, etano: 0.085, propano: 0.009, isobutano: 0.003, nbutano: 0.004, isopentano: 0.000, npentano: 0.000, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.813, massaEspecifica: 0.680, massaMolar: 16.300 },
    { dataColeta: "11/12/2019", boletim: "1278.19 REV.00", metano: 98.853, etano: 0.089, propano: 0.009, isobutano: 0.003, nbutano: 0.004, isopentano: 0.001, npentano: 0.001, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.744, massaEspecifica: 0.679, massaMolar: 16.300 },
    { dataColeta: "09/01/2020", boletim: "1006.20 REV.00", metano: 98.899, etano: 0.089, propano: 0.000, isobutano: 0.003, nbutano: 0.004, isopentano: 0.000, npentano: 0.000, hexano: 0.000, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.748, massaEspecifica: 0.679, massaMolar: 16.300 },
    { dataColeta: "05/02/2020", boletim: "0156.20 REV.00", metano: 99.025, etano: 0.081, propano: 0.000, isobutano: 0.001, nbutano: 0.002, isopentano: 0.000, npentano: 0.000, hexano: 0.000, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.741, massaEspecifica: 0.678, massaMolar: 16.300 },
    { dataColeta: "16/11/2021", boletim: "0931.21 REV.00", metano: 97.815, etano: 0.265, propano: 0.119, isobutano: 0.000, nbutano: 0.000, isopentano: 0.000, npentano: 0.000, hexano: 0.000, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.849, massaEspecifica: 0.686, massaMolar: 16.478 }
  ],
  
  additional: [
    { dataColeta: "10/01/2022", boletim: "0113.22 REV.00", metano: 98.636, etano: 0.080, propano: 0.104, isobutano: 0.000, nbutano: 0.000, isopentano: 0.000, npentano: 0.000, hexano: 0.000, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.882, massaEspecifica: 0.682, massaMolar: 16.368 },
    { dataColeta: "08/02/2022", boletim: "0239.22 REV.00", metano: 98.502, etano: 0.082, propano: 0.150, isobutano: 0.001, nbutano: 0.002, isopentano: 0.001, npentano: 0.001, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.718, massaEspecifica: 0.682, massaMolar: 16.365 },
    { dataColeta: "07/03/2022", boletim: "0371.22 REV.00", metano: 98.636, etano: 0.081, propano: 0.048, isobutano: 0.000, nbutano: 0.007, isopentano: 0.000, npentano: 0.001, hexano: 0.003, heptano: 0.000, octano: 0.001, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.899, massaEspecifica: 0.682, massaMolar: 16.366 },
    { dataColeta: "04/04/2022", boletim: "0463.22 REV.00", metano: 98.401, etano: 0.082, propano: 0.118, isobutano: 0.001, nbutano: 0.004, isopentano: 0.000, npentano: 0.000, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.907, massaEspecifica: 0.685, massaMolar: 16.455 },
    { dataColeta: "30/04/2022", boletim: "0549.22 REV.00", metano: 98.642, etano: 0.077, propano: 0.081, isobutano: 0.000, nbutano: 0.003, isopentano: 0.000, npentano: 0.000, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.903, massaEspecifica: 0.682, massaMolar: 16.357 },
    { dataColeta: "24/05/2022", boletim: "0691.22 REV.00", metano: 98.521, etano: 0.080, propano: 0.092, isobutano: 0.004, nbutano: 0.013, isopentano: 0.008, npentano: 0.013, hexano: 0.024, heptano: 0.021, octano: 0.012, nonano: 0.003, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.929, massaEspecifica: 0.685, massaMolar: 16.442 },
    { dataColeta: "23/09/2022", boletim: "1232.22 REV.00", metano: 98.426, etano: 0.072, propano: 0.017, isobutano: 0.002, nbutano: 0.004, isopentano: 0.000, npentano: 0.002, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.724, massaEspecifica: 0.679, massaMolar: 16.306 },
    { dataColeta: "15/10/2022", boletim: "1315.22 REV.00", metano: 98.348, etano: 0.076, propano: 0.014, isobutano: 0.002, nbutano: 0.003, isopentano: 0.001, npentano: 0.002, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.888, massaEspecifica: 0.683, massaMolar: 16.389 },
    { dataColeta: "03/12/2022", boletim: "1412.22 REV.00", metano: 98.450, etano: 0.078, propano: 0.290, isobutano: 0.000, nbutano: 0.004, isopentano: 0.000, npentano: 0.000, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.913, massaEspecifica: 0.684, massaMolar: 16.415 },
    { dataColeta: "20/01/2023", boletim: "1115.23 REV.00", metano: 98.686, etano: 0.077, propano: 0.000, isobutano: 0.004, nbutano: 0.000, isopentano: 0.000, npentano: 0.001, hexano: 0.000, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.925, massaEspecifica: 0.681, massaMolar: 16.352 }
  ],
  
  recent: [
    { dataColeta: "19/02/2023", boletim: "0180.23 REV.00", metano: 98.445, etano: 0.081, propano: 0.155, isobutano: 0.004, nbutano: 0.006, isopentano: 0.000, npentano: 0.000, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 0.998, massaEspecifica: 0.684, massaMolar: 16.418 },
    { dataColeta: "13/03/2023", boletim: "0240.23 REV.00", metano: 98.554, etano: 0.078, propano: 0.001, isobutano: 0.002, nbutano: 0.004, isopentano: 0.000, npentano: 0.000, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.001, co2: 0.000, fatorCompressibilidade: 1.082, massaEspecifica: 0.683, massaMolar: 16.405 },
    { dataColeta: "10/04/2023", boletim: "0320.23 REV.00", metano: 98.367, etano: 0.082, propano: 0.001, isobutano: 0.002, nbutano: 0.005, isopentano: 0.001, npentano: 0.000, hexano: 0.000, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.790, massaEspecifica: 0.679, massaMolar: 16.319 },
    { dataColeta: "12/06/2023", boletim: "0460.23 REV.00", metano: 99.093, etano: 0.074, propano: 0.000, isobutano: 0.002, nbutano: 0.004, isopentano: 0.000, npentano: 0.000, hexano: 0.001, heptano: 0.000, octano: 0.000, nonano: 0.000, decano: 0.000, oxigenio: 0.000, nitrogenio: 0.000, co2: 0.000, fatorCompressibilidade: 0.586, massaEspecifica: 0.677, massaMolar: 16.222 },
    { dataColeta: "21/08/2023", boletim: "FT1/23-3176", metano: 98.321, etano: 0.083, propano: 0.357, isobutano: 0.003, nbutano: 0.007, isopentano: 0.002, npentano: 0.003, hexano: 0.004, heptano: 0.003, octano: 0.004, nonano: 0.003, decano: 0.000, oxigenio: 0.040, nitrogenio: 0.466, co2: 0.632, fatorCompressibilidade: 0.984, massaEspecifica: 0.704, massaMolar: 16.430 },
    { dataColeta: "03/12/2023", boletim: "FT1/23-10170", metano: 97.626, etano: 0.085, propano: 0.140, isobutano: 0.021, nbutano: 0.051, isopentano: 0.099, npentano: 0.219, hexano: 0.458, heptano: 0.162, octano: 0.117, nonano: 0.001, decano: 0.000, oxigenio: 0.011, nitrogenio: 0.605, co2: 0.665, fatorCompressibilidade: 0.710, massaEspecifica: 0.784, massaMolar: 17.031 },
    { dataColeta: "30/12/2023", boletim: "FT1/23-11278", metano: 98.101, etano: 0.086, propano: 0.615, isobutano: 0.002, nbutano: 0.009, isopentano: 0.003, npentano: 0.004, hexano: 0.011, heptano: 0.011, octano: 0.009, nonano: 0.002, decano: 0.000, oxigenio: 0.015, nitrogenio: 0.349, co2: 0.782, fatorCompressibilidade: 0.683, massaEspecifica: 0.791, massaMolar: 16.527 },
    { dataColeta: "23/01/2024", boletim: "FT1/24-11179", metano: 97.289, etano: 0.132, propano: 0.119, isobutano: 0.018, nbutano: 0.027, isopentano: 0.008, npentano: 0.013, hexano: 0.027, heptano: 0.032, octano: 0.014, nonano: 0.003, decano: 0.000, oxigenio: 0.020, nitrogenio: 1.313, co2: 0.784, fatorCompressibilidade: 0.691, massaEspecifica: 0.793, massaMolar: 16.586 },
    { dataColeta: "19/02/2024", boletim: "FT1/24-12101", metano: 97.151, etano: 0.160, propano: 0.594, isobutano: 0.026, nbutano: 0.075, isopentano: 0.040, npentano: 0.077, hexano: 0.170, heptano: 0.112, octano: 0.018, nonano: 0.001, decano: 0.000, oxigenio: 0.104, nitrogenio: 0.684, co2: 0.768, fatorCompressibilidade: 0.704, massaEspecifica: 0.791, massaMolar: 16.891 },
    { dataColeta: "17/03/2024", boletim: "FT1/24-13125", metano: 97.851, etano: 0.094, propano: 0.458, isobutano: 0.009, nbutano: 0.015, isopentano: 0.007, npentano: 0.011, hexano: 0.045, heptano: 0.052, octano: 0.018, nonano: 0.002, decano: 0.000, oxigenio: 0.041, nitrogenio: 0.684, co2: 0.814, fatorCompressibilidade: 0.693, massaEspecifica: 0.793, massaMolar: 16.640 },
    { dataColeta: "13/04/2024", boletim: "FT1/24-13046", metano: 98.398, etano: 0.089, propano: 0.129, isobutano: 0.003, nbutano: 0.012, isopentano: 0.005, npentano: 0.009, hexano: 0.037, heptano: 0.080, octano: 0.042, nonano: 0.005, decano: 0.000, oxigenio: 0.012, nitrogenio: 0.345, co2: 0.814, fatorCompressibilidade: 0.688, massaEspecifica: 0.791, massaMolar: 16.522 },
    { dataColeta: "28/05/2024", boletim: "FT1/24-13609", metano: 98.076, etano: 0.087, propano: 0.138, isobutano: 0.004, nbutano: 0.014, isopentano: 0.010, npentano: 0.019, hexano: 0.077, heptano: 0.088, octano: 0.033, nonano: 0.003, decano: 0.000, oxigenio: 0.013, nitrogenio: 0.963, co2: 0.875, fatorCompressibilidade: 0.693, massaEspecifica: 0.793, massaMolar: 16.623 },
    { dataColeta: "29/07/2024", boletim: "FT1/24-14893", metano: 97.550, etano: 0.097, propano: 0.630, isobutano: 0.014, nbutano: 0.035, isopentano: 0.020, npentano: 0.051, hexano: 0.175, heptano: 0.147, octano: 0.032, nonano: 0.001, decano: 0.000, oxigenio: 0.017, nitrogenio: 0.424, co2: 0.795, fatorCompressibilidade: 0.702, massaEspecifica: 0.798, massaMolar: 16.854 }
  ]
};

interface CEPDatabaseUpdaterProps {
  onUpdate?: (count: number) => void;
}

const CEPDatabaseUpdater: React.FC<CEPDatabaseUpdaterProps> = ({ onUpdate }) => {
  
  const convertDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
  };

  const updateCEPDatabase = () => {
    try {
      // Combinar todos os conjuntos de dados
      const allData = [
        ...historicalDataSets.primary,
        ...historicalDataSets.additional,
        ...historicalDataSets.recent
      ];

      // Converter para formato do sistema CEP
      const processedData = allData.map((row, index) => ({
        id: `historical_${Date.now()}_${index}`,
        boletimNumber: row.boletim,
        date: convertDate(row.dataColeta),
        components: {
          "Metano (C₁)": row.metano,
          "Etano (C₂)": row.etano,
          "Propano (C₃)": row.propano,
          "i-Butano (iC₄)": row.isobutano,
          "n-Butano (nC₄)": row.nbutano,
          "Isopentano": row.isopentano,
          "N-Pentano": row.npentano,
          "Hexano": row.hexano,
          "Heptano": row.heptano,
          "Octano": row.octano,
          "Nonano": row.nonano,
          "Decano": row.decano,
          "Oxigênio": row.oxigenio,
          "Nitrogênio (N₂)": row.nitrogenio,
          "Dióxido de Carbono (CO₂)": row.co2
        },
        properties: {
          compressibilityFactor: row.fatorCompressibilidade,
          specificMass: row.massaEspecifica,
          molarMass: row.massaMolar
        }
      }));

      // Limpar base atual e salvar nova
      localStorage.removeItem('cep_historical_samples');
      localStorage.setItem('cep_historical_samples', JSON.stringify(processedData));

      console.log(`✅ Base CEP atualizada com ${processedData.length} amostras históricas`);
      
      if (onUpdate) {
        onUpdate(processedData.length);
      }

      return processedData.length;

    } catch (error) {
      console.error('❌ Erro ao atualizar base CEP:', error);
      throw error;
    }
  };

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-bold text-blue-800 mb-2">
        📊 Atualizador de Base Histórica CEP
      </h3>
      
      <p className="text-sm text-blue-700 mb-3">
        Clique para carregar {Object.values(historicalDataSets).flat().length} amostras históricas 
        (2019-2024) na base de dados CEP para análise estatística.
      </p>

      <button
        onClick={updateCEPDatabase}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        🔄 Atualizar Base CEP Histórica
      </button>
      
      <div className="mt-2 text-xs text-blue-600">
        <strong>Dados inclusos:</strong> 
        <br />• {historicalDataSets.primary.length} amostras primárias (2019-2021)
        <br />• {historicalDataSets.additional.length} amostras adicionais (2022-2023)
        <br />• {historicalDataSets.recent.length} amostras recentes (2023-2024)
      </div>
    </div>
  );
};

export default CEPDatabaseUpdater; 