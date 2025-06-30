import React, { useState, useEffect, useCallback } from 'react';
import CEPHistoryEditor from './CEPHistoryEditor';

interface CEPHistoricalSample {
  id: string;
  boletimNumber: string;
  date: string;
  components: Record<string, number>;
  properties: Record<string, number>;
}

interface CEPStatistics {
  mean: number;
  lowerControlLimit: number;
  upperControlLimit: number;
  sampleCount: number;
  mobileRangeMean: number;
}

interface CEPHistoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CEP_STORAGE_KEY = 'cep_historical_samples';
const D2_FACTOR = 1.128;

const CEPHistoryManagerModal: React.FC<CEPHistoryManagerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [historicalData, setHistoricalData] = useState<CEPHistoricalSample[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string>('Metano (C₁)');
  const [statistics, setStatistics] = useState<CEPStatistics | null>(null);
  const [filteredData, setFilteredData] = useState<CEPHistoricalSample[]>([]);

  // Componentes disponíveis para visualização
  const availableComponents = [
    'Metano (C₁)', 'Etano (C₂)', 'Propano (C₃)', 'i-Butano (iC₄)', 'n-Butano (nC₄)',
    'Dióxido de Carbono (CO₂)', 'Nitrogênio (N₂)'
  ];

  const loadHistoricalData = useCallback(() => {
    try {
      const stored = localStorage.getItem(CEP_STORAGE_KEY);
      const rawData = stored ? JSON.parse(stored) : [];
      
      // ORDENAR POR DATA - MAIS RECENTE PRIMEIRO
      const sortedData = rawData.sort((a: CEPHistoricalSample, b: CEPHistoricalSample) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setHistoricalData(sortedData);
      setFilteredData(sortedData);
      
      if (sortedData.length > 0) {
        console.log('✅ Histórico carregado com sucesso:', sortedData.length, 'amostras');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar histórico CEP:', error);
      setHistoricalData([]);
      setFilteredData([]);
    }
  }, []);

  const calculateStatistics = useCallback((componentName: string) => {
    // EXTRAIR VALORES VÁLIDOS DAS ÚLTIMAS 8 AMOSTRAS
    const validValues: number[] = [];
    for (const sample of historicalData) {
      const value = sample.components[componentName] || sample.properties[componentName];
      if (value !== undefined && value > 0) {
        validValues.push(value);
        if (validValues.length === 8) break;
      }
    }

    if (validValues.length < 2) {
      setStatistics(null);
      return;
    }

    // CÁLCULO CEP
    const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;

    // Calcular amplitudes móveis
    const mobileRanges: number[] = [];
    for (let i = 1; i < validValues.length; i++) {
      mobileRanges.push(Math.abs(validValues[i] - validValues[i - 1]));
    }

    const mobileRangeMean = mobileRanges.length > 0 
      ? mobileRanges.reduce((sum, range) => sum + range, 0) / mobileRanges.length 
      : 0;

    // FÓRMULAS CEP
    const controlFactor = 3 * (mobileRangeMean / D2_FACTOR);
    const upperControlLimit = Number((mean + controlFactor).toFixed(4));
    const lowerControlLimit = Number(Math.max(0, mean - controlFactor).toFixed(4));

    setStatistics({
      mean: Number(mean.toFixed(4)),
      lowerControlLimit,
      upperControlLimit,
      sampleCount: validValues.length,
      mobileRangeMean: Number(mobileRangeMean.toFixed(4))
    });
  }, [historicalData]);

  const exportToCSV = useCallback(() => {
    if (filteredData.length === 0) {
      alert('Nenhum dado disponível para exportação');
      return;
    }

    const headers = ['Boletim', 'Data', 'Componente/Propriedade', 'Valor', 'Status CEP'];
    const rows: string[][] = [];

    filteredData.forEach(sample => {
      Object.entries(sample.components).forEach(([name, value]) => {
        if (value > 0) {
          const isOutlier = statistics && (value < statistics.lowerControlLimit || value > statistics.upperControlLimit);
          rows.push([
            sample.boletimNumber,
            new Date(sample.date).toLocaleDateString('pt-BR'),
            name,
            value.toFixed(4),
            isOutlier ? 'Fora dos Limites' : 'Dentro dos Limites'
          ]);
        }
      });
    });

    const csvContent = [headers, ...rows]
      .map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico_cep_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredData, statistics]);

  const clearHistory = useCallback(() => {
    if (confirm('Tem certeza que deseja limpar todo o histórico CEP? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem(CEP_STORAGE_KEY);
      setHistoricalData([]);
      setFilteredData([]);
      setStatistics(null);
    }
  }, []);

  const getValueForSample = (sample: CEPHistoricalSample, componentName: string): number | null => {
    return sample.components[componentName] || sample.properties[componentName] || null;
  };

  const isOutlier = (value: number): boolean => {
    if (!statistics) return false;
    return value < statistics.lowerControlLimit || value > statistics.upperControlLimit;
  };

  const isInLast8Samples = (sampleId: string): boolean => {
    const validSamplesForCalculation: string[] = [];
    
    for (const sample of historicalData) {
      const value = sample.components[selectedComponent] || sample.properties[selectedComponent];
      if (value !== undefined && value > 0) {
        validSamplesForCalculation.push(sample.id);
        if (validSamplesForCalculation.length === 8) break;
      }
    }
    
    return validSamplesForCalculation.includes(sampleId);
  };

  const handleDataUpdate = () => {
    loadHistoricalData(); // Recarregar dados após edição
  };

  useEffect(() => {
    if (isOpen) {
      loadHistoricalData();
    }
  }, [isOpen, loadHistoricalData]);

  useEffect(() => {
    if (selectedComponent && historicalData.length > 0) {
      calculateStatistics(selectedComponent);
    }
  }, [selectedComponent, historicalData, calculateStatistics]);

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gerenciador de Histórico CEP</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Abas */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'view'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Visualizar Histórico
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'edit'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✏️ Editar Dados
            </button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {activeTab === 'view' ? (
          <>
            {historicalData.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-lg text-gray-600">Nenhum histórico disponível</p>
                <p className="text-gray-500">Execute validações CEP para gerar histórico</p>
              </div>
            ) : (
              <>
                {/* Controles de visualização */}
                <div className="flex flex-wrap gap-4 items-center mb-6">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Componente/Propriedade:
                    </label>
                    <select
                      value={selectedComponent}
                      onChange={(e) => setSelectedComponent(e.target.value)}
                      className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <optgroup label="Componentes">
                        {availableComponents.map(comp => (
                          <option key={comp} value={comp}>{comp}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Propriedades">
                        <option value="compressibilityFactor">Fator de Compressibilidade</option>
                        <option value="specificMass">Massa Específica</option>
                        <option value="molarMass">Massa Molar</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2 text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
                    >
                      📊 Exportar CSV
                    </button>
                    <button
                      onClick={clearHistory}
                      className="px-4 py-2 text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
                    >
                      🗑️ Limpar Histórico
                    </button>
                  </div>
                </div>

                {/* Estatísticas */}
                {statistics && (
                  <div className="p-4 mb-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="mb-2 font-semibold text-blue-800">Estatísticas CEP - {selectedComponent}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <span className="font-medium">Média (x̄):</span>
                        <div className="text-blue-700">{statistics.mean.toFixed(4)}</div>
                      </div>
                      <div>
                        <span className="font-medium">LCI:</span>
                        <div className="text-green-700">{statistics.lowerControlLimit.toFixed(4)}</div>
                      </div>
                      <div>
                        <span className="font-medium">LCS:</span>
                        <div className="text-red-700">{statistics.upperControlLimit.toFixed(4)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Amostras:</span>
                        <div className="text-gray-700">{statistics.sampleCount}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabela de Histórico */}
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-blue-600">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-blue-400">Boletim</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-blue-400">Data</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-blue-400">Valor</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-blue-400">Status CEP</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase">Amplitude Móvel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((sample, index) => {
                        const value = getValueForSample(sample, selectedComponent);
                        if (value === null) return null;

                        const isValueOutlier = isOutlier(value);
                        const prevSample = filteredData[index + 1];
                        const prevValue = prevSample ? getValueForSample(prevSample, selectedComponent) : null;
                        const mobileRange = prevValue !== null ? Math.abs(value - prevValue) : null;

                        const isUsedInCalculation = isInLast8Samples(sample.id);
                        const rowClass = isValueOutlier ? 'bg-red-50' : isUsedInCalculation ? 'bg-blue-50' : 'bg-white';
                        
                        return (
                          <tr key={sample.id} className={rowClass}>
                            <td className="px-4 py-2 border border-gray-300">{sample.boletimNumber}</td>
                            <td className="px-4 py-2 border border-gray-300">
                              {new Date(sample.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className={`border border-gray-300 px-4 py-2 font-mono ${isValueOutlier ? 'font-bold text-red-700' : ''}`}>
                              {value.toFixed(4)}
                            </td>
                            <td className="px-4 py-2 border border-gray-300">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isValueOutlier 
                                  ? 'text-red-800 bg-red-100' 
                                  : 'text-green-800 bg-green-100'
                              }`}>
                                {isValueOutlier ? '❌ Fora dos Limites' : '✅ Dentro dos Limites'}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-mono border border-gray-300">
                              {mobileRange !== null ? mobileRange.toFixed(4) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Resumo */}
                <div className="mt-6 text-sm text-gray-600">
                  <p>
                    <strong>Total de amostras:</strong> {historicalData.length} | 
                    <strong> Metodologia:</strong> LCS = x̄ + 3(MR̄/1.128), LCI = x̄ - 3(MR̄/1.128) | 
                    <strong> Base de cálculo:</strong> Últimas 8 amostras válidas
                  </p>
                </div>
              </>
            )}
          </>
        ) : (
          <CEPHistoryEditor onDataUpdate={handleDataUpdate} />
        )}
      </div>
    </div>
  );
};

export default CEPHistoryManagerModal; 