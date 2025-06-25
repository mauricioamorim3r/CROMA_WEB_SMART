import React from 'react';
import { ReportData, FinalDecisionStatus, RecommendedActions, ValidationStatus } from '../types';
import StatusBadge from './ui/StatusBadge';
import { PART_TITLE_CLASS, SUB_SECTION_TITLE_CLASS, LABEL_CLASS, INPUT_CLASS, LIGHT_PURPLE_BACKGROUND } from '../constants';

const DateValidationMessage: React.FC<{ status: ValidationStatus; message: string | null }> = ({ status, message }) => {
  if (status === ValidationStatus.ForaDaFaixa && message) {
    return <p className="mt-1 text-xs text-red-600">{message}</p>;
  }
  if (status === ValidationStatus.OK && message) {
    return <p className="mt-1 text-xs text-green-600">{message}</p>;
  }
  return null;
};

interface FinalConclusionSectionProps {
  reportData: Pick<ReportData, 'decisaoFinal' | 'justificativaTecnica' | 'acoesRecomendadas' | 'referenciaCepStatus' | 'referenciaAga8Status' | 'referenciaChecklistStatus' | 'dateValidationDetails'>;
  onDecisionChange: (field: keyof Pick<ReportData, 'decisaoFinal' | 'justificativaTecnica'>, value: any) => void;
  onActionChange: (field: keyof RecommendedActions, value: any) => void;
  onDateActionChange: (value: string) => void;

}

const FinalConclusionSection: React.FC<FinalConclusionSectionProps> = ({ 
    reportData, 
    onDecisionChange,
    onActionChange,
    onDateActionChange
}) => {
  return (
    <div className="mb-6">
      <h1 className={PART_TITLE_CLASS}>PARTE 3 – CONCLUSÃO E DECISÃO FINAL</h1>
      <div className={`p-6 rounded-xl shadow-lg ${LIGHT_PURPLE_BACKGROUND}`}>
        <h3 className="mb-4 enhanced-section-title">14. CONCLUSÃO FINAL</h3>

        <div className="p-4 mb-6 bg-white rounded-xl shadow-inner">
            <h4 className={`mb-3 ${SUB_SECTION_TITLE_CLASS}`}>Status de Referência da Validação</h4>
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="font-medium text-gray-700">A.G.A #8:</span>
                    <StatusBadge status={reportData.referenciaAga8Status} />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="font-medium text-gray-700">CEP:</span>
                    <StatusBadge status={reportData.referenciaCepStatus} />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="font-medium text-gray-700">Checklist Documental:</span>
                    <StatusBadge status={reportData.referenciaChecklistStatus} />
                </div>
            </div>
        </div>


        <div className="p-4 bg-white rounded-xl shadow-inner">
            <div className="mb-4">
                <label htmlFor="decisaoFinal" className={LABEL_CLASS}>Decisão:</label>
                <select
                    id="decisaoFinal"
                    value={reportData.decisaoFinal || ''}
                    onChange={(e) => onDecisionChange('decisaoFinal', e.target.value as FinalDecisionStatus)}
                    className={INPUT_CLASS}
                    aria-label="Decisão Final"
                >
                    <option value="" disabled>Selecione uma decisão</option>
                    {Object.values(FinalDecisionStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            <div className="mb-6">
                <label htmlFor="justificativaTecnica" className={LABEL_CLASS}>Justificativa Técnica:</label>
                <textarea
                    id="justificativaTecnica"
                    rows={4}
                    value={reportData.justificativaTecnica}
                    onChange={(e) => onDecisionChange('justificativaTecnica', e.target.value)}
                    className={`w-full ${INPUT_CLASS}`}
                    aria-label="Justificativa Técnica"
                />
            </div>

            <div>
                <label className={`mb-2 ${LABEL_CLASS}`}>Ações Recomendadas:</label>
                <div className="space-y-4">
                    <div className="flex items-center mb-4">
                        <input type="checkbox" id="implementarComputadorVazao" checked={reportData.acoesRecomendadas.implementarComputadorVazao} onChange={(e) => onActionChange('implementarComputadorVazao', e.target.checked)} className="w-5 h-5 form-checkbox text-lime-custom focus:ring-lime-custom" />
                        <label htmlFor="implementarComputadorVazao" className="ml-2 text-sm text-gray-700">Implementar no computador de vazão</label>
                    </div>
                    {reportData.acoesRecomendadas.implementarComputadorVazao && (
                        <div className="ml-7">
                            <label htmlFor="dataImplementacaoComputadorVazao" className={`text-xs ${LABEL_CLASS}`}>Data de Implementação:</label>
                            <input type="date" id="dataImplementacaoComputadorVazao" value={reportData.acoesRecomendadas.dataImplementacaoComputadorVazao} onChange={(e) => onDateActionChange(e.target.value)} className={`py-1 text-sm ${INPUT_CLASS}`} />
                        </div>
                    )}
                     <div className="flex items-center">
                        <input type="checkbox" id="novaAmostragem" checked={reportData.acoesRecomendadas.novaAmostragem} onChange={(e) => onActionChange('novaAmostragem', e.target.checked)} className="w-5 h-5 form-checkbox text-lime-custom focus:ring-lime-custom" />
                        <label htmlFor="novaAmostragem" className="ml-2 text-sm text-gray-700">Nova amostragem</label>
                    </div>
                    {reportData.decisaoFinal === FinalDecisionStatus.NaoValidadoReprovado && reportData.acoesRecomendadas.novaAmostragem && (
                        <div className="ml-7">
                            <DateValidationMessage status={reportData.dateValidationDetails.anp52_novaAmostragem.status} message={reportData.dateValidationDetails.anp52_novaAmostragem.message} />
                        </div>
                    )}
                     <div className="flex items-center">
                        <input type="checkbox" id="investigacaoCausaRaiz" checked={reportData.acoesRecomendadas.investigacaoCausaRaiz} onChange={(e) => onActionChange('investigacaoCausaRaiz', e.target.checked)} className="w-5 h-5 form-checkbox text-lime-custom focus:ring-lime-custom" />
                        <label htmlFor="investigacaoCausaRaiz" className="ml-2 text-sm text-gray-700">Investigação de causa raiz</label>
                    </div>
                     <div className="flex items-center">
                        <input type="checkbox" id="contatoComLaboratorio" checked={reportData.acoesRecomendadas.contatoComLaboratorio} onChange={(e) => onActionChange('contatoComLaboratorio', e.target.checked)} className="w-5 h-5 form-checkbox text-lime-custom focus:ring-lime-custom" />
                        <label htmlFor="contatoComLaboratorio" className="ml-2 text-sm text-gray-700">Contato com o laboratório</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="outraAcaoRecomendada" checked={reportData.acoesRecomendadas.outraAcaoRecomendada} onChange={(e) => onActionChange('outraAcaoRecomendada', e.target.checked)} className="w-5 h-5 form-checkbox text-lime-custom focus:ring-lime-custom" />
                        <label htmlFor="outraAcaoRecomendada" className="ml-2 text-sm text-gray-700">Outro:</label>
                    </div>
                    {reportData.acoesRecomendadas.outraAcaoRecomendada && (
                         <div className="ml-7">
                            <input type="text" id="outraAcaoRecomendadaDescricao" value={reportData.acoesRecomendadas.outraAcaoRecomendadaDescricao} onChange={(e) => onActionChange('outraAcaoRecomendadaDescricao', e.target.value)} className={`py-1 w-full text-sm ${INPUT_CLASS}`} placeholder="Descrever outra ação"/>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FinalConclusionSection;