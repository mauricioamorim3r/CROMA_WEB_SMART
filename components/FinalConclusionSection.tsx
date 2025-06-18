import React from 'react';
import { ReportData, FinalDecisionStatus, RecommendedActions } from '../types';
import StatusBadge from './ui/StatusBadge';
import { PART_TITLE_CLASS, SECTION_TITLE_CLASS, SUB_SECTION_TITLE_CLASS, LABEL_CLASS, INPUT_CLASS, LIGHT_PURPLE_BACKGROUND } from '../constants';

interface FinalConclusionSectionProps {
  reportData: Pick<ReportData, 'decisaoFinal' | 'justificativaTecnica' | 'acoesRecomendadas' | 'referenciaCepStatus' | 'referenciaAga8Status' | 'referenciaChecklistStatus'>;
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
      <div className={`p-6 shadow-lg rounded-xl ${LIGHT_PURPLE_BACKGROUND}`}>
        <h3 className="enhanced-section-title mb-4">14. CONCLUSÃO FINAL</h3>

        <div className="bg-white p-4 rounded-xl shadow-inner mb-6">
            <h4 className={`${SUB_SECTION_TITLE_CLASS} mb-3`}>Status de Referência da Validação</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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


        <div className="bg-white p-4 rounded-xl shadow-inner">
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
                    className={`${INPUT_CLASS} w-full`}
                    aria-label="Justificativa Técnica"
                />
            </div>

            <div>
                <label className={`${LABEL_CLASS} mb-2`}>Ações Recomendadas:</label>
                <div className="space-y-4">
                    <div className="flex items-center mb-4">
                        <input type="checkbox" id="implementarComputadorVazao" checked={reportData.acoesRecomendadas.implementarComputadorVazao} onChange={(e) => onActionChange('implementarComputadorVazao', e.target.checked)} className="form-checkbox h-5 w-5 text-lime-custom focus:ring-lime-custom" />
                        <label htmlFor="implementarComputadorVazao" className="ml-2 text-sm text-gray-700">Implementar no computador de vazão</label>
                    </div>
                    {reportData.acoesRecomendadas.implementarComputadorVazao && (
                        <div className="ml-7">
                            <label htmlFor="dataImplementacaoComputadorVazao" className={`${LABEL_CLASS} text-xs`}>Data de Implementação:</label>
                            <input type="date" id="dataImplementacaoComputadorVazao" value={reportData.acoesRecomendadas.dataImplementacaoComputadorVazao} onChange={(e) => onDateActionChange(e.target.value)} className={`${INPUT_CLASS} py-1 text-sm`} />
                        </div>
                    )}
                     <div className="flex items-center">
                        <input type="checkbox" id="novaAmostragem" checked={reportData.acoesRecomendadas.novaAmostragem} onChange={(e) => onActionChange('novaAmostragem', e.target.checked)} className="form-checkbox h-5 w-5 text-lime-custom focus:ring-lime-custom" />
                        <label htmlFor="novaAmostragem" className="ml-2 text-sm text-gray-700">Nova amostragem</label>
                    </div>
                     <div className="flex items-center">
                        <input type="checkbox" id="investigacaoCausaRaiz" checked={reportData.acoesRecomendadas.investigacaoCausaRaiz} onChange={(e) => onActionChange('investigacaoCausaRaiz', e.target.checked)} className="form-checkbox h-5 w-5 text-lime-custom focus:ring-lime-custom" />
                        <label htmlFor="investigacaoCausaRaiz" className="ml-2 text-sm text-gray-700">Investigação de causa raiz</label>
                    </div>
                     <div className="flex items-center">
                        <input type="checkbox" id="contatoComLaboratorio" checked={reportData.acoesRecomendadas.contatoComLaboratorio} onChange={(e) => onActionChange('contatoComLaboratorio', e.target.checked)} className="form-checkbox h-5 w-5 text-lime-custom focus:ring-lime-custom" />
                        <label htmlFor="contatoComLaboratorio" className="ml-2 text-sm text-gray-700">Contato com o laboratório</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="outraAcaoRecomendada" checked={reportData.acoesRecomendadas.outraAcaoRecomendada} onChange={(e) => onActionChange('outraAcaoRecomendada', e.target.checked)} className="form-checkbox h-5 w-5 text-lime-custom focus:ring-lime-custom" />
                        <label htmlFor="outraAcaoRecomendada" className="ml-2 text-sm text-gray-700">Outro:</label>
                    </div>
                    {reportData.acoesRecomendadas.outraAcaoRecomendada && (
                         <div className="ml-7">
                            <input type="text" id="outraAcaoRecomendadaDescricao" value={reportData.acoesRecomendadas.outraAcaoRecomendadaDescricao} onChange={(e) => onActionChange('outraAcaoRecomendadaDescricao', e.target.value)} className={`${INPUT_CLASS} py-1 text-sm w-full`} placeholder="Descrever outra ação"/>
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