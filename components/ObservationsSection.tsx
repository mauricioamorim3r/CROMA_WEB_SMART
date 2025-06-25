
import React from 'react';
import { INPUT_CLASS } from '../constants';

interface ObservationsSectionProps {
  observacoes: string;
  onObservacoesChange: (value: string) => void;
}

const ObservationsSection: React.FC<ObservationsSectionProps> = ({ observacoes, onObservacoesChange }) => {
  return (
    <div className="p-4 mb-6 bg-white rounded-xl shadow-md">
      <h2 className="enhanced-section-title">9. OBSERVAÇÕES (DO BOLETIM)</h2>
      <textarea
        rows={4}
        value={observacoes}
        onChange={(e) => onObservacoesChange(e.target.value)}
        className={`w-full ${INPUT_CLASS}`}
        aria-label="Observações do boletim"
      />
    </div>
  );
};

export default ObservationsSection;
