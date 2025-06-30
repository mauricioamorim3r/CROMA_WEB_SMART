import React from 'react';
import { SampleProperty } from '../types';
import StatusBadge from './ui/StatusBadge';
import { INPUT_CLASS, TABLE_TH_CLASS, TABLE_TD_CLASS } from '../constants';

interface StandardPropertiesTableProps {
  properties: SampleProperty[];
  onPropertyChange: (id: string, field: keyof SampleProperty, value: string) => void;
}

const StandardPropertiesTable: React.FC<StandardPropertiesTableProps> = ({ properties, onPropertyChange }) => {
  // Fields that can be auto-calculated
  const autoCalculatedFields = ['molarMass', 'relativeDensity', 'realDensity', 'pci'];
  
  const isAutoCalculated = (fieldId: string, value: string): boolean => {
    return autoCalculatedFields.includes(fieldId) && !!value && parseFloat(value) > 0;
  };

  return (
    <div className="p-4 mb-6 bg-white rounded-xl shadow-md">
      <h2 className="enhanced-section-title">6. PROPRIEDADES DO GÁS – CONDIÇÕES PADRÃO</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-with-relief bg-white">
          <thead className="table-header-blue">
            <tr>
              <th className={TABLE_TH_CLASS} rowSpan={2}>Propriedade</th>
              <th className={TABLE_TH_CLASS} rowSpan={2}>Valor</th>
              <th className={TABLE_TH_CLASS} rowSpan={2}>Incerteza Expandida</th>
              <th className={TABLE_TH_CLASS} rowSpan={2}>Status CEP</th>
              <th className={TABLE_TH_CLASS} colSpan={2}>CEP Limites</th>
            </tr>
            <tr>
              <th className={TABLE_TH_CLASS}>Inferior</th>
              <th className={TABLE_TH_CLASS}>Superior</th>
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
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600 text-xs"
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
                <td className={TABLE_TD_CLASS}><StatusBadge status={prop.cepStatus} /></td>
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="number"
                    step="any"
                    value={prop.cepLowerLimit}
                    onChange={(e) => onPropertyChange(prop.id, 'cepLowerLimit', e.target.value)}
                    className={`py-1 w-24 ${INPUT_CLASS}`}
                    aria-label={`${prop.name} CEP Limite Inferior`}
                  />
                </td>
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="number"
                    step="any"
                    value={prop.cepUpperLimit}
                    onChange={(e) => onPropertyChange(prop.id, 'cepUpperLimit', e.target.value)}
                    className={`py-1 w-24 ${INPUT_CLASS}`}
                    aria-label={`${prop.name} CEP Limite Superior`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend for auto-calculated fields */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center text-sm text-green-700">
          <span className="mr-2">��</span>
          <span className="font-medium">Campos com Cálculo Automático:</span>
          <span className="ml-2">Peso Molecular, Densidade Relativa, Densidade Real, PCI</span>
        </div>
        <p className="text-xs text-green-600 mt-1">
          Valores calculados automaticamente baseados na composição. Você pode editá-los manualmente se necessário.
        </p>
      </div>
    </div>
  );
};

export default StandardPropertiesTable;
