import React from 'react';
import { SampleProperty } from '../types';
import StatusBadge from './ui/StatusBadge';
import { INPUT_CLASS, TABLE_TH_CLASS, TABLE_TD_CLASS, SECTION_TITLE_CLASS } from '../constants';

interface StandardPropertiesTableProps {
  properties: SampleProperty[];
  onPropertyChange: (id: string, field: keyof SampleProperty, value: string) => void;
}

const StandardPropertiesTable: React.FC<StandardPropertiesTableProps> = ({ properties, onPropertyChange }) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-xl mb-6">
      <h2 className="enhanced-section-title">6. PROPRIEDADES DO GÁS – CONDIÇÕES PADRÃO</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
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
                  <input
                    type="number"
                    step="any"
                    value={prop.value}
                    onChange={(e) => onPropertyChange(prop.id, 'value', e.target.value)}
                    className={`${INPUT_CLASS} w-32 py-1`}
                    aria-label={`${prop.name} Valor`}
                  />
                </td>
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="number"
                    step="any"
                    value={prop.incertezaExpandida}
                    onChange={(e) => onPropertyChange(prop.id, 'incertezaExpandida', e.target.value)}
                    className={`${INPUT_CLASS} w-32 py-1`}
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
                    className={`${INPUT_CLASS} w-24 py-1`}
                    aria-label={`${prop.name} CEP Limite Inferior`}
                  />
                </td>
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="number"
                    step="any"
                    value={prop.cepUpperLimit}
                    onChange={(e) => onPropertyChange(prop.id, 'cepUpperLimit', e.target.value)}
                    className={`${INPUT_CLASS} w-24 py-1`}
                    aria-label={`${prop.name} CEP Limite Superior`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandardPropertiesTable;
