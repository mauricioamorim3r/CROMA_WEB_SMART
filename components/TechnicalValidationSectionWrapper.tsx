
import React from 'react';
import { ReportData } from '../types';
import { PART_TITLE_CLASS, SECTION_TITLE_CLASS, SUB_SECTION_TITLE_CLASS, LABEL_CLASS, INPUT_CLASS, TABLE_TH_CLASS, TABLE_TD_CLASS } from '../constants';
import StatusBadge from './ui/StatusBadge'; // Assuming StatusBadge is still useful
import { ValidationStatus } from '../types'; // For manual status setting

interface TechnicalValidationSectionWrapperProps {
  reportData: Pick<ReportData, 'aga8ValidationData' | 'regulatoryComplianceItems' | 'statisticalProcessControlData' >; // Removed traceabilityUncertaintyData
  onAga8DataChange: (field: keyof ReportData['aga8ValidationData'], value: string) => void;
  onRegulatoryItemChange: (id: string, field: keyof ReportData['regulatoryComplianceItems'][0], value: string | ValidationStatus) => void;
  onSqcDataChange: (field: keyof ReportData['statisticalProcessControlData'], value: string) => void;
  // onTraceabilityDataChange: (field: keyof ReportData['traceabilityUncertaintyData'], value: string) => void; // Removed
}

// Sub-components will be defined here or imported if they grow large

const Aga8ValidationDisplay: React.FC<{data: ReportData['aga8ValidationData'], onChange: TechnicalValidationSectionWrapperProps['onAga8DataChange']}> = ({ data, onChange }) => {
  return (
    <div className="bg-white p-4 shadow-inner rounded-xl mb-4">
      <h3 className="enhanced-section-title">11. VALIDAÇÃO AGA-8 (COMPRESSIBILIDADE E PROPRIEDADES TERMODINÂMICAS)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="faixaPressaoValida" className={LABEL_CLASS}>Faixa de pressão válida:</label>
          <input type="text" id="faixaPressaoValida" value={data.faixaPressaoValida} onChange={e => onChange('faixaPressaoValida', e.target.value)} className={INPUT_CLASS} placeholder="Ex: 0 a 70 MPa"/>
        </div>
        <div>
          <label htmlFor="faixaTemperaturaValida" className={LABEL_CLASS}>Faixa de temperatura válida:</label>
          <input type="text" id="faixaTemperaturaValida" value={data.faixaTemperaturaValida} onChange={e => onChange('faixaTemperaturaValida', e.target.value)} className={INPUT_CLASS} placeholder="Ex: -30°C a 150°C"/>
        </div>
        <div>
          <label htmlFor="faixaComposicaoCompativel" className={LABEL_CLASS}>Faixa de composição compatível com AGA-8:</label>
          <input 
            type="text" 
            id="faixaComposicaoCompativel" 
            value={data.faixaComposicaoCompativel} 
            className={`${INPUT_CLASS} bg-gray-100`} 
            placeholder="Automático" 
            readOnly 
            aria-label="Faixa de composição compatível com AGA-8 (Automático)"
            />
        </div>
        <div>
          <label htmlFor="zCalculadoPorMetodo" className={LABEL_CLASS}>Z calculado por AGA-8 Detalhado ou Gross Method:</label>
          <input type="text" id="zCalculadoPorMetodo" value={data.zCalculadoPorMetodo} onChange={e => onChange('zCalculadoPorMetodo', e.target.value)} className={INPUT_CLASS} placeholder="Detalhado / Gross / N/A"/>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="consistenciaZCondPadraoZAmostragem" className={LABEL_CLASS}>Consistência entre Z em condições padrão e Z da amostragem:</label>
          <input type="text" id="consistenciaZCondPadraoZAmostragem" value={data.consistenciaZCondPadraoZAmostragem} onChange={e => onChange('consistenciaZCondPadraoZAmostragem', e.target.value)} className={INPUT_CLASS} placeholder="Consistente / Inconsistente / Pendente"/>
        </div>
      </div>
    </div>
  );
};

const RegulatoryComplianceDisplay: React.FC<{items: ReportData['regulatoryComplianceItems'], onChange: TechnicalValidationSectionWrapperProps['onRegulatoryItemChange']}> = ({ items, onChange}) => {
  return (
    <div className="bg-white p-4 shadow-inner rounded-xl mb-4">
      <h3 className="enhanced-section-title">12. CONFORMIDADE REGULATÓRIA (RTM ANP N° 52 / PORTARIA ANP N° 16/2008)</h3>
       <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className={TABLE_TH_CLASS}>Parâmetro</th>
              <th className={TABLE_TH_CLASS}>Limite Regulatório</th>
              <th className={TABLE_TH_CLASS}>Valor Boletim</th>
              <th className={TABLE_TH_CLASS}>Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id}>
                <td className={TABLE_TD_CLASS}>{item.parameter}</td>
                <td className={TABLE_TD_CLASS}>{item.limit}</td>
                <td className={TABLE_TD_CLASS}>
                  <input 
                    type="text" 
                    value={item.bulletinValue} 
                    onChange={e => item.id === 'h2s_reg' ? onChange(item.id, 'bulletinValue', e.target.value) : undefined} 
                    className={`${INPUT_CLASS} py-1 ${item.id !== 'h2s_reg' ? 'bg-gray-100' : ''}`} 
                    readOnly={item.id !== 'h2s_reg'}
                    aria-label={`${item.parameter} Valor Boletim`}
                    />
                </td>
                <td className={TABLE_TD_CLASS}>
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatisticalProcessControlDisplay: React.FC<{data: ReportData['statisticalProcessControlData'], onChange: TechnicalValidationSectionWrapperProps['onSqcDataChange']}> = ({ data, onChange }) => {
  return (
    <div className="bg-white p-4 shadow-inner rounded-xl mb-4">
      <h3 className="enhanced-section-title">13. CONTROLE ESTATÍSTICO DE PROCESSO (CEP)</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="tendenciaHistoricaComposicao" className={LABEL_CLASS}>Tendência histórica da composição (comparada com boletins anteriores):</label>
          <textarea id="tendenciaHistoricaComposicao" value={data.tendenciaHistoricaComposicao} onChange={e => onChange('tendenciaHistoricaComposicao', e.target.value)} rows={2} className={INPUT_CLASS}></textarea>
        </div>
        <div>
          <label htmlFor="resultadosDentroFaixaCartasControle" className={LABEL_CLASS}>Resultados dentro da faixa das cartas de controle:</label>
          <input type="text" id="resultadosDentroFaixaCartasControle" value={data.resultadosDentroFaixaCartasControle} onChange={e => onChange('resultadosDentroFaixaCartasControle', e.target.value)} className={INPUT_CLASS} placeholder="Sim / Não / N/A"/>
        </div>
        <div>
          <label htmlFor="deteccaoDesviosSignificativos" className={LABEL_CLASS}>Detecção de desvios significativos (ex: quebra de tendência, outliers):</label>
          <textarea id="deteccaoDesviosSignificativos" value={data.deteccaoDesviosSignificativos} onChange={e => onChange('deteccaoDesviosSignificativos', e.target.value)} rows={2} className={INPUT_CLASS}></textarea>
        </div>
      </div>
    </div>
  );
};

// Removed TraceabilityUncertaintyDisplay component definition

// Removed ComparativeSummaryTable component definition

const TechnicalValidationSectionWrapper: React.FC<TechnicalValidationSectionWrapperProps> = ({ 
    reportData, 
    onAga8DataChange,
    onRegulatoryItemChange,
    onSqcDataChange,
    // onTraceabilityDataChange // Removed
}) => {
  return (
    <div className="mb-6">
      <h1 className={PART_TITLE_CLASS}>PARTE 2 - VALIDAÇÃO TÉCNICA E METROLÓGICA DOS RESULTADOS</h1>
      <div className="bg-gray-50 p-4 rounded-b-md shadow-md">
        <Aga8ValidationDisplay data={reportData.aga8ValidationData} onChange={onAga8DataChange} />
        <RegulatoryComplianceDisplay items={reportData.regulatoryComplianceItems} onChange={onRegulatoryItemChange} />
        <StatisticalProcessControlDisplay data={reportData.statisticalProcessControlData} onChange={onSqcDataChange} />
        {/* <TraceabilityUncertaintyDisplay data={reportData.traceabilityUncertaintyData} onChange={onTraceabilityDataChange} /> Removed */}
        {/* Removed ComparativeSummaryTable usage */}
      </div>
    </div>
  );
};

export default TechnicalValidationSectionWrapper;