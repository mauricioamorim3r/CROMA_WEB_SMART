import React from 'react';
import { INPUT_CLASS } from '../constants';

interface ObservationsSectionProps {
  observacoes: string;
  onObservacoesChange: (value: string) => void;
}

const ObservationsSection: React.FC<ObservationsSectionProps> = ({ observacoes, onObservacoesChange }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg">
      <div className="p-4 bg-blue-800 rounded-t-lg border-b border-gray-200">
        <h2 className="enhanced-section-title">7. OBSERVAÇÕES (DO BOLETIM)</h2>
      </div>
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
