import React from 'react';
import { ReportData } from '../types';
import { INPUT_CLASS, LABEL_CLASS, LIGHT_PURPLE_BACKGROUND } from '../constants';

interface ApprovalSectionProps {
  reportData: Pick<ReportData, 'responsavelAnaliseNome' | 'responsavelAnaliseData' | 'aprovacaoAnaliseNome' | 'aprovacaoAnaliseData'>;
  onInputChange: (field: keyof ReportData, value: string) => void;
}

const ApprovalSection: React.FC<ApprovalSectionProps> = ({ reportData, onInputChange }) => {
  return (
    <div className={`p-6 rounded-xl shadow-lg ${LIGHT_PURPLE_BACKGROUND}`}>
      <h2 className="mb-4 enhanced-section-title">15. RESPONSÁVEIS</h2>
              <div className="grid grid-cols-1 gap-6 p-4 bg-white rounded-xl shadow-inner md:grid-cols-2">
        <div>
          <h3 className="pb-1 mb-2 font-semibold text-gray-700 border-b text-md">15.1. Responsável pela Análise</h3>
          <label htmlFor="responsavelAnaliseNome" className={LABEL_CLASS}>Nome:</label>
          <input
            type="text"
            id="responsavelAnaliseNome"
            value={reportData.responsavelAnaliseNome}
            onChange={(e) => onInputChange('responsavelAnaliseNome', e.target.value)}
            className={INPUT_CLASS}
            aria-label="Nome do Responsável pela Análise"
          />
           <label htmlFor="responsavelAnaliseData" className={`mt-2 ${LABEL_CLASS}`}>Data:</label>
          <input
            type="date"
            id="responsavelAnaliseData"
            value={reportData.responsavelAnaliseData}
            onChange={(e) => onInputChange('responsavelAnaliseData', e.target.value)}
            className={INPUT_CLASS}
            aria-label="Data da Análise"
          />
        </div>
        <div>
          <h3 className="pb-1 mb-2 font-semibold text-gray-700 border-b text-md">15.2. Aprovação da Análise (Opcional)</h3>
          <label htmlFor="aprovacaoAnaliseNome" className={LABEL_CLASS}>Nome:</label>
          <input
            type="text"
            id="aprovacaoAnaliseNome"
            value={reportData.aprovacaoAnaliseNome}
            onChange={(e) => onInputChange('aprovacaoAnaliseNome', e.target.value)}
            className={INPUT_CLASS}
            aria-label="Nome do Aprovador da Análise"
          />
          <label htmlFor="aprovacaoAnaliseData" className={`mt-2 ${LABEL_CLASS}`}>Data:</label>
          <input
            type="date"
            id="aprovacaoAnaliseData"
            value={reportData.aprovacaoAnaliseData}
            onChange={(e) => onInputChange('aprovacaoAnaliseData', e.target.value)}
            className={INPUT_CLASS}
            aria-label="Data da Aprovação da Análise"
          />
        </div>
      </div>
    </div>
  );
};

export default ApprovalSection;