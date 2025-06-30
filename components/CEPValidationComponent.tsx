/**
 * Componente Simplificado de Validação CEP
 * Interface limpa e focada no essencial
 */

import React, { useState } from 'react';
import { ValidationStatus } from '../types';
import StatusBadge from './ui/StatusBadge';

interface CEPResult {
  componentName: string;
  currentValue: number;
  status: ValidationStatus;
  statistics: {
    mean: number;
    lowerControlLimit: number;
    upperControlLimit: number;
    sampleCount: number;
  };
}

interface CEPValidationComponentProps {
  boletimNumber: string;
  onCEPStatusUpdate: (status: ValidationStatus) => void;
  // Props recebidas do App.tsx para evitar hook duplicado
  cepComponentResults: CEPResult[];
  cepPropertyResults: CEPResult[];
  overallCEPStatus: ValidationStatus;
  isCEPValidating: boolean;
  onRunCEPValidation: () => void;
  onAddCEPToHistory: () => void;
  onClearCEPHistory: () => void;
  onShowCEPHistory: () => void; // Nova prop para abrir modal global
  cepHistoricalSamplesCount: number;
}

const CEPValidationComponent: React.FC<CEPValidationComponentProps> = ({
  boletimNumber,
  onCEPStatusUpdate,
  cepComponentResults,
  cepPropertyResults,
  overallCEPStatus,
  isCEPValidating,
  onRunCEPValidation,
  onAddCEPToHistory,
  onClearCEPHistory,
  cepHistoricalSamplesCount
}) => {
  const [showDetails, setShowDetails] = useState(false);
  // Removido showHistory - usando modal global do App.tsx

  // Atualizar status no componente pai
  React.useEffect(() => {
    onCEPStatusUpdate(overallCEPStatus);
  }, [overallCEPStatus, onCEPStatusUpdate]);

  const allResults = [...cepComponentResults, ...cepPropertyResults];
  const okCount = allResults.filter(r => r.status === ValidationStatus.OK).length;
  const outOfLimitsCount = allResults.filter(r => r.status === ValidationStatus.ForaDaFaixa).length;
  const pendingCount = allResults.filter(r => r.status === ValidationStatus.Pendente).length;

  const getStatusColor = (status: ValidationStatus) => {
    switch (status) {
      case ValidationStatus.OK: return 'text-green-600 bg-green-50';
      case ValidationStatus.ForaDaFaixa: return 'text-red-600 bg-red-50';
      case ValidationStatus.Pendente: return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case ValidationStatus.OK: return '✅';
      case ValidationStatus.ForaDaFaixa: return '❌';
      case ValidationStatus.Pendente: return '⏳';
      default: return '➖';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho CEP */}
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="flex gap-2 items-center text-xl font-bold text-gray-900">
              📊 Controle Estatístico de Processo (CEP)
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Validação baseada em análise histórica e amplitude móvel
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(overallCEPStatus)}`}>
              {getStatusIcon(overallCEPStatus)} {overallCEPStatus}
            </span>
          </div>
        </div>

        {/* Resumo Estatístico */}
        <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-5">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{cepHistoricalSamplesCount}</div>
            <div className="text-xs text-gray-500">Amostras Históricas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{okCount}</div>
            <div className="text-xs text-gray-500">Dentro dos Limites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{outOfLimitsCount}</div>
            <div className="text-xs text-gray-500">Fora dos Limites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-gray-500">Pendentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{allResults.length}</div>
            <div className="text-xs text-gray-500">Total Validados</div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-3 items-center">
            <button
              onClick={onRunCEPValidation}
              disabled={isCEPValidating}
              className="flex gap-2 items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCEPValidating ? '⏳' : '🔄'} 
              {isCEPValidating ? 'Validando...' : 'Revalidar CEP'}
            </button>
            
            <button
              onClick={onAddCEPToHistory}
              disabled={!boletimNumber}
              className="flex gap-2 items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Adicionar ao Histórico
            </button>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => {
                // Usar modal global do App.tsx
                const event = new CustomEvent('openCEPHistoryModal');
                window.dispatchEvent(event);
              }}
              className="flex gap-2 items-center px-3 py-2 text-purple-600 rounded-lg border border-purple-300 hover:bg-purple-50"
            >
              📈 Ver Histórico
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex gap-2 items-center px-3 py-2 text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              {showDetails ? '👁️‍🗨️ Ocultar' : '👁️ Ver'} Detalhes
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja limpar todo o histórico CEP? Esta ação não pode ser desfeita.')) {
                  onClearCEPHistory();
                }
              }}
              className="flex gap-2 items-center px-3 py-2 text-red-600 rounded-lg border border-red-300 hover:bg-red-50"
            >
              🗑️ Limpar Histórico
            </button>
          </div>
        </div>
      </div>

      {/* Detalhes da Validação */}
      {showDetails && allResults.length > 0 && (
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h4 className="mb-4 text-lg font-semibold text-gray-900">
            📊 Resultados Detalhados da Validação CEP
          </h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white table-with-relief">
              <thead className="table-header-blue">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-blue-400/50">
                    Parâmetro
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-blue-400/50">
                    Valor Atual
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-blue-400/50">
                    Média (x̄)
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-blue-400/50">
                    LCI
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-blue-400/50">
                    LCS
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-blue-400/50">
                    Amostras
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase">
                    Status CEP
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allResults.map((result, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {result.componentName.length > 20 
                        ? `${result.componentName.substring(0, 20)}...` 
                        : result.componentName}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-900">
                      {result.currentValue.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">
                      {result.statistics.sampleCount >= 2 ? result.statistics.mean.toFixed(4) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">
                      {result.statistics.sampleCount >= 2 ? result.statistics.lowerControlLimit.toFixed(4) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">
                      {result.statistics.sampleCount >= 2 ? result.statistics.upperControlLimit.toFixed(4) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {result.statistics.sampleCount}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={result.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Metodologia */}
          <div className="p-4 mt-6 bg-blue-50 rounded-lg">
            <h5 className="mb-2 text-sm font-medium text-blue-900">📚 Metodologia CEP Aplicada:</h5>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>• <strong>Amplitude móvel:</strong> MRi = |xi - xi-1|</li>
              <li>• <strong>Limites de controle:</strong> LCS = x̄ + 3(MR̄/d₂), LCI = x̄ - 3(MR̄/d₂)</li>
              <li>• <strong>Fator d₂:</strong> 1.128 para n=2 observações consecutivas</li>
              <li>• <strong>Base histórica:</strong> Últimas 8 amostras válidas</li>
              <li>• <strong>Componentes monitorados:</strong> C₁, C₂, C₃, iC₄, nC₄, CO₂, N₂</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Modal do Histórico CEP - Removido para evitar duplicação com App.tsx */}
    </div>
  );
};

export default CEPValidationComponent; 