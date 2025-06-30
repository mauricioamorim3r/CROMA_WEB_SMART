import React from 'react';
import { SamplingConditionProperty } from '../types';
import { INPUT_CLASS, TABLE_TH_CLASS, TABLE_TD_CLASS } from '../constants';

interface SamplingConditionsPropertiesTableProps {
  properties: SamplingConditionProperty[];
  onPropertyChange: (id: string, field: keyof SamplingConditionProperty, value: string) => void;
}

const SamplingConditionsPropertiesTable: React.FC<SamplingConditionsPropertiesTableProps> = ({ properties, onPropertyChange }) => {
  // Fields that can be auto-calculated
  const autoCalculatedFields = ['relativeDensitySampling', 'wobbeIndex'];
  
  const isAutoCalculated = (fieldId: string, value: string): boolean => {
    return autoCalculatedFields.includes(fieldId) && !!value && parseFloat(value) > 0;
  };

  return (
    <div className="p-4 mb-6 bg-white rounded-xl shadow-md">
      <h2 className="enhanced-section-title">7. PROPRIEDADES DO GÁS – CONDIÇÕES DE AMOSTRAGEM</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-with-relief bg-white">
          <thead className="table-header-blue">
            <tr>
              <th className={TABLE_TH_CLASS}>Propriedade</th>
              <th className={TABLE_TH_CLASS}>Valor</th>
              <th className={TABLE_TH_CLASS}>Incerteza Expandida</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((prop) => (
              <tr key={prop.id}>
                <td className={TABLE_TD_CLASS}>{prop.name}</td>
                <td className={TABLE_TD_CLASS}>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={prop.value}
                      onChange={(e) => onPropertyChange(prop.id, 'value', e.target.value)}
                      className={`py-1 w-32 ${INPUT_CLASS} ${
                        isAutoCalculated(prop.id, prop.value) 
                          ? 'bg-green-50 border-green-300 text-green-800' 
                          : ''
                      }`}
                      aria-label={`${prop.name} Valor`}
                      title={
                        isAutoCalculated(prop.id, prop.value) 
                          ? 'Valor calculado automaticamente. Você pode editá-lo se necessário.' 
                          : ''
                      }
                    />
                    {isAutoCalculated(prop.id, prop.value) && (
                      <span 
                        className="absolute right-2 top-1/2 text-xs text-green-600 transform -translate-y-1/2"
                        title="Calculado automaticamente"
                      >
                        🔄
                      </span>
                    )}
                  </div>
                </td>
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="number"
                    step="any"
                    value={prop.incertezaExpandida}
                    onChange={(e) => onPropertyChange(prop.id, 'incertezaExpandida', e.target.value)}
                    className={`py-1 w-32 ${INPUT_CLASS}`}
                    aria-label={`${prop.name} Incerteza Expandida`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend for auto-calculated fields */}
      {properties.some(prop => isAutoCalculated(prop.id, prop.value)) && (
        <div className="p-3 mt-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center text-sm text-green-700">
            <span className="mr-2">🔄</span>
            <span className="font-medium">Campos com Cálculo Automático:</span>
            <span className="ml-2">Densidade Relativa, Índice de Wobbe</span>
          </div>
          <p className="mt-1 text-xs text-green-600">
            Valores calculados automaticamente. Você pode editá-los manualmente se necessário.
          </p>
        </div>
      )}
    </div>
  );
};

export default SamplingConditionsPropertiesTable;
