import React, { useState } from 'react';
import { ReportData } from '../types';
import AGA8CriteriaIndicator from './AGA8CriteriaIndicator';
import { PART_TITLE_CLASS, LABEL_CLASS, INPUT_CLASS, TABLE_TH_CLASS, TABLE_TD_CLASS } from '../constants';
import StatusBadge from './ui/StatusBadge'; // Assuming StatusBadge is still useful
import { ValidationStatus } from '../types'; // For manual status setting

interface TechnicalValidationSectionWrapperProps {
  reportData: ReportData; // Mudando para ReportData completo para suportar AGA8CriteriaIndicator
  onAga8DataChange: (field: keyof ReportData['aga8ValidationData'], value: string) => void;
  onRegulatoryItemChange: (id: string, field: keyof ReportData['regulatoryComplianceItems'][0], value: string | ValidationStatus) => void;
  onSqcDataChange: (field: keyof ReportData['statisticalProcessControlData'], value: string) => void;
  // onTraceabilityDataChange: (field: keyof ReportData['traceabilityUncertaintyData'], value: string) => void; // Removed
}

// Sub-components will be defined here or imported if they grow large

const Aga8ValidationDisplay: React.FC<{data: ReportData['aga8ValidationData'], onChange: TechnicalValidationSectionWrapperProps['onAga8DataChange']}> = ({ data, onChange }) => {
  // Fields that can be auto-calculated
  const autoCalculatedFields = ['faixaPressaoValida', 'faixaTemperaturaValida', 'zCalculadoPorMetodo', 'consistenciaZCondPadraoZAmostragem'];
  
  const isAutoCalculated = (fieldId: string, value: string): boolean => {
    if (!autoCalculatedFields.includes(fieldId) || !value) return false;
    
    // Check if it's not a default/empty value
    const defaultValues = [
      '0 a 70 MPa (Típica)',
      '-30°C a 150°C (Típica)',
      '',
      'Consistente / Inconsistente / Pendente'
    ];
    
    return !defaultValues.includes(value);
  };

  const handleFieldChange = (field: keyof typeof data, value: string) => {
    onChange(field, value);
  };

  return (
    <div className="p-4 mb-4 bg-white rounded-xl shadow-inner">
      <h3 className="enhanced-section-title">11. VALIDAÇÃO AGA-8 (COMPRESSIBILIDADE E PROPRIEDADES TERMODINÂMICAS)</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="faixaPressaoValida" className={LABEL_CLASS}>Faixa de pressão válida:</label>
          <div className="relative">
            <input
              type="text"
              id="faixaPressaoValida"
              value={data.faixaPressaoValida}
              onChange={(e) => handleFieldChange('faixaPressaoValida', e.target.value)}
              className={`${INPUT_CLASS} ${
                isAutoCalculated('faixaPressaoValida', data.faixaPressaoValida) 
                  ? 'bg-green-50 border-green-300 text-green-800' 
                  : ''
              }`}
              placeholder="0 a 70 MPa (Típica)"
              title={
                isAutoCalculated('faixaPressaoValida', data.faixaPressaoValida) 
                  ? 'Valor detectado automaticamente baseado nas condições. Você pode editá-lo se necessário.' 
                  : ''
              }
            />
            {isAutoCalculated('faixaPressaoValida', data.faixaPressaoValida) && (
              <span 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
                title="Detectado automaticamente"
              >
                🔄
              </span>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="faixaTemperaturaValida" className={LABEL_CLASS}>Faixa de temperatura válida:</label>
          <div className="relative">
            <input
              type="text"
              id="faixaTemperaturaValida"
              value={data.faixaTemperaturaValida}
              onChange={(e) => handleFieldChange('faixaTemperaturaValida', e.target.value)}
              className={`${INPUT_CLASS} ${
                isAutoCalculated('faixaTemperaturaValida', data.faixaTemperaturaValida) 
                  ? 'bg-green-50 border-green-300 text-green-800' 
                  : ''
              }`}
              placeholder="-30°C a 150°C (Típica)"
              title={
                isAutoCalculated('faixaTemperaturaValida', data.faixaTemperaturaValida) 
                  ? 'Valor detectado automaticamente baseado nas condições. Você pode editá-lo se necessário.' 
                  : ''
              }
            />
            {isAutoCalculated('faixaTemperaturaValida', data.faixaTemperaturaValida) && (
              <span 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
                title="Detectado automaticamente"
              >
                🔄
              </span>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="faixaComposicaoCompativel" className={LABEL_CLASS}>Faixa de composição compatível com AGA-8:</label>
          <input 
            type="text" 
            id="faixaComposicaoCompativel" 
            value={data.faixaComposicaoCompativel} 
            className={`bg-gray-100 ${INPUT_CLASS}`} 
            placeholder="Automático" 
            readOnly 
            aria-label="Faixa de composição compatível com AGA-8 (Automático)"
            />
        </div>
        <div>
          <label htmlFor="zCalculadoPorMetodo" className={LABEL_CLASS}>Z calculado por AGA-8 Detalhado ou Gross Method:</label>
          <div className="relative">
            <input
              type="text"
              id="zCalculadoPorMetodo"
              value={data.zCalculadoPorMetodo}
              onChange={(e) => handleFieldChange('zCalculadoPorMetodo', e.target.value)}
              className={`${INPUT_CLASS} ${
                isAutoCalculated('zCalculadoPorMetodo', data.zCalculadoPorMetodo) 
                  ? 'bg-green-50 border-green-300 text-green-800' 
                  : ''
              }`}
              placeholder="Detalhado / Gross / N/A"
              title={
                isAutoCalculated('zCalculadoPorMetodo', data.zCalculadoPorMetodo) 
                  ? 'Método detectado automaticamente baseado nos dados disponíveis. Você pode editá-lo se necessário.' 
                  : ''
              }
            />
            {isAutoCalculated('zCalculadoPorMetodo', data.zCalculadoPorMetodo) && (
              <span 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
                title="Detectado automaticamente"
              >
                🔄
              </span>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="consistenciaZCondPadraoZAmostragem" className={LABEL_CLASS}>Consistência entre Z em condições padrão e Z da amostragem:</label>
          <div className="relative">
            <input
              type="text"
              id="consistenciaZCondPadraoZAmostragem"
              value={data.consistenciaZCondPadraoZAmostragem}
              onChange={(e) => handleFieldChange('consistenciaZCondPadraoZAmostragem', e.target.value)}
              className={`${INPUT_CLASS} ${
                isAutoCalculated('consistenciaZCondPadraoZAmostragem', data.consistenciaZCondPadraoZAmostragem) 
                  ? 'bg-green-50 border-green-300 text-green-800' 
                  : ''
              }`}
              placeholder="Consistente / Inconsistente / Pendente"
              title={
                isAutoCalculated('consistenciaZCondPadraoZAmostragem', data.consistenciaZCondPadraoZAmostragem) 
                  ? 'Consistência calculada automaticamente comparando os valores de Z. Você pode editá-lo se necessário.' 
                  : ''
              }
            />
            {isAutoCalculated('consistenciaZCondPadraoZAmostragem', data.consistenciaZCondPadraoZAmostragem) && (
              <span 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
                title="Calculado automaticamente"
              >
                🔄
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Legend for auto-calculated fields */}
      {(isAutoCalculated('faixaPressaoValida', data.faixaPressaoValida) ||
        isAutoCalculated('faixaTemperaturaValida', data.faixaTemperaturaValida) ||
        isAutoCalculated('zCalculadoPorMetodo', data.zCalculadoPorMetodo) ||
        isAutoCalculated('consistenciaZCondPadraoZAmostragem', data.consistenciaZCondPadraoZAmostragem)) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-sm text-green-700">
            <span className="mr-2">🔄</span>
            <span className="font-medium">Campos com Detecção Automática:</span>
            <span className="ml-2">Faixas AGA-8, Método Z, Consistência Z</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Valores detectados automaticamente baseados na composição, pressão e temperatura. 
            Você pode editá-los manualmente se necessário.
          </p>
        </div>
      )}
      
      {/* Mostrar Parâmetros AGA-8 Utilizados */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Parâmetros AGA-8 Utilizados:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="font-medium text-blue-700">Método:</span>
            <div className="text-blue-600">{data.zCalculadoPorMetodo || 'Detalhado (padrão)'}</div>
          </div>
          <div>
            <span className="font-medium text-blue-700">Faixa de Pressão:</span>
            <div className="text-blue-600">{data.faixaPressaoValida || '0 a 70 MPa'}</div>
          </div>
          <div>
            <span className="font-medium text-blue-700">Faixa de Temperatura:</span>
            <div className="text-blue-600">{data.faixaTemperaturaValida || '-30°C a 150°C'}</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          <span className="font-medium">Critério:</span> AGA-8 Detailed Characterization Method (ISO 12213-2)
        </div>
      </div>
    </div>
  );
};

const RegulatoryComplianceDisplay: React.FC<{items: ReportData['regulatoryComplianceItems'], onChange: TechnicalValidationSectionWrapperProps['onRegulatoryItemChange']}> = ({ items, onChange}) => {
  return (
    <div className="p-4 mb-4 bg-white rounded-xl shadow-inner">
      <h3 className="enhanced-section-title">12. CONFORMIDADE AGA-8 (AGA Report No. 8 - Detail Method)</h3>
       <div className="overflow-x-auto">
        <table className="min-w-full table-with-relief bg-white">
          <thead className="table-header-blue">
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
    <div className="p-4 mb-4 bg-white rounded-xl shadow-inner">
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
  const [showCriteriaDetails, setShowCriteriaDetails] = useState(false);

  return (
    <div className="mb-6">
      <h1 className={PART_TITLE_CLASS}>PARTE 2 - VALIDAÇÃO TÉCNICA E METROLÓGICA DOS RESULTADOS</h1>
      <div className="p-4 bg-gray-50 rounded-b-md shadow-md">
        
        {/* Indicador de seleção automática de critério AGA8 */}
        <AGA8CriteriaIndicator 
          reportData={reportData} 
          showDetails={showCriteriaDetails}
        />
        
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCriteriaDetails(!showCriteriaDetails)}
            className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none"
          >
            {showCriteriaDetails ? 'Ocultar detalhes' : 'Mostrar detalhes'} da seleção de critério
          </button>
        </div>
        
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