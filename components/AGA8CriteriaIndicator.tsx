import React, { useMemo } from 'react';
import { ReportData } from '../types';
import { escolherCriterioAGA8 } from '../aga8-criteria-validator';

interface AGA8CriteriaIndicatorProps {
  reportData: ReportData;
  showDetails?: boolean;
}

const AGA8CriteriaIndicator: React.FC<AGA8CriteriaIndicatorProps> = ({ 
  reportData, 
  showDetails = false 
}) => {
  
  const criteriaInfo = useMemo(() => {
    try {
      const temperatura = parseFloat(reportData.sampleInfo?.temperaturaAmostraC || '20');
      const pressao = parseFloat(reportData.sampleInfo?.pressaoAmostraAbsolutaKpaA || '0');
      
      return escolherCriterioAGA8(reportData.components, temperatura, pressao);
    } catch (error) {
      console.warn('Erro ao avaliar critério AGA8:', error);
      return null;
    }
  }, [reportData.components, reportData.sampleInfo]);

  if (!criteriaInfo) {
    return null;
  }

  const getMetodoColor = (metodo: string) => {
    switch (metodo) {
      case 'AGA-8 DETAIL': return 'bg-green-100 border-green-300 text-green-800';
      case 'AGA-8 GROSS': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'GERG-2008': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'AGA-8 DETAIL': return '🎯';
      case 'AGA-8 GROSS': return '📊';
      case 'GERG-2008': return '🔬';
      default: return '❓';
    }
  };

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? '✅' : '⚠️';
  };

  return (
    <div className="p-4 mt-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getMetodoIcon(criteriaInfo.metodo)}</span>
          <div>
            <h4 className="font-semibold text-gray-900">
              Método Recomendado: {criteriaInfo.metodo}
            </h4>
            <p className="text-sm text-gray-600">{criteriaInfo.criterio}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getMetodoColor(criteriaInfo.metodo)}`}>
          {getStatusIcon(criteriaInfo.isValid)} {criteriaInfo.isValid ? 'Válido' : 'Limitações'}
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-3">
          {/* Mostrar qualidade do gás */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-800">Qualidade do Gás:</span>
              <span className="text-blue-700">{criteriaInfo.gasQuality}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium text-blue-800">Faixa Operacional:</span>
              <span className="text-blue-700 capitalize">{criteriaInfo.operationalRange}</span>
            </div>
          </div>

          {/* Validações de componentes */}
          {criteriaInfo.componentValidations.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-800">Validação de Componentes:</h5>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {criteriaInfo.componentValidations.slice(0, 6).map((validation, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-sm">{validation.component.replace(/\(.*\)/, '').trim()}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${validation.status === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                        {validation.status === 'OK' ? '✅' : '❌'}
                      </span>
                      <span className="text-xs text-gray-500">{validation.value.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detalhes e motivos */}
          {!criteriaInfo.isValid && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h5 className="mb-2 font-medium text-yellow-800">
                ⚠️ Limitações Identificadas:
              </h5>
              <p className="text-sm text-yellow-700">{criteriaInfo.reason}</p>
            </div>
          )}

          <div className="pt-2 text-xs text-gray-500 border-t">
            💡 O método é selecionado automaticamente baseado na composição, pressão e temperatura da amostra, 
            seguindo as diretrizes do AGA Report No. 8.
          </div>
        </div>
      )}
    </div>
  );
};

export default AGA8CriteriaIndicator; 