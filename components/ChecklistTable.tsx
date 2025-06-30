import React from 'react';
import { ChecklistItem, ChecklistStatus } from '../types';
import { INPUT_CLASS, TABLE_TH_CLASS, TABLE_TD_CLASS } from '../constants';

interface ChecklistTableProps {
  items: ChecklistItem[];
  onItemChange: (id: number, field: keyof ChecklistItem, value: any) => void;
}

const ChecklistTable: React.FC<ChecklistTableProps> = ({ items, onItemChange }) => {
  return (
    <div className="p-4 mb-6 bg-white rounded-xl shadow-md">
      <h2 className="enhanced-section-title">10. VERIFICAÇÃO DOCUMENTAL (ISO/IEC 17025) - CHECKLIST</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-with-relief bg-white">
          <thead className="table-header-blue">
            <tr>
              <th className={TABLE_TH_CLASS}>ITEM</th>
              <th className={TABLE_TH_CLASS}>DESCRIÇÃO</th>
              <th className={TABLE_TH_CLASS}>SIM</th>
              <th className={TABLE_TH_CLASS}>NÃO</th>
              <th className={TABLE_TH_CLASS}>NÃO APLICÁVEL</th>
              <th className={TABLE_TH_CLASS}>OBSERVAÇÃO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className={`text-center ${TABLE_TD_CLASS}`}>{index + 1}</td>
                <td className={`text-left ${TABLE_TD_CLASS}`}>{item.description}</td>
                {(Object.values(ChecklistStatus) as ChecklistStatus[]).map(statusValue => (
                  <td className={`text-center ${TABLE_TD_CLASS}`} key={statusValue}>
                    <input
                      type="radio"
                      name={`checklist-${item.id}`}
                      checked={item.status === statusValue}
                      onChange={() => onItemChange(item.id, 'status', statusValue)}
                      className="w-5 h-5 text-indigo-600 transition duration-150 ease-in-out form-radio"
                      aria-label={`${item.description} - ${statusValue}`}
                    />
                  </td>
                ))}
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="text"
                    value={item.observation}
                    onChange={(e) => onItemChange(item.id, 'observation', e.target.value)}
                    className={`py-1 ${INPUT_CLASS}`}
                    aria-label={`Observação para ${item.description}`}
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

export default ChecklistTable;
