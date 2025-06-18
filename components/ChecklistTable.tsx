
import React from 'react';
import { ChecklistItem, ChecklistStatus } from '../types';
import { INPUT_CLASS, TABLE_TH_CLASS, TABLE_TD_CLASS, SECTION_TITLE_CLASS } from '../constants';

interface ChecklistTableProps {
  items: ChecklistItem[];
  onItemChange: (id: number, field: keyof ChecklistItem, value: any) => void;
}

const ChecklistTable: React.FC<ChecklistTableProps> = ({ items, onItemChange }) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-xl mb-6">
      <h2 className="enhanced-section-title">10. VERIFICAÇÃO DOCUMENTAL (ISO/IEC 17025) - CHECKLIST</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead >
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
                <td className={`${TABLE_TD_CLASS} text-center`}>{index + 1}</td>
                <td className={`${TABLE_TD_CLASS} text-left`}>{item.description}</td>
                {(Object.values(ChecklistStatus) as ChecklistStatus[]).map(statusValue => (
                  <td className={`${TABLE_TD_CLASS} text-center`} key={statusValue}>
                    <input
                      type="radio"
                      name={`checklist-${item.id}`}
                      checked={item.status === statusValue}
                      onChange={() => onItemChange(item.id, 'status', statusValue)}
                      className="form-radio h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                      aria-label={`${item.description} - ${statusValue}`}
                    />
                  </td>
                ))}
                <td className={TABLE_TD_CLASS}>
                  <input
                    type="text"
                    value={item.observation}
                    onChange={(e) => onItemChange(item.id, 'observation', e.target.value)}
                    className={`${INPUT_CLASS} py-1`}
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
