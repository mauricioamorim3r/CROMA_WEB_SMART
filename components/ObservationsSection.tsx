
import React from 'react';
import { INPUT_CLASS, SECTION_TITLE_CLASS } from '../constants';

interface ObservationsSectionProps {
  observacoes: string;
  onObservacoesChange: (value: string) => void;
}

const ObservationsSection: React.FC<ObservationsSectionProps> = ({ observacoes, onObservacoesChange }) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-xl mb-6">
      <h2 className="enhanced-section-title">9. OBSERVAÇÕES (DO BOLETIM)</h2>
      <textarea
        rows={4}
        value={observacoes}
        onChange={(e) => onObservacoesChange(e.target.value)}
        className={`${INPUT_CLASS} w-full`}
        aria-label="Observações do boletim"
      />
    </div>
  );
};

export default ObservationsSection;
