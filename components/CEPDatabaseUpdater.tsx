import React from 'react';

// DADOS HISTÓRICOS CEP - Array limpo aguardando novos valores
interface HistoricalDataItem {
  dataColeta: string;
  dataEmissaoRelatorio: string;
  dataValidacao: string;
  boletim: string;
  metano: number;
  etano: number;
  propano: number;
  isobutano: number;
  nbutano: number;
  isopentano: number;
  npentano: number;
  hexano: number;
  heptano: number;
  octano: number;
  nonano: number;
  decano: number;
  oxigenio: number;
  nitrogenio: number;
  co2: number;
  total: number;
  fatorCompressibilidade: number;
  massaEspecifica: number;
  massaMolar: number;
}

const newHistoricalData: HistoricalDataItem[] = [
  // === PRIMEIRA AMOSTRA - PTJ/23-10970 ===
  {
    dataColeta: "03/12/2023",
    dataEmissaoRelatorio: "20/12/2023",
    dataValidacao: "20/12/2023",
    boletim: "PTJ/23-10970",
    metano: 97.626,
    etano: 0.085,
    propano: 0.140,
    isobutano: 0.021,
    nbutano: 0.091,
    isopentano: 0.099,
    npentano: 0.219,
    hexano: 0.458,
    heptano: 0.162,
    octano: 0.017,
    nonano: 0.001,
    decano: 0.000,
    oxigenio: 0.011,
    nitrogenio: 0.405,
    co2: 0.665,
    total: 100.0,
    fatorCompressibilidade: 0.9979,
    massaEspecifica: 0.710,
    massaMolar: 17.0313
  },
  // === SEGUNDA AMOSTRA - PTJ/23-11278 ===
  {
    dataColeta: "30/12/2023",
    dataEmissaoRelatorio: "18/01/2024",
    dataValidacao: "18/01/2024",
    boletim: "PTJ/23-11278",
    metano: 98.101,
    etano: 0.086,
    propano: 0.616,
    isobutano: 0.002,
    nbutano: 0.009,
    isopentano: 0.003,
    npentano: 0.004,
    hexano: 0.011,
    heptano: 0.011,
    octano: 0.009,
    nonano: 0.002,
    decano: 0.000,
    oxigenio: 0.015,
    nitrogenio: 0.349,
    co2: 0.782,
    total: 100.0,
    fatorCompressibilidade: 0.9980,
    massaEspecifica: 0.689,
    massaMolar: 16.5274
  },
  // === TERCEIRA AMOSTRA - PTJ/24-11737 ===
  {
    dataColeta: "23/01/2024",
    dataEmissaoRelatorio: "15/02/2024",
    dataValidacao: "15/02/2024",
    boletim: "PTJ/24-11737",
    metano: 97.289,
    etano: 0.131,
    propano: 0.139,
    isobutano: 0.010,
    nbutano: 0.027,
    isopentano: 0.008,
    npentano: 0.013,
    hexano: 0.027,
    heptano: 0.022,
    octano: 0.014,
    nonano: 0.003,
    decano: 0.000,
    oxigenio: 0.020,
    nitrogenio: 1.513,
    co2: 0.784,
    total: 100.0,
    fatorCompressibilidade: 0.9981,
    massaEspecifica: 0.691,
    massaMolar: 16.5859
  },
  // === QUARTA AMOSTRA - PTJ/24-12161 ===
  {
    dataColeta: "19/02/2024",
    dataEmissaoRelatorio: "07/03/2024",
    dataValidacao: "07/03/2024",
    boletim: "PTJ/24-12161",
    metano: 97.151,
    etano: 0.160,
    propano: 0.594,
    isobutano: 0.026,
    nbutano: 0.075,
    isopentano: 0.040,
    npentano: 0.077,
    hexano: 0.170,
    heptano: 0.112,
    octano: 0.018,
    nonano: 0.001,
    decano: 0.000,
    oxigenio: 0.104,
    nitrogenio: 0.684,
    co2: 0.788,
    total: 100.0,
    fatorCompressibilidade: 0.9979,
    massaEspecifica: 0.704,
    massaMolar: 16.8914
  },
  // === QUINTA AMOSTRA - PTJ/24-12574 ===
  {
    dataColeta: "17/03/2024",
    dataEmissaoRelatorio: "03/04/2024",
    dataValidacao: "04/04/2024",
    boletim: "PTJ/24-12574",
    metano: 97.821,
    etano: 0.094,
    propano: 0.658,
    isobutano: 0.009,
    nbutano: 0.015,
    isopentano: 0.007,
    npentano: 0.011,
    hexano: 0.045,
    heptano: 0.052,
    octano: 0.018,
    nonano: 0.002,
    decano: 0.000,
    oxigenio: 0.041,
    nitrogenio: 0.413,
    co2: 0.814,
    total: 100.0,
    fatorCompressibilidade: 0.9980,
    massaEspecifica: 0.693,
    massaMolar: 16.6309
  },
  // === SEXTA AMOSTRA - PTJ/24-13046 ===
  {
    dataColeta: "15/04/2024",
    dataEmissaoRelatorio: "06/05/2024",
    dataValidacao: "07/05/2024",
    boletim: "PTJ/24-13046",
    metano: 98.396,
    etano: 0.089,
    propano: 0.129,
    isobutano: 0.003,
    nbutano: 0.012,
    isopentano: 0.005,
    npentano: 0.009,
    hexano: 0.037,
    heptano: 0.080,
    octano: 0.042,
    nonano: 0.005,
    decano: 0.000,
    oxigenio: 0.012,
    nitrogenio: 0.345,
    co2: 0.834,
    total: 100.0,
    fatorCompressibilidade: 0.9980,
    massaEspecifica: 0.688,
    massaMolar: 16.5224
  },
  // === SÉTIMA AMOSTRA - PTJ/24-13669 ===
  {
    dataColeta: "28/05/2024",
    dataEmissaoRelatorio: "18/06/2024", 
    dataValidacao: "18/06/2024",
    boletim: "PTJ/24-13669",
    metano: 97.298,
    etano: 0.151,
    propano: 0.573,
    isobutano: 0.020,
    nbutano: 0.014,
    isopentano: 0.010,
    npentano: 0.019,
    hexano: 0.077,
    heptano: 0.088,
    octano: 0.033,
    nonano: 0.003,
    decano: 0.000,
    oxigenio: 0.013,
    nitrogenio: 0.363,
    co2: 0.875,
    total: 100.0,
    fatorCompressibilidade: 0.9980,
    massaEspecifica: 0.693,
    massaMolar: 16.6279
  },
  // === OITAVA AMOSTRA - PTJ/24-14803 ===
  {
    dataColeta: "29/07/2024",
    dataEmissaoRelatorio: "19/08/2024",
    dataValidacao: "19/08/2024", 
    boletim: "PTJ/24-14803",
    metano: 97.550,
    etano: 0.097,
    propano: 0.630,
    isobutano: 0.014,
    nbutano: 0.035,
    isopentano: 0.026,
    npentano: 0.051,
    hexano: 0.175,
    heptano: 0.147,
    octano: 0.032,
    nonano: 0.001,
    decano: 0.000,
    oxigenio: 0.017,
    nitrogenio: 0.424,
    co2: 0.795,
    total: 100.0,
    fatorCompressibilidade: 0.9979,
    massaEspecifica: 0.702,
    massaMolar: 16.8536
  }
];

interface CEPDatabaseUpdaterProps {
  onUpdate?: (count: number) => void;
}

const CEPDatabaseUpdater: React.FC<CEPDatabaseUpdaterProps> = ({ onUpdate }) => {
  
  const convertDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
  };

  const clearAndUpdateCEPDatabase = () => {
    try {
      console.log('🧹 LIMPANDO base atual do CEP...');
      
      // 1. LIMPAR COMPLETAMENTE a base atual
      localStorage.removeItem('cep_historical_samples');
      console.log('✅ Base CEP limpa com sucesso');

      // 2. VERIFICAR se temos o mesmo número de colunas necessárias
      const requiredFields = [
        'dataColeta', 'dataEmissaoRelatorio', 'dataValidacao', 'boletim', 'metano', 'etano', 'propano', 'isobutano', 'nbutano',
        'isopentano', 'npentano', 'hexano', 'heptano', 'octano', 'nonano', 'decano',
        'oxigenio', 'nitrogenio', 'co2', 'total', 'fatorCompressibilidade', 'massaEspecifica', 'massaMolar'
      ];
      
      const firstSample = newHistoricalData[0];
      const availableFields = Object.keys(firstSample);
      const missingFields = requiredFields.filter(field => !availableFields.includes(field));
      
      if (missingFields.length > 0) {
        console.warn('⚠️ Campos faltando:', missingFields);
      } else {
        console.log('✅ Estrutura de dados validada - todas as colunas necessárias presentes');
      }

      // 3. CONVERTER para formato do sistema CEP (as 8 últimas análises)
      const processedData = newHistoricalData.map((row, index) => ({
        id: `latest_analysis_${Date.now()}_${index}`,
        boletimNumber: row.boletim,
        date: convertDate(row.dataColeta),
        components: {
          "Metano (C₁)": row.metano,
          "Etano (C₂)": row.etano,
          "Propano (C₃)": row.propano,
          "i-Butano (iC₄)": row.isobutano,
          "n-Butano (nC₄)": row.nbutano,
          "i-Pentano (iC₅)": row.isopentano,
          "n-Pentano (nC₅)": row.npentano,
          "Hexano (C₆)": row.hexano,
          "Heptano (C₇)": row.heptano,
          "Octano (C₈)": row.octano,
          "Nonano (C₉)": row.nonano,
          "Decano (C₁₀)": row.decano,
          "Oxigênio (O₂)": row.oxigenio,
          "Nitrogênio (N₂)": row.nitrogenio,
          "Dióxido de Carbono (CO₂)": row.co2
        },
        properties: {
          compressibilityFactor: row.fatorCompressibilidade,
          specificMass: row.massaEspecifica,
          molarMass: row.massaMolar
        }
      }));

      // 4. SALVAR as 8 novas amostras na base CEP
      localStorage.setItem('cep_historical_samples', JSON.stringify(processedData));

      console.log(`✅ Base CEP atualizada com ${processedData.length} amostras das ÚLTIMAS ANÁLISES`);
      console.log('📊 Período: dezembro/2023 → julho/2024');
      console.log('🎯 Próxima análise deve dar continuidade a partir de 29/07/2024');
      
      if (onUpdate) {
        onUpdate(processedData.length);
      }

      return processedData.length;

    } catch (error) {
      console.error('❌ Erro ao atualizar base CEP:', error);
      throw error;
    }
  };

  const checkCurrentDatabase = () => {
    try {
      const stored = localStorage.getItem('cep_historical_samples');
      const currentData = stored ? JSON.parse(stored) : [];
      
      console.log('🔍 VERIFICAÇÃO DA BASE ATUAL:');
      console.log(`📊 Total de amostras: ${currentData.length}`);
      
      if (currentData.length > 0) {
        console.log('📅 Primeira amostra:', currentData[0]);
        console.log('📅 Última amostra:', currentData[currentData.length - 1]);
        
        // Mostrar estrutura das colunas
        const sampleStructure = currentData[0];
        console.log('🏗️ Estrutura atual:');
        console.log('- ID:', !!sampleStructure.id);
        console.log('- Boletim:', !!sampleStructure.boletimNumber);
        console.log('- Data:', !!sampleStructure.date);
        console.log('- Componentes:', Object.keys(sampleStructure.components || {}));
        console.log('- Propriedades:', Object.keys(sampleStructure.properties || {}));
      } else {
        console.log('📭 Base vazia - pronta para receber novos dados');
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar base atual:', error);
    }
  };

  return (
    <div className="p-4 mb-4 bg-green-50 rounded-lg border border-green-200">
      <h3 className="mb-2 text-lg font-bold text-green-800">
        🔄 Atualizador Base CEP - ÚLTIMAS 8 ANÁLISES
      </h3>
      
      <p className="mb-3 text-sm text-green-700">
        <strong>ATENÇÃO:</strong> Este botão irá LIMPAR completamente a base atual e inserir apenas as 
        8 últimas análises reais (dezembro/2023 → julho/2024) para cálculo estatístico CEP.
      </p>

      <div className="flex gap-2 mb-3">
        <button
          onClick={checkCurrentDatabase}
          className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
        >
          🔍 Verificar Base Atual
        </button>
        
        <button
          onClick={clearAndUpdateCEPDatabase}
          className="px-4 py-2 font-medium text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
        >
          🔄 LIMPAR e ATUALIZAR Base CEP
        </button>
      </div>
      
      <div className="mt-2 text-xs text-green-600">
        <strong>Nova base incluirá:</strong> 
        <br />• {newHistoricalData.length} amostras das últimas análises (03/12/2023 → 29/07/2024)
        <br />• Todas as colunas necessárias para cálculo CEP (incluindo datas de emissão e validação)
        <br />• Próxima coleta: continuar após 29/07/2024
        <br />• Estatísticas serão calculadas com as {newHistoricalData.length} amostras mais recentes
      </div>
      
      <div className="p-2 mt-2 text-xs text-yellow-800 bg-yellow-50 rounded border border-yellow-200">
        <strong>⚠️ IMPORTANTE:</strong> Esta ação irá substituir TODOS os dados históricos existentes.
        Use apenas se confirmado que estes são os dados corretos para a base CEP.
      </div>
    </div>
  );
};

export default CEPDatabaseUpdater; 