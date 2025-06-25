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
      // const { escolherCriterioAGA8 } = require('../aga8-criteria-validator'); // já importado no topo
      
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

  const getModeloColor = (modelo: string) => {
    switch (modelo) {
      case 'DETAIL': return 'bg-green-100 border-green-300 text-green-800';
      case 'GROSS': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'GERG-2008': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getModeloIcon = (modelo: string) => {
    switch (modelo) {
      case 'DETAIL': return '🎯';
      case 'GROSS': return '📊';
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
          <span className="text-2xl">{getModeloIcon(criteriaInfo.modelo)}</span>
          <div>
            <h4 className="font-semibold text-gray-900">
              Modelo Recomendado: {criteriaInfo.modelo}
            </h4>
            <p className="text-sm text-gray-600">{criteriaInfo.criterio}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getModeloColor(criteriaInfo.modelo)}`}>
          {getStatusIcon(criteriaInfo.isValid)} {criteriaInfo.isValid ? 'Válido' : 'Limitações'}
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <span className={criteriaInfo.detalhes.pressaoStatus ? 'text-green-600' : 'text-red-600'}>
                {criteriaInfo.detalhes.pressaoStatus ? '✅' : '❌'}
              </span>
              <span>Pressão</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={criteriaInfo.detalhes.temperaturaStatus ? 'text-green-600' : 'text-red-600'}>
                {criteriaInfo.detalhes.temperaturaStatus ? '✅' : '❌'}
              </span>
              <span>Temperatura</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={criteriaInfo.detalhes.composicaoStatus ? 'text-green-600' : 'text-red-600'}>
                {criteriaInfo.detalhes.composicaoStatus ? '✅' : '❌'}
              </span>
              <span>Composição</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={criteriaInfo.detalhes.metanoMinimo ? 'text-green-600' : 'text-red-600'}>
                {criteriaInfo.detalhes.metanoMinimo ? '✅' : '❌'}
              </span>
              <span>Metano ≥ 60%</span>
            </div>
          </div>

          {criteriaInfo.motivosExcedidos.length > 0 && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h5 className="mb-2 font-medium text-yellow-800">
                ⚠️ Limitações para modelos AGA-8:
              </h5>
                             <ul className="space-y-1 text-sm text-yellow-700">
                {criteriaInfo.motivosExcedidos.map((motivo: string, index: number) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{motivo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 text-xs text-gray-500 border-t">
            💡 O modelo é selecionado automaticamente baseado na composição, pressão e temperatura da amostra, 
            seguindo as diretrizes do AGA Report No. 8.
          </div>
        </div>
      )}
    </div>
  );
};

export default AGA8CriteriaIndicator; 