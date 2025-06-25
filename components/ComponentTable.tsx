import React from 'react';
import { ComponentData } from '../types';
import StatusBadge from './ui/StatusBadge';
import { INPUT_CLASS, TABLE_TH_CLASS, TABLE_TD_CLASS } from '../constants';

interface ComponentTableProps {
  components: ComponentData[];
  onComponentChange: (id: number, field: keyof ComponentData, value: string | number) => void;
  onComponentBlur?: (id: number, field: keyof ComponentData, componentName: string) => void;
  molarValidation?: { isValid: boolean; total: number; message: string };
}

const ComponentTable: React.FC<ComponentTableProps> = ({ components, onComponentChange, onComponentBlur, molarValidation }) => {
  const totalMolarPercent = components.reduce((sum, comp) => {
    const percent = parseFloat(comp.molarPercent);
    return sum + (isNaN(percent) ? 0 : percent);
  }, 0);

  return (
    <div className="p-4 mb-6 bg-white rounded-xl shadow-md">
      <h2 className="enhanced-section-title">5. COMPOSIÇÃO MOLAR E INCERTEZAS</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className={TABLE_TH_CLASS} rowSpan={2}>Item</th>
              <th className={TABLE_TH_CLASS} rowSpan={2}>Componente</th>
              <th className={TABLE_TH_CLASS} rowSpan={2}>% Molar</th>
              <th className={TABLE_TH_CLASS} colSpan={1}>Incerteza Associada</th>
              <th className={TABLE_TH_CLASS} rowSpan={2}>Status A.G.A 8</th>
              <th className={TABLE_TH_CLASS} rowSpan={2}>Status CEP</th>
              <th className={TABLE_TH_CLASS} colSpan={2}>A.G.A 8 Limites</th>
              <th className={TABLE_TH_CLASS} colSpan={2}>CEP Limites</th>
            </tr>
            <tr>
              <th className={TABLE_TH_CLASS}>%</th>
              <th className={TABLE_TH_CLASS}>Inferior</th>
              <th className={TABLE_TH_CLASS}>Superior</th>
              <th className={TABLE_TH_CLASS}>Inferior</th>
              <th className={TABLE_TH_CLASS}>Superior</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {components.map((comp, index) => (
              <tr key={comp.id}>
                <td className={`text-center ${TABLE_TD_CLASS}`}>{index + 1}</td>
                <td className={TABLE_TD_CLASS}>{comp.name}</td>
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="number"
                    step="any"
                    value={comp.molarPercent}
                    onChange={(e) => onComponentChange(comp.id, 'molarPercent', e.target.value)}
                    onBlur={() => onComponentBlur?.(comp.id, 'molarPercent', comp.name)}
                    className={`py-1 w-24 ${INPUT_CLASS}`}
                    aria-label={`${comp.name} % Molar`}
                  />
                </td>
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="number"
                    step="any"
                    value={comp.incertezaAssociadaPercent}
                    onChange={(e) => onComponentChange(comp.id, 'incertezaAssociadaPercent', e.target.value)}
                    className={`py-1 w-20 ${INPUT_CLASS}`}
                    aria-label={`${comp.name} Incerteza %`}
                  />
                </td>
                <td className={TABLE_TD_CLASS}><StatusBadge status={comp.aga8Status} /></td>
                <td className={TABLE_TD_CLASS}><StatusBadge status={comp.cepStatus} /></td>
                <td className={`text-center ${TABLE_TD_CLASS}`}>{comp.aga8Min.toFixed(2)}</td>
                <td className={`text-center ${TABLE_TD_CLASS}`}>{comp.aga8Max.toFixed(2)}</td>
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="number"
                    step="any"
                    value={comp.cepLowerLimit}
                    onChange={(e) => onComponentChange(comp.id, 'cepLowerLimit', e.target.value)}
                    className={`py-1 w-24 ${INPUT_CLASS}`}
                    aria-label={`${comp.name} CEP Limite Inferior`}
                  />
                </td>
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="number"
                    step="any"
                    value={comp.cepUpperLimit}
                    onChange={(e) => onComponentChange(comp.id, 'cepUpperLimit', e.target.value)}
                    className={`py-1 w-24 ${INPUT_CLASS}`}
                    aria-label={`${comp.name} CEP Limite Superior`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={2} className={`font-bold text-right ${TABLE_TD_CLASS}`}>Total Molar:</td>
              <td className={`${TABLE_TD_CLASS} font-bold text-center ${molarValidation && !molarValidation.isValid ? 'text-red-600 bg-red-50' : 'text-green-600'}`}>
                {totalMolarPercent.toFixed(4)} %
                {molarValidation && (
                  <div className="mt-1 text-xs">
                    {molarValidation.isValid ? '✅ Balanceado' : '⚠️ Fora do balanço'}
                  </div>
                )}
              </td>
              <td colSpan={7} className={TABLE_TD_CLASS}>
                {molarValidation && !molarValidation.isValid && (
                  <div className="text-xs italic text-red-600">
                    Esperado: 100% ± 0.1%
                  </div>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ComponentTable;