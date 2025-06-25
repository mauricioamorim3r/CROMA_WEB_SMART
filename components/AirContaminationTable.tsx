import React from 'react';
import { AirContaminationProperty } from '../types';
import { INPUT_CLASS, TABLE_TH_CLASS, TABLE_TD_CLASS } from '../constants';

interface AirContaminationTableProps {
  properties: AirContaminationProperty[];
  onPropertyChange: (id: string, field: keyof AirContaminationProperty, value: string) => void;
}

const AirContaminationTable: React.FC<AirContaminationTableProps> = ({ properties, onPropertyChange }) => {
  // Fields that can be auto-calculated
  const autoCalculatedFields = ['nitrogenFromAir', 'totalAir'];
  
  const isAutoCalculated = (fieldId: string, value: string): boolean => {
    return autoCalculatedFields.includes(fieldId) && !!value && parseFloat(value) > 0;
  };

  return (
    <div className="p-4 mb-6 bg-white rounded-xl shadow-md">
      <h2 className="enhanced-section-title">8. CONTAMINAÇÃO POR AR</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className={TABLE_TH_CLASS}>Contaminante</th>
              <th className={TABLE_TH_CLASS}>% mol</th>
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
                      value={prop.molPercent}
                      onChange={(e) => onPropertyChange(prop.id, 'molPercent', e.target.value)}
                      className={`py-1 w-32 ${INPUT_CLASS} ${
                        isAutoCalculated(prop.id, prop.molPercent) 
                          ? 'bg-green-50 border-green-300 text-green-800' 
                          : ''
                      }`}
                      aria-label={`${prop.name} Mol %`}
                      title={
                        isAutoCalculated(prop.id, prop.molPercent) 
                          ? 'Valor calculado automaticamente. Você pode editá-lo se necessário.' 
                          : ''
                      }
                    />
                    {isAutoCalculated(prop.id, prop.molPercent) && (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend for auto-calculated fields */}
      {properties.some(prop => isAutoCalculated(prop.id, prop.molPercent)) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-sm text-green-700">
            <span className="mr-2">🔄</span>
            <span className="font-medium">Campos com Cálculo Automático:</span>
            <span className="ml-2">N₂ do Ar, Total do Ar</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            N₂ calculado automaticamente baseado na proporção atmosférica com O₂ (79.05/20.95). 
            Você pode editá-los manualmente se necessário.
          </p>
        </div>
      )}
    </div>
  );
};

export default AirContaminationTable;
