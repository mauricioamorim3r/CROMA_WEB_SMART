/**
 * Modal de Entrada Manual - Interface para entrada de dados cromatográficos
 * Integra o componente ManualDataEntry em um modal responsivo
 */

import React, { useState } from 'react';
import ManualDataEntry from './ManualDataEntry';
import { ReportData } from '../types';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSubmit: (data: Partial<ReportData>) => void;
}

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onDataSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDataSubmit = async (data: Partial<ReportData>) => {
    setIsSubmitting(true);
    try {
      await onDataSubmit(data);
      // Modal será fechado pelo ManualDataEntry após sucesso
    } catch (error) {
      console.error('Erro ao processar dados:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return; // Não permitir fechar durante submissão
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Entrada Manual de Dados - Análise Crítica de Boletins Analíticos
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`text-gray-500 hover:text-gray-700 text-2xl font-bold ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ×
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <ManualDataEntry
            isOpen={isOpen}
            onClose={handleClose}
            onDataSubmit={handleDataSubmit}
          />
        </div>
        
        {isSubmitting && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Processando dados...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualEntryModal; 