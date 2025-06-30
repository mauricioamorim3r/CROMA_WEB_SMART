import React from 'react';
import { ReportData, SolicitanteInfo, SampleInfo, BulletinInfo, ValidationStatus, ProcessType } from '../types';
import { INPUT_CLASS, LABEL_CLASS } from '../constants';

interface DocumentAndSampleInfoFormProps {
  reportData: Pick<ReportData, 'objetivo' | 'solicitantInfo' | 'sampleInfo' | 'bulletinInfo' | 'numeroBoletim' | 'plataforma' | 'sistemaMedicao' | 'dateValidationDetails' >;
  onInputChange: (field: keyof ReportData, value: any) => void; // Can be string or nested object
  onNestedInputChange: (section: keyof ReportData, field: string, value: string) => void;
}

const DateValidationMessage: React.FC<{ status: ValidationStatus; message: string | null }> = ({ status, message }) => {
  if (status === ValidationStatus.ForaDaFaixa && message) {
    return (
      <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded">
        <p className="text-xs text-red-700 font-medium">⚠️ {message}</p>
      </div>
    );
  }
  if (status === ValidationStatus.OK && message) {
    return (
      <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded">
        <p className="text-xs text-green-700">✅ {message}</p>
      </div>
    );
  }
  return null;
};

const DocumentAndSampleInfoForm: React.FC<DocumentAndSampleInfoFormProps> = ({ reportData, onInputChange, onNestedInputChange }) => {
  
  const handleDirectChange = (field: keyof ReportData, value: string) => {
    onInputChange(field, value);
  };

  const handleSolicitantChange = (field: keyof SolicitanteInfo, value: string) => {
    onNestedInputChange('solicitantInfo', field, value);
  };

  const handleSampleChange = (field: keyof SampleInfo, value: string) => {
    onNestedInputChange('sampleInfo', field, value);
  };

  const handleBulletinChange = (field: keyof BulletinInfo, value: string) => {
    onNestedInputChange('bulletinInfo', field, value);
  };

  const validations = reportData.dateValidationDetails;

  // Verificar se há problemas específicos na seção de amostra (coleta)
  const hasSampleANP52Issues = (
    validations.anp52_prazoColetaEmissao.status === ValidationStatus.ForaDaFaixa ||
    validations.anp52_prazoColetaImplementacao.status === ValidationStatus.ForaDaFaixa
  );

  // Verificar se há problemas específicos na seção de boletim
  const hasBulletinANP52Issues = (
    validations.anp52_prazoColetaEmissao.status === ValidationStatus.ForaDaFaixa ||
    validations.anp52_prazoColetaImplementacao.status === ValidationStatus.ForaDaFaixa
  );

  return (
    <div className="p-6 mb-6 bg-white rounded-xl shadow-lg">
      
      <h2 className="enhanced-section-title">1. OBJETIVO DA ANÁLISE CRÍTICA</h2>
      <textarea
        id="objetivo"
        rows={3}
        value={reportData.objetivo}
        onChange={(e) => handleDirectChange('objetivo', e.target.value)}
        className={`mb-6 w-full ${INPUT_CLASS}`}
        placeholder="Descrever o objetivo da validação..."
        aria-label="Objetivo da Análise Crítica"
      />

      <h2 className="enhanced-section-title">2. INFORMAÇÕES DO SOLICITANTE</h2>
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="nomeClienteSolicitante" className={LABEL_CLASS}>Nome do Cliente/Solicitante:</label>
          <input type="text" id="nomeClienteSolicitante" value={reportData.solicitantInfo.nomeClienteSolicitante} onChange={(e) => handleSolicitantChange('nomeClienteSolicitante', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="enderecoLocalizacaoClienteSolicitante" className={LABEL_CLASS}>Endereço/Localização:</label>
          <input type="text" id="enderecoLocalizacaoClienteSolicitante" value={reportData.solicitantInfo.enderecoLocalizacaoClienteSolicitante} onChange={(e) => handleSolicitantChange('enderecoLocalizacaoClienteSolicitante', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="contatoResponsavelSolicitacao" className={LABEL_CLASS}>Contato Responsável:</label>
          <input type="text" id="contatoResponsavelSolicitacao" value={reportData.solicitantInfo.contatoResponsavelSolicitacao} onChange={(e) => handleSolicitantChange('contatoResponsavelSolicitacao', e.target.value)} className={INPUT_CLASS} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <h2 className="enhanced-section-title">3. INFORMAÇÕES DA AMOSTRA</h2>
        {hasSampleANP52Issues && (
          <div className="flex items-center gap-1 px-3 py-1 bg-red-100 border border-red-300 rounded-full">
            <span className="text-red-600 text-sm">⚠️</span>
            <span className="text-red-700 text-xs font-medium">Prazo ANP 52/2013</span>
          </div>
        )}
      </div>
      
      {hasSampleANP52Issues && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-800">Alerta de Prazo ANP 52/2013</p>
              <div className="mt-1 text-xs text-red-700">
                {validations.anp52_prazoColetaEmissao.status === ValidationStatus.ForaDaFaixa && (
                  <p>• Prazo entre coleta e emissão excedido</p>
                )}
                {validations.anp52_prazoColetaImplementacao.status === ValidationStatus.ForaDaFaixa && (
                  <p>• Prazo total do processo excedido</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="numeroAmostra" className={LABEL_CLASS}>Nº da Amostra:</label>
          <input type="text" id="numeroAmostra" value={reportData.sampleInfo.numeroAmostra} onChange={(e) => handleSampleChange('numeroAmostra', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="dataHoraColeta" className={LABEL_CLASS}>Data e Hora da Coleta:</label>
          <input type="datetime-local" id="dataHoraColeta" value={reportData.sampleInfo.dataHoraColeta} onChange={(e) => handleSampleChange('dataHoraColeta', e.target.value)} className={INPUT_CLASS} />
           <DateValidationMessage status={validations.seq_coleta_recebLab.status} message={validations.seq_coleta_recebLab.message} />
           <DateValidationMessage status={validations.anp52_prazoColetaEmissao.status} message={validations.anp52_prazoColetaEmissao.message} />
           <DateValidationMessage status={validations.anp52_prazoColetaImplementacao.status} message={validations.anp52_prazoColetaImplementacao.message} />
        </div>
        <div>
          <label htmlFor="localColeta" className={LABEL_CLASS}>Local da Coleta:</label>
          <input type="text" id="localColeta" value={reportData.sampleInfo.localColeta} onChange={(e) => handleSampleChange('localColeta', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="pontoColetaTAG" className={LABEL_CLASS}>Ponto de Coleta (TAG):</label>
          <input type="text" id="pontoColetaTAG" value={reportData.sampleInfo.pontoColetaTAG} onChange={(e) => handleSampleChange('pontoColetaTAG', e.target.value)} className={INPUT_CLASS} />
        </div>
         <div>
          <label htmlFor="plataforma" className={LABEL_CLASS}>Plataforma/Instalação:</label>
          <input type="text" id="plataforma" value={reportData.plataforma} onChange={(e) => handleDirectChange('plataforma', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="sistemaMedicao" className={LABEL_CLASS} translate="no">Sistema de Medição:</label>
          <input type="text" id="sistemaMedicao" value={reportData.sistemaMedicao} onChange={(e) => handleDirectChange('sistemaMedicao', e.target.value)} className={INPUT_CLASS} translate="no" />
        </div>
        <div>
          <label htmlFor="pocoApropriacao" className={LABEL_CLASS}>Poço (Apropriação):</label>
          <input type="text" id="pocoApropriacao" value={reportData.sampleInfo.pocoApropriacao} onChange={(e) => handleSampleChange('pocoApropriacao', e.target.value)} className={INPUT_CLASS} placeholder="Opcional" />
        </div>
        <div>
          <label htmlFor="numeroCilindroAmostra" className={LABEL_CLASS}>Nº Cilindro Amostra:</label>
          <input type="text" id="numeroCilindroAmostra" value={reportData.sampleInfo.numeroCilindroAmostra} onChange={(e) => handleSampleChange('numeroCilindroAmostra', e.target.value)} className={INPUT_CLASS} placeholder="Opcional" />
        </div>
        <div>
          <label htmlFor="responsavelAmostragem" className={LABEL_CLASS}>Responsável Amostragem:</label>
          <input type="text" id="responsavelAmostragem" value={reportData.sampleInfo.responsavelAmostragem} onChange={(e) => handleSampleChange('responsavelAmostragem', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="pressaoAmostraAbsolutaKpaA" className={LABEL_CLASS}>Pressão Amostra Absoluta (kPa.a):</label>
          <input type="number" id="pressaoAmostraAbsolutaKpaA" value={reportData.sampleInfo.pressaoAmostraAbsolutaKpaA} onChange={(e) => handleSampleChange('pressaoAmostraAbsolutaKpaA', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="pressaoAmostraManometricaKpa" className={LABEL_CLASS}>Pressão Amostra Manométrica (kPa):</label>
          <input type="number" id="pressaoAmostraManometricaKpa" value={reportData.sampleInfo.pressaoAmostraManometricaKpa} onChange={(e) => handleSampleChange('pressaoAmostraManometricaKpa', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="temperaturaAmostraK" className={LABEL_CLASS}>Temperatura Amostra (K):</label>
          <input type="number" id="temperaturaAmostraK" value={reportData.sampleInfo.temperaturaAmostraK} onChange={(e) => handleSampleChange('temperaturaAmostraK', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="temperaturaAmostraC" className={LABEL_CLASS}>Temperatura Amostra (°C):</label>
          <input type="number" id="temperaturaAmostraC" value={reportData.sampleInfo.temperaturaAmostraC} onChange={(e) => handleSampleChange('temperaturaAmostraC', e.target.value)} className={INPUT_CLASS} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <h2 className="enhanced-section-title">4. DADOS DO BOLETIM</h2>
        {hasBulletinANP52Issues && (
          <div className="flex items-center gap-1 px-3 py-1 bg-red-100 border border-red-300 rounded-full">
            <span className="text-red-600 text-sm">⚠️</span>
            <span className="text-red-700 text-xs font-medium">Prazo ANP 52/2013</span>
          </div>
        )}
      </div>

      {hasBulletinANP52Issues && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-800">Alerta de Prazo ANP 52/2013</p>
              <div className="mt-1 text-xs text-red-700">
                {validations.anp52_prazoColetaEmissao.status === ValidationStatus.ForaDaFaixa && (
                  <p>• Prazo entre coleta e emissão excedido (máx. 25 dias)</p>
                )}
                {validations.anp52_prazoColetaImplementacao.status === ValidationStatus.ForaDaFaixa && (
                  <p>• Prazo total do processo excedido (máx. 26-28 dias)</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
         <div>
          <label htmlFor="numeroBoletim" className={LABEL_CLASS}>Nº Boletim Analisado:</label>
          <input type="text" id="numeroBoletim" value={reportData.numeroBoletim} onChange={(e) => handleDirectChange('numeroBoletim', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="dataRecebimentoAmostra" className={LABEL_CLASS}>Data Recebimento Amostra (Lab):</label>
          <input type="date" id="dataRecebimentoAmostra" value={reportData.bulletinInfo.dataRecebimentoAmostra} onChange={(e) => handleBulletinChange('dataRecebimentoAmostra', e.target.value)} className={INPUT_CLASS} />
          <DateValidationMessage status={validations.seq_coleta_recebLab.status} message={validations.seq_coleta_recebLab.message} />
          <DateValidationMessage status={validations.seq_recebLab_analiseLab.status} message={validations.seq_recebLab_analiseLab.message} />
        </div>
        <div>
          <label htmlFor="tipoProcesso" className={LABEL_CLASS}>Tipo de Processo (ANP 52/2013):</label>
          <select 
            id="tipoProcesso" 
            value={reportData.bulletinInfo.tipoProcesso} 
            onChange={(e) => handleBulletinChange('tipoProcesso', e.target.value as ProcessType)} 
            className={INPUT_CLASS}
          >
            <option value={ProcessType.ProcessoNormal}>Processo Normal (28 dias)</option>
            <option value={ProcessType.ProcessoSemValidacao}>Processo sem Validação (26 dias)</option>
          </select>
          <p className="mt-1 text-xs text-gray-600">
            Processo Normal: Coleta + Transporte + Análise (25 dias) + Validação + Implementação (3 dias úteis)<br />
            Processo sem Validação: Coleta + Transporte + Análise (25 dias) + Implementação direta (1 dia útil)
          </p>
        </div>
        <div>
          <label htmlFor="dataAnaliseLaboratorial" className={LABEL_CLASS}>Data Análise Laboratorial:</label>
          <input type="date" id="dataAnaliseLaboratorial" value={reportData.bulletinInfo.dataAnaliseLaboratorial} onChange={(e) => handleBulletinChange('dataAnaliseLaboratorial', e.target.value)} className={INPUT_CLASS} />
          <DateValidationMessage status={validations.seq_recebLab_analiseLab.status} message={validations.seq_recebLab_analiseLab.message} />
          <DateValidationMessage status={validations.seq_analiseLab_emissaoLab.status} message={validations.seq_analiseLab_emissaoLab.message} />
        </div>
        <div>
          <label htmlFor="dataEmissaoBoletim" className={LABEL_CLASS}>Data Emissão Boletim (Lab):</label>
          <input type="date" id="dataEmissaoBoletim" value={reportData.bulletinInfo.dataEmissaoBoletim} onChange={(e) => handleBulletinChange('dataEmissaoBoletim', e.target.value)} className={INPUT_CLASS} />
          <DateValidationMessage status={validations.seq_analiseLab_emissaoLab.status} message={validations.seq_analiseLab_emissaoLab.message} />
          <DateValidationMessage status={validations.seq_emissaoLab_recebSolic.status} message={validations.seq_emissaoLab_recebSolic.message} />
          <DateValidationMessage status={validations.anp52_prazoColetaEmissao.status} message={validations.anp52_prazoColetaEmissao.message} />
          <DateValidationMessage status={validations.anp52_prazoColetaImplementacao.status} message={validations.anp52_prazoColetaImplementacao.message} />
        </div>
        <div>
          <label htmlFor="dataRecebimentoBoletimSolicitante" className={LABEL_CLASS}>Data Recebimento Boletim (Solic.):</label>
          <input type="date" id="dataRecebimentoBoletimSolicitante" value={reportData.bulletinInfo.dataRecebimentoBoletimSolicitante} onChange={(e) => handleBulletinChange('dataRecebimentoBoletimSolicitante', e.target.value)} className={INPUT_CLASS} />
          <DateValidationMessage status={validations.seq_emissaoLab_recebSolic.status} message={validations.seq_emissaoLab_recebSolic.message} />
          <DateValidationMessage status={validations.seq_recebSolic_analiseCritica.status} message={validations.seq_recebSolic_analiseCritica.message} />
        </div>
        <div>
          <label htmlFor="dataImplementacao" className={LABEL_CLASS}>Data Implementação:</label>
          <input type="date" id="dataImplementacao" value={reportData.bulletinInfo.dataImplementacao} onChange={(e) => handleBulletinChange('dataImplementacao', e.target.value)} className={INPUT_CLASS} />
          <DateValidationMessage status={validations.anp52_prazoColetaImplementacao.status} message={validations.anp52_prazoColetaImplementacao.message} />
          <p className="mt-1 text-xs text-gray-600">
            Data efetiva de implementação dos resultados na operação (ANP 52/2013)
          </p>
        </div>
        <div>
          <label htmlFor="laboratorioEmissor" className={LABEL_CLASS}>Laboratório Emissor:</label>
          <input type="text" id="laboratorioEmissor" value={reportData.bulletinInfo.laboratorioEmissor} onChange={(e) => handleBulletinChange('laboratorioEmissor', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="equipamentoCromatografoUtilizado" className={LABEL_CLASS}>Equipamento Utilizado:</label>
          <input type="text" id="equipamentoCromatografoUtilizado" value={reportData.bulletinInfo.equipamentoCromatografoUtilizado} onChange={(e) => handleBulletinChange('equipamentoCromatografoUtilizado', e.target.value)} className={INPUT_CLASS} placeholder="Opcional" />
        </div>
        <div>
          <label htmlFor="metodoNormativo" className={LABEL_CLASS}>Método Normativo:</label>
          <input type="text" id="metodoNormativo" value={reportData.bulletinInfo.metodoNormativo} onChange={(e) => handleBulletinChange('metodoNormativo', e.target.value)} className={INPUT_CLASS} placeholder="Ex: ISO 6976" />
        </div>
      </div>
    </div>
  );
};

export default DocumentAndSampleInfoForm;