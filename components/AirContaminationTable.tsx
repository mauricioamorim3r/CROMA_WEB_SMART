
import React from 'react';
import { AirContaminationProperty } from '../types';
import { INPUT_CLASS, TABLE_TH_CLASS, TABLE_TD_CLASS, SECTION_TITLE_CLASS } from '../constants';

interface AirContaminationTableProps {
  properties: AirContaminationProperty[];
  onPropertyChange: (id: string, field: keyof AirContaminationProperty, value: string) => void;
}

const AirContaminationTable: React.FC<AirContaminationTableProps> = ({ properties, onPropertyChange }) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-xl mb-6">
      <h2 className="enhanced-section-title">8. CONTAMINAÇÃO POR AR</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className={TABLE_TH_CLASS}>Componente</th>
              <th className={TABLE_TH_CLASS}>mol%</th>
              <th className={TABLE_TH_CLASS}>Referência</th>
              <th className={TABLE_TH_CLASS}>Incerteza Expandida (mol%)</th>
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
                    value={prop.molPercent}
                    onChange={(e) => onPropertyChange(prop.id, 'molPercent', e.target.value)}
                    className={`${INPUT_CLASS} w-32 py-1`}
                    aria-label={`${prop.name} Mol %`}
                  />
                </td>
                 <td className={TABLE_TD_CLASS}>
                  <input
                    type="text"
                    value={prop.referencia} // Typically "mol%" but could be editable if needed
                    onChange={(e) => onPropertyChange(prop.id, 'referencia', e.target.value)}
                    className={`${INPUT_CLASS} w-32 py-1`}
                    aria-label={`${prop.name} Referência`}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AirContaminationTable;
