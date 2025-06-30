/**
 * CEP History Viewer - Visualizador de Histórico CEP
 * Exibe todas as colunas conforme Excel mostrado nas imagens
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CEPHistoricalSample, CEP_COLUMNS_CONFIG } from '../types';

interface CEPStatistics {
  mean: number;
  lowerControlLimit: number;
  upperControlLimit: number;
  sampleCount: number;
}

interface CEPHistoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CEP_STORAGE_KEY = 'cep_historical_samples';

const CEPHistoryViewer: React.FC<CEPHistoryViewerProps> = ({ isOpen, onClose }) => {
  const [historicalData, setHistoricalData] = useState<CEPHistoricalSample[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string>('Metano (C₁)');
  const [statistics, setStatistics] = useState<CEPStatistics | null>(null);

  // Componentes disponíveis para seleção
  const availableComponents = [
    ...CEP_COLUMNS_CONFIG.components.map(c => c.key),
    'fatorCompressibilidade', 'massaEspecifica', 'massaMolecular'
  ];

  const loadHistoricalData = useCallback(() => {
    try {
      const stored = localStorage.getItem(CEP_STORAGE_KEY);
      const rawData = stored ? JSON.parse(stored) : [];
      
      // Ordenar por data de validação - mais recente primeiro
      const sortedData = rawData.sort((a: CEPHistoricalSample, b: CEPHistoricalSample) => 
        new Date(b.dataValidacao).getTime() - new Date(a.dataValidacao).getTime()
      );
      
      setHistoricalData(sortedData);
      console.log('✅ Histórico CEP carregado:', sortedData.length, 'amostras');
    } catch (error) {
      console.error('❌ Erro ao carregar histórico CEP:', error);
      setHistoricalData([]);
    }
  }, []);

  const calculateStatistics = useCallback((componentName: string) => {
    if (historicalData.length < 2) {
      setStatistics(null);
      return;
    }

    // Extrair valores válidos do componente selecionado
    const validValues: number[] = [];
    
    for (const sample of historicalData) {
      let value: number = 0;
      
      if (CEP_COLUMNS_CONFIG.components.some(c => c.key === componentName)) {
        value = (sample.components as any)[componentName] || 0;
      } else {
        switch (componentName) {
          case 'fatorCompressibilidade':
            value = sample.properties.fatorCompressibilidade;
            break;
          case 'massaEspecifica':
            value = sample.properties.massaEspecifica;
            break;
          case 'massaMolecular':
            value = sample.properties.massaMolecular;
            break;
        }
      }
      
      if (value > 0) {
        validValues.push(value);
        if (validValues.length === 8) break; // Últimas 8 amostras
      }
    }

    if (validValues.length < 2) {
      setStatistics(null);
      return;
    }

    // Calcular média
    const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;

    // Calcular amplitudes móveis
    const mobileRanges: number[] = [];
    for (let i = 1; i < validValues.length; i++) {
      mobileRanges.push(Math.abs(validValues[i] - validValues[i - 1]));
    }

    const mobileRangeMean = mobileRanges.length > 0 
      ? mobileRanges.reduce((sum, range) => sum + range, 0) / mobileRanges.length 
      : 0;

    // Calcular limites de controle
    const controlFactor = 3 * (mobileRangeMean / 1.128);
    const upperControlLimit = mean + controlFactor;
    const lowerControlLimit = Math.max(0, mean - controlFactor);

    setStatistics({
      mean: Number(mean.toFixed(4)),
      lowerControlLimit: Number(lowerControlLimit.toFixed(4)),
      upperControlLimit: Number(upperControlLimit.toFixed(4)),
      sampleCount: validValues.length
    });
  }, [historicalData]);

  const exportToCSV = useCallback(() => {
    if (historicalData.length === 0) {
      alert('Nenhum dado disponível para exportação');
      return;
    }

    // Criar cabeçalhos
    const headers = [
      'Boletim',
      'Data da Coleta',
      'Data da Emissão do Relatório',
      'Data da Validação',
      ...CEP_COLUMNS_CONFIG.components.map(c => c.label),
      'Total',
      'Fator de Compressibilidade',
      'Massa Específica',
      'Massa Molecular',
      'Condição de Referência'
    ];

    // Criar linhas de dados
    const rows = historicalData.map(sample => [
      sample.boletimNumber,
      new Date(sample.dataColeta).toLocaleDateString('pt-BR'),
      new Date(sample.dataEmissaoRelatorio).toLocaleDateString('pt-BR'),
      new Date(sample.dataValidacao).toLocaleDateString('pt-BR'),
      ...CEP_COLUMNS_CONFIG.components.map(c => 
        ((sample.components as any)[c.key] || 0).toFixed(4)
      ),
      sample.totalComposicao.toFixed(4),
      sample.properties.fatorCompressibilidade.toFixed(4),
      sample.properties.massaEspecifica.toFixed(4),
      sample.properties.massaMolecular.toFixed(4),
      sample.properties.condicaoReferencia
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico_cep_completo_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [historicalData]);

  const clearHistory = useCallback(() => {
    if (confirm('Tem certeza que deseja limpar todo o histórico CEP? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem(CEP_STORAGE_KEY);
      setHistoricalData([]);
      setStatistics(null);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadHistoricalData();
    }
  }, [isOpen, loadHistoricalData]);

  useEffect(() => {
    calculateStatistics(selectedComponent);
  }, [selectedComponent, calculateStatistics]);

  if (!isOpen) return null;

  // Todas as colunas para exibição
  const allDisplayColumns = [
    { key: 'boletimNumber', label: 'Boletim' },
    { key: 'dataColeta', label: 'Data da Coleta' },
    { key: 'dataEmissaoRelatorio', label: 'Data da Emissão' },
    { key: 'dataValidacao', label: 'Data da Validação' },
    ...CEP_COLUMNS_CONFIG.components,
    { key: 'totalComposicao', label: 'TOTAL' },
    { key: 'fatorCompressibilidade', label: 'Fator de Compressibilidade' },
    { key: 'massaEspecifica', label: 'Massa Específica' },
    { key: 'massaMolecular', label: 'Massa Molecular' },
    { key: 'condicaoReferencia', label: 'Condição de Referência' }
  ];

  const getDisplayValue = (sample: CEPHistoricalSample, columnKey: string): string => {
    switch (columnKey) {
      case 'boletimNumber':
        return sample.boletimNumber;
      case 'dataColeta':
        return new Date(sample.dataColeta).toLocaleDateString('pt-BR');
      case 'dataEmissaoRelatorio':
        return new Date(sample.dataEmissaoRelatorio).toLocaleDateString('pt-BR');
      case 'dataValidacao':
        return new Date(sample.dataValidacao).toLocaleDateString('pt-BR');
      case 'totalComposicao':
        return sample.totalComposicao.toFixed(4);
      case 'fatorCompressibilidade':
        return sample.properties.fatorCompressibilidade.toFixed(4);
      case 'massaEspecifica':
        return sample.properties.massaEspecifica.toFixed(4);
      case 'massaMolecular':
        return sample.properties.massaMolecular.toFixed(4);
      case 'condicaoReferencia':
        return sample.properties.condicaoReferencia;
      default:
        // É um componente
        const value = (sample.components as any)[columnKey] || 0;
        return value.toFixed(4);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-screen m-4 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-bold text-gray-800">Visualizar Histórico CEP</h2>
            <span className="text-sm text-gray-500">({historicalData.length} amostras)</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Componente/Propriedade:
            </label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableComponents.map(comp => (
                <option key={comp} value={comp}>
                  {CEP_COLUMNS_CONFIG.components.find(c => c.key === comp)?.label || comp}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              📄 Exportar CSV
            </button>
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              🗑️ Limpar Histórico
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="p-4 bg-blue-50 border-b">
            <h4 className="font-bold text-blue-800 mb-2">Estatísticas CEP - {selectedComponent}</h4>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Média (X̄):</span>
                <div className="font-mono font-bold">{statistics.mean}</div>
              </div>
              <div>
                <span className="text-gray-600">LCI:</span>
                <div className="font-mono font-bold text-red-600">{statistics.lowerControlLimit}</div>
              </div>
              <div>
                <span className="text-gray-600">LCS:</span>
                <div className="font-mono font-bold text-red-600">{statistics.upperControlLimit}</div>
              </div>
              <div>
                <span className="text-gray-600">Amostras:</span>
                <div className="font-mono font-bold">{statistics.sampleCount}</div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-4">
          {historicalData.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600">
                  {allDisplayColumns.map(col => (
                    <th key={col.key} className="border border-gray-400 px-2 py-3 text-xs font-bold text-white min-w-[100px]">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historicalData.map((sample, index) => (
                  <tr key={sample.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {allDisplayColumns.map(col => (
                      <td key={col.key} className="border border-gray-300 px-2 py-2 text-xs font-mono">
                        {getDisplayValue(sample, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">📭 Nenhum dado histórico CEP encontrado</p>
              <p className="text-sm mt-2">Execute algumas validações CEP para gerar dados históricos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CEPHistoryViewer; 