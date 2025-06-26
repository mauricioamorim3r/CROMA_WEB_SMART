/**
 * Modal de Entrada Manual de Dados - Análise Crítica de Boletins Analíticos
 * Estruturado conforme ISO/IEC 17025 e RTM ANP nº 52
 */

import React, { useState } from 'react';
import { ReportData, FinalDecisionStatus } from '../types';

interface ManualDataEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSubmit: (data: Partial<ReportData>) => void;
}

const ManualDataEntry: React.FC<ManualDataEntryProps> = ({
  isOpen,
  onClose,
  onDataSubmit
}) => {
  // PARTE 1 - VERIFICAÇÃO DOCUMENTAL DO BOLETIM
  
  // 1. Identificação do Registro
  const [numeroUnicoRastreabilidade, setNumeroUnicoRastreabilidade] = useState('');
  const [dataRealizacaoAnaliseCritica, setDataRealizacaoAnaliseCritica] = useState('');
  const [revisaoAnaliseCritica, setRevisaoAnaliseCritica] = useState('');

  // 2. Informações do Solicitante  
  const [nomeClienteSolicitante, setNomeClienteSolicitante] = useState('');
  const [contatoResponsavelSolicitacao, setContatoResponsavelSolicitacao] = useState('');

  // 3. Informações da Amostra
  const [numeroAmostra, setNumeroAmostra] = useState('');
  const [dataColeta, setDataColeta] = useState('');
  const [localColeta, setLocalColeta] = useState('');
  const [pontoColetaTAG, setPontoColetaTAG] = useState('');
  const [pocoApropriacao, setPocoApropriacao] = useState('');
  const [pressaoAmostraAbsoluta, setPressaoAmostraAbsoluta] = useState('');
  const [pressaoAmostraManometrica, setPressaoAmostraManometrica] = useState('');
  const [temperaturaAmostraK, setTemperaturaAmostraK] = useState('');
  const [temperaturaAmostraC, setTemperaturaAmostraC] = useState('');

  // 4. Dados do Boletim
  const [dataAnaliseLaboral, setDataAnaliseLaboral] = useState('');
  const [dataEmissaoBoletim, setDataEmissaoBoletim] = useState('');
  const [laboratorioEmissor, setLaboratorioEmissor] = useState('SGS');
  const [dataImplementacaoResultados, setDataImplementacaoResultados] = useState('');

  // 5. Composição Molar
  const [componentes, setComponentes] = useState({
    metano: { valor: '', incerteza: '' },
    etano: { valor: '', incerteza: '' },
    propano: { valor: '', incerteza: '' },
    iButano: { valor: '', incerteza: '' },
    nButano: { valor: '', incerteza: '' },
    iPentano: { valor: '', incerteza: '' },
    nPentano: { valor: '', incerteza: '' },
    hexano: { valor: '', incerteza: '' },
    heptano: { valor: '', incerteza: '' },
    octano: { valor: '', incerteza: '' },
    nonano: { valor: '', incerteza: '' },
    decano: { valor: '', incerteza: '' },
    nitrogenio: { valor: '', incerteza: '' },
    co2: { valor: '', incerteza: '' },
    oxigenio: { valor: '', incerteza: '' },
    h2s: { valor: '', incerteza: '' }
  });

  // 6. Propriedades do Gás
  const [propriedades, setPropriedades] = useState({
    pcs: { valor: '', incerteza: '' },
    pci: { valor: '', incerteza: '' },
    compressibilidadeZ: { valor: '', incerteza: '' },
    pesoMolecular: { valor: '', incerteza: '' },
    coeficienteAdiabatico: { valor: '', incerteza: '' },
    massaEspecifica: { valor: '', incerteza: '' }
  });

  // Observações
  const [observacoesBoletim, setObservacoesBoletim] = useState('');

  // PARTE 3 - CONCLUSÃO E DECISÃO FINAL
  const [decisaoFinal, setDecisaoFinal] = useState<FinalDecisionStatus | null>(null);
  const [justificativaTecnica, setJustificativaTecnica] = useState('');
  const [implementarComputadorVazao, setImplementarComputadorVazao] = useState(false);
  const [dataImplementacaoComputador, setDataImplementacaoComputador] = useState('');
  const [novaAmostragem, setNovaAmostragem] = useState(false);
  const [investigacaoCausaRaiz, setInvestigacaoCausaRaiz] = useState(false);
  const [contatoLaboratorio, setContatoLaboratorio] = useState(false);
  const [outraAcao, setOutraAcao] = useState(false);
  const [outraAcaoDescricao, setOutraAcaoDescricao] = useState('');
  const [responsavelAnaliseNome, setResponsavelAnaliseNome] = useState('');
  const [aprovacaoAnaliseNome, setAprovacaoAnaliseNome] = useState('');
  const [aprovacaoAnaliseData, setAprovacaoAnaliseData] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Criar dados estruturados
      const newData: Partial<ReportData> = {
        // Identificação do Registro
        numeroUnicoRastreabilidade,
        dataRealizacaoAnaliseCritica,
        revisaoAnaliseCritica,

        // Informações do Solicitante
        solicitantInfo: {
          nomeClienteSolicitante,
          enderecoLocalizacaoClienteSolicitante: '',
          contatoResponsavelSolicitacao
        },

        // Informações da Amostra
        sampleInfo: {
          numeroAmostra,
          dataHoraColeta: dataColeta,
          localColeta,
          pontoColetaTAG,
          pocoApropriacao,
          numeroCilindroAmostra: '',
          responsavelAmostragem: '',
          pressaoAmostraAbsolutaKpaA: pressaoAmostraAbsoluta,
          pressaoAmostraManometricaKpa: pressaoAmostraManometrica,
          temperaturaAmostraK,
          temperaturaAmostraC
        },

        // Dados do Boletim
        bulletinInfo: {
          dataRecebimentoAmostra: '',
          dataAnaliseLaboratorial: dataAnaliseLaboral,
          dataEmissaoBoletim,
          dataRecebimentoBoletimSolicitante: dataImplementacaoResultados,
          laboratorioEmissor,
          equipamentoCromatografoUtilizado: '',
          metodoNormativo: '',
          tipoProcesso: 'PROCESSO NORMAL' as any
        },

        // Componentes da Composição Molar
        components: [
          { id: 1, name: 'Metano (C₁)', molarPercent: componentes.metano.valor, incertezaAssociadaPercent: componentes.metano.incerteza, aga8Min: 0.5, aga8Max: 100, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 2, name: 'Etano (C₂)', molarPercent: componentes.etano.valor, incertezaAssociadaPercent: componentes.etano.incerteza, aga8Min: 0, aga8Max: 20, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 3, name: 'Propano (C₃)', molarPercent: componentes.propano.valor, incertezaAssociadaPercent: componentes.propano.incerteza, aga8Min: 0, aga8Max: 12, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 4, name: 'i-Butano (iC₄)', molarPercent: componentes.iButano.valor, incertezaAssociadaPercent: componentes.iButano.incerteza, aga8Min: 0, aga8Max: 3, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 5, name: 'n-Butano (nC₄)', molarPercent: componentes.nButano.valor, incertezaAssociadaPercent: componentes.nButano.incerteza, aga8Min: 0, aga8Max: 3, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 6, name: 'i-Pentano (iC₅)', molarPercent: componentes.iPentano.valor, incertezaAssociadaPercent: componentes.iPentano.incerteza, aga8Min: 0, aga8Max: 3, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 7, name: 'n-Pentano (nC₅)', molarPercent: componentes.nPentano.valor, incertezaAssociadaPercent: componentes.nPentano.incerteza, aga8Min: 0, aga8Max: 3, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 8, name: 'Hexano (C₆)', molarPercent: componentes.hexano.valor, incertezaAssociadaPercent: componentes.hexano.incerteza, aga8Min: 0, aga8Max: 0.2, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 9, name: 'Heptano (C₇)', molarPercent: componentes.heptano.valor, incertezaAssociadaPercent: componentes.heptano.incerteza, aga8Min: 0, aga8Max: 0.2, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 10, name: 'Octano (C₈)', molarPercent: componentes.octano.valor, incertezaAssociadaPercent: componentes.octano.incerteza, aga8Min: 0, aga8Max: 0.2, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 11, name: 'Nonano (C₉⁺)', molarPercent: componentes.nonano.valor, incertezaAssociadaPercent: componentes.nonano.incerteza, aga8Min: 0, aga8Max: 0.2, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 12, name: 'Decano (C₁₀)', molarPercent: componentes.decano.valor, incertezaAssociadaPercent: componentes.decano.incerteza, aga8Min: 0, aga8Max: 0.2, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 13, name: 'Nitrogênio (N₂)', molarPercent: componentes.nitrogenio.valor, incertezaAssociadaPercent: componentes.nitrogenio.incerteza, aga8Min: 0, aga8Max: 50, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 14, name: 'Dióxido de Carbono (CO₂)', molarPercent: componentes.co2.valor, incertezaAssociadaPercent: componentes.co2.incerteza, aga8Min: 0, aga8Max: 30, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 15, name: 'Oxigênio (O₂)', molarPercent: componentes.oxigenio.valor, incertezaAssociadaPercent: componentes.oxigenio.incerteza, aga8Min: 0, aga8Max: 21, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any },
          { id: 16, name: 'Sulfeto de Hidrogênio (H₂S)', molarPercent: componentes.h2s.valor, incertezaAssociadaPercent: componentes.h2s.incerteza, aga8Min: 0, aga8Max: 0.02, cepLowerLimit: '', cepUpperLimit: '', aga8Status: 'Pendente' as any, cepStatus: 'Pendente' as any }
        ].filter(comp => parseFloat(comp.molarPercent) > 0),

        // Propriedades do Gás
        standardProperties: [
          { id: 'pcs', name: 'PCS - Poder Calorífico Superior', value: propriedades.pcs.valor, referencia: 'kJ/m³', incertezaExpandida: propriedades.pcs.incerteza, cepLowerLimit: '', cepUpperLimit: '', cepStatus: 'Pendente' as any },
          { id: 'pci', name: 'PCI - Poder Calorífico Inferior', value: propriedades.pci.valor, referencia: 'kJ/m³', incertezaExpandida: propriedades.pci.incerteza, cepLowerLimit: '', cepUpperLimit: '', cepStatus: 'Pendente' as any },
          { id: 'compressibilityFactor', name: 'Compressibilidade Z (20°C / 1 atm)', value: propriedades.compressibilidadeZ.valor, referencia: 'Adimensional', incertezaExpandida: propriedades.compressibilidadeZ.incerteza, cepLowerLimit: '', cepUpperLimit: '', cepStatus: 'Pendente' as any },
          { id: 'molarMass', name: 'Peso Molecular Total', value: propriedades.pesoMolecular.valor, referencia: 'g/mol', incertezaExpandida: propriedades.pesoMolecular.incerteza, cepLowerLimit: '', cepUpperLimit: '', cepStatus: 'Pendente' as any },
          { id: 'adiabaticCoeff', name: 'Coeficiente Adiabático', value: propriedades.coeficienteAdiabatico.valor, referencia: 'Adimensional', incertezaExpandida: propriedades.coeficienteAdiabatico.incerteza, cepLowerLimit: '', cepUpperLimit: '', cepStatus: 'Pendente' as any },
          { id: 'specificMass', name: 'Massa Específica (20°C / 1 atm)', value: propriedades.massaEspecifica.valor, referencia: 'kg/m³', incertezaExpandida: propriedades.massaEspecifica.incerteza, cepLowerLimit: '', cepUpperLimit: '', cepStatus: 'Pendente' as any }
        ].filter(prop => parseFloat(prop.value) > 0),

        // Observações
        observacoesBoletim,

        // Conclusão e Decisão Final
        decisaoFinal,
        justificativaTecnica,
        acoesRecomendadas: {
          implementarComputadorVazao,
          dataImplementacaoComputadorVazao: dataImplementacaoComputador,
          novaAmostragem,
          investigacaoCausaRaiz,
          contatoComLaboratorio: contatoLaboratorio,
          outraAcaoRecomendada: outraAcao,
          outraAcaoRecomendadaDescricao: outraAcaoDescricao
        },
        responsavelAnaliseNome,
        aprovacaoAnaliseNome,
        aprovacaoAnaliseData
      };

      onDataSubmit(newData);
      onClose();
      
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      alert('Erro ao processar dados. Verifique os valores inseridos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalMolar = Object.values(componentes).reduce((sum, comp) => sum + (parseFloat(comp.valor) || 0), 0);

  return (
    <div className="overflow-y-auto fixed inset-0 z-50">
      <div className="flex justify-center items-center px-4 pt-4 pb-20 min-h-screen text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block w-full max-w-6xl px-6 py-4 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                📋 Análise Crítica de Boletins Analíticos - Cromatografia
              </h2>
              <p className="mt-1 text-gray-600">
                Entrada de dados conforme ISO/IEC 17025 e RTM ANP nº 52
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 rounded-lg transition-colors hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* PARTE 1 - VERIFICAÇÃO DOCUMENTAL DO BOLETIM */}
            <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="mb-4 text-xl font-bold text-blue-900">
                🔹 Parte 1 – Verificação Documental do Boletim (ISO/IEC 17025)
              </h3>
              
              {/* 1. Identificação do Registro */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-blue-800">1. Identificação do Registro</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Número único de rastreabilidade *
                    </label>
                    <input
                      type="text"
                      value={numeroUnicoRastreabilidade}
                      onChange={(e) => setNumeroUnicoRastreabilidade(e.target.value)}
                      required
                      placeholder="Ex: RAS-2024-001"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Data da realização da análise crítica *
                    </label>
                    <input
                      type="date"
                      value={dataRealizacaoAnaliseCritica}
                      onChange={(e) => setDataRealizacaoAnaliseCritica(e.target.value)}
                      required
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Revisão da análise crítica
                    </label>
                    <input
                      type="text"
                      value={revisaoAnaliseCritica}
                      onChange={(e) => setRevisaoAnaliseCritica(e.target.value)}
                      placeholder="Ex: Rev. 01"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Informações do Solicitante */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-blue-800">2. Informações do Solicitante</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Nome do Cliente/Solicitante *
                    </label>
                    <input
                      type="text"
                      value={nomeClienteSolicitante}
                      onChange={(e) => setNomeClienteSolicitante(e.target.value)}
                      required
                      placeholder="Ex: Petrobras S.A."
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Contato/Responsável pela solicitação
                    </label>
                    <input
                      type="text"
                      value={contatoResponsavelSolicitacao}
                      onChange={(e) => setContatoResponsavelSolicitacao(e.target.value)}
                      placeholder="Ex: João Silva - joao@empresa.com"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Informações da Amostra */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-blue-800">3. Informações da Amostra</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Número da amostra *</label>
                    <input
                      type="text"
                      value={numeroAmostra}
                      onChange={(e) => setNumeroAmostra(e.target.value)}
                      required
                      placeholder="Ex: AMT-2024-001"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Data da coleta *</label>
                    <input
                      type="date"
                      value={dataColeta}
                      onChange={(e) => setDataColeta(e.target.value)}
                      required
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Local da coleta</label>
                    <input
                      type="text"
                      value={localColeta}
                      onChange={(e) => setLocalColeta(e.target.value)}
                      placeholder="Ex: FPSO ATLANTA"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Ponto de coleta (TAG)</label>
                    <input
                      type="text"
                      value={pontoColetaTAG}
                      onChange={(e) => setPontoColetaTAG(e.target.value)}
                      placeholder="Ex: LP FUEL GAS"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Poço (apropriação)</label>
                    <input
                      type="text"
                      value={pocoApropriacao}
                      onChange={(e) => setPocoApropriacao(e.target.value)}
                      placeholder="Ex: ATL-001"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Pressão absoluta (kPa.a)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pressaoAmostraAbsoluta}
                      onChange={(e) => setPressaoAmostraAbsoluta(e.target.value)}
                      placeholder="Ex: 101.325"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Pressão manométrica (kPa)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pressaoAmostraManometrica}
                      onChange={(e) => setPressaoAmostraManometrica(e.target.value)}
                      placeholder="Ex: 0"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Temperatura (K)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={temperaturaAmostraK}
                      onChange={(e) => setTemperaturaAmostraK(e.target.value)}
                      placeholder="Ex: 293.15"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Temperatura (°C)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={temperaturaAmostraC}
                      onChange={(e) => setTemperaturaAmostraC(e.target.value)}
                      placeholder="Ex: 20"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Dados do Boletim */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-blue-800">4. Dados do Boletim</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Data da análise laboratorial *</label>
                    <input
                      type="date"
                      value={dataAnaliseLaboral}
                      onChange={(e) => setDataAnaliseLaboral(e.target.value)}
                      required
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Data de emissão do boletim *</label>
                    <input
                      type="date"
                      value={dataEmissaoBoletim}
                      onChange={(e) => setDataEmissaoBoletim(e.target.value)}
                      required
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Laboratório emissor</label>
                    <input
                      type="text"
                      value={laboratorioEmissor}
                      onChange={(e) => setLaboratorioEmissor(e.target.value)}
                      placeholder="Ex: SGS"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Data de implementação dos resultados</label>
                    <input
                      type="date"
                      value={dataImplementacaoResultados}
                      onChange={(e) => setDataImplementacaoResultados(e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Composição Molar */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-blue-800">
                  5. Composição Molar e Incertezas 
                  <span className={`ml-2 text-sm ${Math.abs(totalMolar - 100) <= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    Total: {totalMolar.toFixed(4)}%
                  </span>
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(componentes).map(([key, value]) => (
                    <div key={key} className="p-3 bg-white rounded-md border">
                      <h5 className="mb-2 text-sm font-medium text-gray-800">
                        {key === 'metano' && 'Metano (C₁)'}
                        {key === 'etano' && 'Etano (C₂)'}
                        {key === 'propano' && 'Propano (C₃)'}
                        {key === 'iButano' && 'i-Butano (iC₄)'}
                        {key === 'nButano' && 'n-Butano (nC₄)'}
                        {key === 'iPentano' && 'i-Pentano (iC₅)'}
                        {key === 'nPentano' && 'n-Pentano (nC₅)'}
                        {key === 'hexano' && 'Hexano (C₆)'}
                        {key === 'heptano' && 'Heptano (C₇)'}
                        {key === 'octano' && 'Octano (C₈)'}
                        {key === 'nonano' && 'Nonano (C₉⁺)'}
                        {key === 'decano' && 'Decano (C₁₀)'}
                        {key === 'nitrogenio' && 'Nitrogênio (N₂)'}
                        {key === 'co2' && 'Dióxido de Carbono (CO₂)'}
                        {key === 'oxigenio' && 'Oxigênio (O₂)'}
                        {key === 'h2s' && 'Sulfeto de Hidrogênio (H₂S)'}
                      </h5>
                      <div className="space-y-2">
                        <input
                          type="number"
                          step="0.0001"
                          value={value.valor}
                          onChange={(e) => setComponentes(prev => ({
                            ...prev,
                            [key]: { ...prev[key as keyof typeof prev], valor: e.target.value }
                          }))}
                          placeholder="% mol"
                          className="p-1 w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="number"
                          step="0.0001"
                          value={value.incerteza}
                          onChange={(e) => setComponentes(prev => ({
                            ...prev,
                            [key]: { ...prev[key as keyof typeof prev], incerteza: e.target.value }
                          }))}
                          placeholder="Incerteza %"
                          className="p-1 w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Propriedades do Gás */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-blue-800">6. Propriedades do Gás – Condições Padrão</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(propriedades).map(([key, value]) => (
                    <div key={key} className="p-3 bg-white rounded-md border">
                      <h5 className="mb-2 text-sm font-medium text-gray-800">
                        {key === 'pcs' && 'PCS (kJ/m³)'}
                        {key === 'pci' && 'PCI (kJ/m³)'}
                        {key === 'compressibilidadeZ' && 'Compressibilidade Z (20°C / 1 atm)'}
                        {key === 'pesoMolecular' && 'Peso Molecular Total (g/mol)'}
                        {key === 'coeficienteAdiabatico' && 'Coeficiente Adiabático'}
                        {key === 'massaEspecifica' && 'Massa Específica (kg/m³)'}
                      </h5>
                      <div className="space-y-2">
                        <input
                          type="number"
                          step="0.0001"
                          value={value.valor}
                          onChange={(e) => setPropriedades(prev => ({
                            ...prev,
                            [key]: { ...prev[key as keyof typeof prev], valor: e.target.value }
                          }))}
                          placeholder="Valor"
                          className="p-1 w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="number"
                          step="0.0001"
                          value={value.incerteza}
                          onChange={(e) => setPropriedades(prev => ({
                            ...prev,
                            [key]: { ...prev[key as keyof typeof prev], incerteza: e.target.value }
                          }))}
                          placeholder="Incerteza"
                          className="p-1 w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-blue-800">Observações</h4>
                <textarea
                  value={observacoesBoletim}
                  onChange={(e) => setObservacoesBoletim(e.target.value)}
                  placeholder="Inserir observações reportadas no boletim..."
                  rows={3}
                  className="p-3 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* PARTE 2 - VALIDAÇÃO TÉCNICA (INFORMATIVO) */}
            <div className="p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <h3 className="mb-4 text-xl font-bold text-yellow-900">
                🔸 Parte 2 – Validação Técnica e Metrológica dos Resultados
              </h3>
              <p className="mb-4 text-sm text-yellow-800">
                <strong>Nota:</strong> Esta seção é preenchida automaticamente pelo sistema após a inserção dos dados da Parte 1.
                Inclui validação AGA-8, conformidade regulatória ANP e controle estatístico de processo (CEP).
              </p>
            </div>

            {/* PARTE 3 - CONCLUSÃO E DECISÃO FINAL */}
            <div className="p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h3 className="mb-4 text-xl font-bold text-green-900">
                🔹 Parte 3 – Conclusão e Decisão Final
              </h3>
              
              {/* 8. Conclusão Final */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-green-800">8. Conclusão Final</h4>
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Decisão *</label>
                  <div className="space-y-2">
                    {Object.values(FinalDecisionStatus).map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="radio"
                          name="decisaoFinal"
                          value={status}
                          checked={decisaoFinal === status}
                          onChange={(e) => setDecisaoFinal(e.target.value as FinalDecisionStatus)}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          {status === FinalDecisionStatus.Validado && '✅ VALIDADO'}
                          {status === FinalDecisionStatus.ValidadoComRestricoes && '⚠️ VALIDADO COM RESTRIÇÕES'}
                          {status === FinalDecisionStatus.NaoValidadoReprovado && '❌ NÃO VALIDADO - REPROVADO'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Justificativa técnica *</label>
                  <textarea
                    value={justificativaTecnica}
                    onChange={(e) => setJustificativaTecnica(e.target.value)}
                    required
                    placeholder="Descrever a justificativa técnica para a decisão..."
                    rows={3}
                    className="p-3 w-full rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Ações recomendadas (seleção múltipla)</label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={implementarComputadorVazao}
                        onChange={(e) => setImplementarComputadorVazao(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Implementar no computador de vazão</span>
                      {implementarComputadorVazao && (
                        <input
                          type="date"
                          value={dataImplementacaoComputador}
                          onChange={(e) => setDataImplementacaoComputador(e.target.value)}
                          className="p-1 ml-3 text-sm rounded border border-gray-300 focus:ring-green-500 focus:border-green-500"
                        />
                      )}
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={novaAmostragem}
                        onChange={(e) => setNovaAmostragem(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Nova amostragem</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={investigacaoCausaRaiz}
                        onChange={(e) => setInvestigacaoCausaRaiz(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Investigação de causa raiz</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={contatoLaboratorio}
                        onChange={(e) => setContatoLaboratorio(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Contato com o laboratório</span>
                    </label>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={outraAcao}
                        onChange={(e) => setOutraAcao(e.target.checked)}
                        className="mt-1 mr-2"
                      />
                      <div className="flex-1">
                        <span className="text-sm">Outro:</span>
                        {outraAcao && (
                          <input
                            type="text"
                            value={outraAcaoDescricao}
                            onChange={(e) => setOutraAcaoDescricao(e.target.value)}
                            placeholder="Descrever outra ação..."
                            className="p-1 ml-2 w-full text-sm rounded border border-gray-300 focus:ring-green-500 focus:border-green-500"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 9. Responsável pela Análise */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-green-800">9. Responsável pela Análise</h4>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Nome *</label>
                  <input
                    type="text"
                    value={responsavelAnaliseNome}
                    onChange={(e) => setResponsavelAnaliseNome(e.target.value)}
                    required
                    placeholder="Nome do responsável pela análise crítica"
                    className="p-2 w-full rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* 10. Aprovação da Análise */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-green-800">10. Aprovação da Análise (opcional)</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Nome</label>
                    <input
                      type="text"
                      value={aprovacaoAnaliseNome}
                      onChange={(e) => setAprovacaoAnaliseNome(e.target.value)}
                      placeholder="Nome do aprovador"
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Data</label>
                    <input
                      type="date"
                      value={aprovacaoAnaliseData}
                      onChange={(e) => setAprovacaoAnaliseData(e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-between items-center pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 rounded-lg border border-gray-300 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !numeroUnicoRastreabilidade || !dataRealizacaoAnaliseCritica || !nomeClienteSolicitante || !decisaoFinal || !justificativaTecnica || !responsavelAnaliseNome}
                className="flex gap-2 items-center px-8 py-3 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '⏳ Processando...' : '💾 Salvar Análise Crítica'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualDataEntry; 