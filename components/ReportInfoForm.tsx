

import React from 'react';
import { ReportData, SolicitanteInfo, SampleInfo, BulletinInfo, ValidationStatus } from '../types';
import { INPUT_CLASS, LABEL_CLASS, SECTION_TITLE_CLASS } from '../constants';

interface DocumentAndSampleInfoFormProps {
  reportData: Pick<ReportData, 'objetivo' | 'solicitantInfo' | 'sampleInfo' | 'bulletinInfo' | 'numeroBoletim' | 'plataforma' | 'sistemaMedicao' | 'dateValidationDetails' >;
  onInputChange: (field: keyof ReportData, value: any) => void; // Can be string or nested object
  onNestedInputChange: (section: keyof ReportData, field: string, value: string) => void;
}

const DateValidationMessage: React.FC<{ status: ValidationStatus; message: string | null }> = ({ status, message }) => {
  if (status === ValidationStatus.ForaDaFaixa && message) {
    return <p className="text-xs text-red-600 mt-1">{message}</p>;
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

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl mb-6">
      
      <h2 className="enhanced-section-title">1. OBJETIVO DA ANÁLISE CRÍTICA</h2>
      <textarea
        id="objetivo"
        rows={3}
        value={reportData.objetivo}
        onChange={(e) => handleDirectChange('objetivo', e.target.value)}
        className={`${INPUT_CLASS} w-full mb-6`}
        placeholder="Descrever o objetivo da validação..."
        aria-label="Objetivo da Análise Crítica"
      />

      <h2 className="enhanced-section-title">2. INFORMAÇÕES DO SOLICITANTE</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="nomeClienteSolicitante" className={LABEL_CLASS}>Nome do Cliente/Solicitante:</label>
          <input type="text" id="nomeClienteSolicitante" value={reportData.solicitantInfo.nomeClienteSolicitante} onChange={(e) => handleSolicitantChange('nomeClienteSolicitante', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="enderecoLocalizacaoClienteSolicitante" className={LABEL_CLASS}>Endereço/Localização:</label>
          <input type="text" id="enderecoLocalizacaoClienteSolicitante" value={reportData.solicitantInfo.enderecoLocalizacaoClienteSolicitante} onChange={(e) => handleSolicitantChange('enderecoLocalizacaoClienteSolicitante', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="contatoResponsavelSolicitacao" className={LABEL_CLASS}>Contato/Responsável:</label>
          <input type="text" id="contatoResponsavelSolicitacao" value={reportData.solicitantInfo.contatoResponsavelSolicitacao} onChange={(e) => handleSolicitantChange('contatoResponsavelSolicitacao', e.target.value)} className={INPUT_CLASS} />
        </div>
      </div>

      <h2 className="enhanced-section-title">3. INFORMAÇÕES DA AMOSTRA</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="numeroAmostra" className={LABEL_CLASS}>Nº da Amostra:</label>
          <input type="text" id="numeroAmostra" value={reportData.sampleInfo.numeroAmostra} onChange={(e) => handleSampleChange('numeroAmostra', e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="dataHoraColeta" className={LABEL_CLASS}>Data e Hora da Coleta:</label>
          <input type="datetime-local" id="dataHoraColeta" value={reportData.sampleInfo.dataHoraColeta} onChange={(e) => handleSampleChange('dataHoraColeta', e.target.value)} className={INPUT_CLASS} />
           <DateValidationMessage status={validations.seq_coleta_recebLab.status} message={validations.seq_coleta_recebLab.message} />
           <DateValidationMessage status={validations.prazo_coleta_emissao_boletim.status} message={validations.prazo_coleta_emissao_boletim.message} />
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
          <label htmlFor="sistemaMedicao" className={LABEL_CLASS}>Sistema de Medição:</label>
          <input type="text" id="sistemaMedicao" value={reportData.sistemaMedicao} onChange={(e) => handleDirectChange('sistemaMedicao', e.target.value)} className={INPUT_CLASS} />
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

      <h2 className="enhanced-section-title">4. DADOS DO BOLETIM</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <label htmlFor="dataAnaliseLaboratorial" className={LABEL_CLASS}>Data Análise Laboratorial:</label>
          <input type="date" id="dataAnaliseLaboratorial" value={reportData.bulletinInfo.dataAnaliseLaboratorial} onChange={(e) => handleBulletinChange('dataAnaliseLaboratorial', e.target.value)} className={INPUT_CLASS} />
          <DateValidationMessage status={validations.seq_recebLab_analiseLab.status} message={validations.seq_recebLab_analiseLab.message} />
          <DateValidationMessage status={validations.seq_analiseLab_emissaoLab.status} message={validations.seq_analiseLab_emissaoLab.message} />
          <DateValidationMessage status={validations.rtm52_prazoEmissaoBoletim.status} message={validations.rtm52_prazoEmissaoBoletim.message} />
        </div>
        <div>
          <label htmlFor="dataEmissaoBoletim" className={LABEL_CLASS}>Data Emissão Boletim (Lab):</label>
          <input type="date" id="dataEmissaoBoletim" value={reportData.bulletinInfo.dataEmissaoBoletim} onChange={(e) => handleBulletinChange('dataEmissaoBoletim', e.target.value)} className={INPUT_CLASS} />
          <DateValidationMessage status={validations.seq_analiseLab_emissaoLab.status} message={validations.seq_analiseLab_emissaoLab.message} />
          <DateValidationMessage status={validations.rtm52_prazoEmissaoBoletim.status} message={validations.rtm52_prazoEmissaoBoletim.message} />
          <DateValidationMessage status={validations.seq_emissaoLab_recebSolic.status} message={validations.seq_emissaoLab_recebSolic.message} />
          <DateValidationMessage status={validations.prazo_coleta_emissao_boletim.status} message={validations.prazo_coleta_emissao_boletim.message} />
        </div>
        <div>
          <label htmlFor="dataRecebimentoBoletimSolicitante" className={LABEL_CLASS}>Data Recebimento Boletim (Solic.):</label>
          <input type="date" id="dataRecebimentoBoletimSolicitante" value={reportData.bulletinInfo.dataRecebimentoBoletimSolicitante} onChange={(e) => handleBulletinChange('dataRecebimentoBoletimSolicitante', e.target.value)} className={INPUT_CLASS} />
          <DateValidationMessage status={validations.seq_emissaoLab_recebSolic.status} message={validations.seq_emissaoLab_recebSolic.message} />
          <DateValidationMessage status={validations.seq_recebSolic_analiseCritica.status} message={validations.seq_recebSolic_analiseCritica.message} />
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