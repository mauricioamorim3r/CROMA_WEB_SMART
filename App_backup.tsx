// cSpell:ignore Solicitante
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { captureError, addBreadcrumb } from './src/config/sentry';
import { atualizarValidacaoAGA8Automatica, escolherCriterioAGA8 } from './aga8-criteria-validator';
import { getComponentMolarMass } from './aga8-parameters';
import { 
  ReportData, ComponentData, SampleProperty, ValidationStatus, ChecklistStatus, 
  DateValidationDetails, ProcessType, FinalDecisionStatus
} from './types';
import { 
  INITIAL_COMPONENTS, INITIAL_CHECKLIST_ITEMS, INITIAL_STANDARD_PROPERTIES, 
  INITIAL_SAMPLING_CONDITION_PROPERTIES, INITIAL_AIR_CONTAMINATION_PROPERTIES,
  INITIAL_REGULATORY_COMPLIANCE_ITEMS,
  INITIAL_DATE_VALIDATION_DETAILS, ANP52_PRAZO_COLETA_EMISSAO_DIAS,
  ANP52_PRAZO_PROCESSO_NORMAL_DIAS, ANP52_PRAZO_PROCESSO_SEM_VALIDACAO_DIAS,
  ANP52_PRAZO_NOVA_AMOSTRAGEM_DIAS_UTEIS
} from './constants';
import NotificationSystem from './components/ui/NotificationSystem';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ManualEntryModal from './components/ManualEntryModal';
import CEPHistoryViewer from './components/CEPHistoryViewer';
import StatusBadge from './components/ui/StatusBadge';
import { useCEPValidation } from './src/hooks/useCEPValidation';

// Notification system
interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

// Validation functions
const validateMolarComposition = (components: ComponentData[]): { isValid: boolean; total: number; message: string } => {
  const total = components.reduce((sum, comp) => {
    const percent = parseFloat(comp.molarPercent);
    return sum + (isNaN(percent) ? 0 : percent);
  }, 0);
  
  const tolerance = 0.1; // 0.1% tolerance
  const isValid = Math.abs(total - 100) <= tolerance;
  
  return {
    isValid,
    total,
    message: isValid 
      ? `Composição balanceada: ${total.toFixed(4)}%`
      : `Composição fora do balanço: ${total.toFixed(4)}% (esperado: 100% ± ${tolerance}%)`
  };
};

const validateRequiredFields = (reportData: ReportData): { isValid: boolean; missingFields: string[] } => {
  const requiredFields = [
    { field: reportData.numeroUnicoRastreabilidade, name: 'Número Único de Rastreabilidade' },
    { field: reportData.numeroBoletim, name: 'Número do Boletim' },
    { field: reportData.solicitantInfo.nomeClienteSolicitante, name: 'Nome do Cliente/Solicitante' },
    { field: reportData.sampleInfo.numeroAmostra, name: 'Número da Amostra' },
    { field: reportData.sampleInfo.dataHoraColeta, name: 'Data e Hora da Coleta' },
    { field: reportData.bulletinInfo.dataEmissaoBoletim, name: 'Data de Emissão do Boletim' },
    { field: reportData.bulletinInfo.laboratorioEmissor, name: 'Laboratório Emissor' }
  ];

  const missingFields = requiredFields
    .filter(item => !item.field || item.field.trim() === '')
    .map(item => item.name);

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

const getInitialReportData = (): ReportData => ({
  numeroUnicoRastreabilidade: '',
  dataRealizacaoAnaliseCritica: new Date().toISOString().split('T')[0],
  revisaoAnaliseCritica: '',
  
  objetivo: 'Validar os resultados analíticos do boletim cromatográfico, assegurando a consistência dos dados e conformidade com A.G.A Report Nº8, requisitos regulatórios e critérios estatísticos de processo (CEP).',
  
  solicitantInfo: {
    nomeClienteSolicitante: '',
    enderecoLocalizacaoClienteSolicitante: '',
    contatoResponsavelSolicitacao: '',
  },
  sampleInfo: {
    numeroAmostra: '',
    dataHoraColeta: '',
    localColeta: '',
    pontoColetaTAG: '',
    pocoApropriacao: '',
    numeroCilindroAmostra: '',
    responsavelAmostragem: '',
    pressaoAmostraAbsolutaKpaA: '',
    pressaoAmostraManometricaKpa: '',
    temperaturaAmostraK: '',
    temperaturaAmostraC: '',
  },
  bulletinInfo: {
    dataRecebimentoAmostra: '',
    dataAnaliseLaboratorial: '',
    dataEmissaoBoletim: '',
    dataRecebimentoBoletimSolicitante: '',
    laboratorioEmissor: '',
    equipamentoCromatografoUtilizado: '',
    metodoNormativo: '',
    tipoProcesso: ProcessType.ProcessoNormal,
  },
  numeroBoletim: '', 
  plataforma: '', 
  sistemaMedicao: '', 
  
  dateValidationDetails: JSON.parse(JSON.stringify(INITIAL_DATE_VALIDATION_DETAILS)),

  checklistItems: JSON.parse(JSON.stringify(INITIAL_CHECKLIST_ITEMS)),
  components: JSON.parse(JSON.stringify(INITIAL_COMPONENTS)),
  standardProperties: JSON.parse(JSON.stringify(INITIAL_STANDARD_PROPERTIES)),
  samplingConditionsProperties: JSON.parse(JSON.stringify(INITIAL_SAMPLING_CONDITION_PROPERTIES)),
  airContaminationProperties: JSON.parse(JSON.stringify(INITIAL_AIR_CONTAMINATION_PROPERTIES)),
  
  observacoesBoletim: '',

  aga8ValidationData: {
    faixaPressaoValida: '0 a 70 MPa (Típica)',
    faixaTemperaturaValida: '-30°C a 150°C (Típica)',
    faixaComposicaoCompativel: ValidationStatus.Pendente as string, 
    zCalculadoPorMetodo: '',
    consistenciaZCondPadraoZAmostragem: '',
  },
  regulatoryComplianceItems: JSON.parse(JSON.stringify(INITIAL_REGULATORY_COMPLIANCE_ITEMS)),
  statisticalProcessControlData: {
    tendenciaHistoricaComposicao: '',
    resultadosDentroFaixaCartasControle: '',
    deteccaoDesviosSignificativos: '',
  },
  
  decisaoFinal: null,
  justificativaTecnica: '',
  acoesRecomendadas: {
    implementarComputadorVazao: false,
    dataImplementacaoComputadorVazao: '',
    novaAmostragem: false,
    investigacaoCausaRaiz: false,
    contatoComLaboratorio: false,
    outraAcaoRecomendada: false,
    outraAcaoRecomendadaDescricao: '',
  },
  
  referenciaCepStatus: ValidationStatus.Pendente,
  referenciaAga8Status: ValidationStatus.Pendente,
  referenciaChecklistStatus: ValidationStatus.Pendente,
  
  responsavelAnaliseNome: '',
  responsavelAnaliseData: '',
  aprovacaoAnaliseNome: '',
  aprovacaoAnaliseData: '',
});


// Main application component
const App: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>(getInitialReportData());
  const [fontSizePercentage] = useState<number>(100);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [molarValidation, setMolarValidation] = useState({ isValid: true, total: 0, message: '' });
  
  // UI modals state
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [showCEPHistoryModal, setShowCEPHistoryModal] = useState(false);


  // Checklist NBR ISO/IEC 17025 state - inicializado vazio
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, description: 'Identificação do boletim de resultados analíticos', status: null, observation: '' },
    { id: 2, description: 'Identificação da amostra', status: null, observation: '' },
    { id: 3, description: 'Descrição da data de amostragem', status: null, observation: '' },
    { id: 4, description: 'Descrição da data de recebimento da amostra pelo laboratório', status: null, observation: '' },
    { id: 5, description: 'Descrição da data de realização das análises', status: null, observation: '' },
    { id: 6, description: 'Descrição da data de emissão do BRA', status: null, observation: '' },
    { id: 7, description: 'Identificação do campo produtor ou da Instalação', status: null, observation: '' },
    { id: 8, description: 'Identificação do agente regulado', status: null, observation: '' },
    { id: 9, description: 'Identificação do ponto de medição e/ou do poço quando aplicável', status: null, observation: '' },
    { id: 10, description: 'Resultados das análises e normas ou procedimentos utilizados', status: null, observation: '' },
    { id: 11, description: 'Descrição das características do processo do ponto de amostragem do fluido (pressão e temperatura)', status: null, observation: '' },
    { id: 12, description: 'Identificação do responsável pela amostragem', status: null, observation: '' },
    { id: 13, description: 'Indicação das incertezas de medição, com descrição do nível de confiança e fator de abrangência', status: null, observation: '' },
    { id: 14, description: 'Identificação dos responsáveis técnicos pela realização da análise', status: null, observation: '' },
    { id: 15, description: 'Identificação dos responsáveis pela elaboração e aprovação do boletim', status: null, observation: '' },
  ]);

  // Estados para controlar expansão/contração das seções
  const [expandedSections, setExpandedSections] = useState({
    parte1: {
      item1: true, // Lista de verificação sempre expandida por padrão
      item2: true,
      item3: true,
      item4: true
    },
    parte2: {
      item5: true,
      item6: true
    },
    parte3: {
      item6: true,
      item7: true,
      item8: true
    }
  });

  // ============================================================================
  // INTEGRAÇÃO CEP - CONTROLE ESTATÍSTICO DE PROCESSO
  // ============================================================================
  
  // Hook CEP integrado - usar dados de reportData
  const {
    componentResults: cepComponentResults,
    propertyResults: cepPropertyResults,
    overallStatus: overallCEPStatus,
    isValidating: isCEPValidating,
    runValidation: runCEPValidation,
    addCurrentSampleToHistory: addCEPToHistory,
    clearHistory: clearCEPHistory
  } = useCEPValidation(
    reportData.components, 
    reportData.standardProperties, 
    reportData.numeroBoletim || ''
  );

  // Atualizar o reportData quando CEP calcular novos status
  useEffect(() => {
    if (overallCEPStatus !== reportData.referenciaCepStatus) {
      setReportData(prev => ({
        ...prev,
        referenciaCepStatus: overallCEPStatus
      }));
    }
  }, [overallCEPStatus, reportData.referenciaCepStatus]);

  // Auto-save to localStorage
  useEffect(() => {
    const autoSave = () => {
      try {
        localStorage.setItem('validador-cromatografia-autosave', JSON.stringify(reportData));
        localStorage.setItem('validador-cromatografia-autosave-timestamp', new Date().toISOString());
      } catch (error) {
        console.warn('Erro ao salvar automaticamente:', error);
      }
    };

    const timeoutId = setTimeout(autoSave, 2000); // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(timeoutId);
  }, [reportData]);

  // Migration function for backward compatibility
  const migrateDataToANP52 = useCallback((data: any): ReportData => {
    const migratedData = { ...data };
    
    // Add tipoProcesso field if missing (default to ProcessoNormal for backward compatibility)
    if (migratedData.bulletinInfo && !migratedData.bulletinInfo.tipoProcesso) {
      migratedData.bulletinInfo.tipoProcesso = ProcessType.ProcessoNormal;
      console.log('🔄 Migração automática: Tipo de processo definido como "Processo Normal" para compatibilidade com ANP 52/2013');
    }
    
    // Migrate old date validation structure if present
    if (migratedData.dateValidationDetails) {
      const oldValidations = migratedData.dateValidationDetails;
      const newValidations = JSON.parse(JSON.stringify(INITIAL_DATE_VALIDATION_DETAILS));
      
      // Keep existing sequential validations
      if (oldValidations.seq_coleta_recebLab) newValidations.seq_coleta_recebLab = oldValidations.seq_coleta_recebLab;
      if (oldValidations.seq_recebLab_analiseLab) newValidations.seq_recebLab_analiseLab = oldValidations.seq_recebLab_analiseLab;
      if (oldValidations.seq_analiseLab_emissaoLab) newValidations.seq_analiseLab_emissaoLab = oldValidations.seq_analiseLab_emissaoLab;
      if (oldValidations.seq_emissaoLab_recebSolic) newValidations.seq_emissaoLab_recebSolic = oldValidations.seq_emissaoLab_recebSolic;
      if (oldValidations.seq_recebSolic_analiseCritica) newValidations.seq_recebSolic_analiseCritica = oldValidations.seq_recebSolic_analiseCritica;
      
      // Migrate old RTM52/Coleta-Emissão rules to new ANP52 structure
      if (oldValidations.prazo_coleta_emissao_boletim || oldValidations.rtm52_prazoEmissaoBoletim) {
        console.log('🔄 Migração automática: Convertendo regras de prazo antigas para ANP 52/2013');
      }
      
      migratedData.dateValidationDetails = newValidations;
    }
    
    return migratedData;
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('validador-cromatografia-autosave');
      const timestamp = localStorage.getItem('validador-cromatografia-autosave-timestamp');
      
      if (saved && timestamp) {
        const savedData = JSON.parse(saved);
        const saveTime = new Date(timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60);
        
        // Only restore if saved within last 24 hours
        if (hoursDiff < 24) {
          const migratedData = migrateDataToANP52(savedData);
          
          // Verificar se há dados significativos antes de mostrar notificação
          const hasSignificantData = (
            migratedData.solicitantInfo?.nomeClienteSolicitante ||
            migratedData.sampleInfo?.numeroAmostra ||
            migratedData.bulletinInfo?.laboratorioEmissor ||
            migratedData.observacoesBoletim ||
            migratedData.components.some(c => c.molarPercent && parseFloat(c.molarPercent) > 0) ||
            migratedData.standardProperties.some(p => p.value) ||
            migratedData.samplingConditionsProperties.some(p => p.value) ||
            migratedData.airContaminationProperties.some(p => p.molPercent && parseFloat(p.molPercent) > 0)
          );
          
          setReportData(migratedData);
          
          // Só mostrar notificação se houver dados significativos
          if (hasSignificantData) {
            addNotification('success', 'Dados Restaurados', `Dados salvos automaticamente em ${saveTime.toLocaleString('pt-BR')} foram restaurados e migrados para ANP 52/2013.`);
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao restaurar dados salvos:', error);
    }
  }, [migrateDataToANP52]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizePercentage}%`;
  }, [fontSizePercentage]);

  // Add global error handler for DOM manipulation errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      
      // Capturar erro no Sentry (agora usando versão dummy)
      try {
        addBreadcrumb('Global error detectado', 'error');
        captureError(event.error instanceof Error ? event.error : new Error(String(event.error)), {
          source: 'globalErrorHandler',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      } catch (sentryError) {
        console.warn('Erro ao processar erro:', sentryError);
      }
      
      if (event.error && event.error.message && event.error.message.includes('removeChild')) {
        console.warn('DOM manipulation error detected, attempting cleanup...');
        // Try to clean up any orphaned PDF containers
        try {
          const containers = document.querySelectorAll('[data-pdf-generator="true"]');
          containers.forEach(container => {
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
          });
        } catch (cleanupError) {
          console.warn('Error during cleanup:', cleanupError);
          captureError(cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError)), { source: 'globalErrorHandler', context: 'DOMCleanup' });
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Capturar promise rejection no Sentry (agora usando versão dummy)
      try {
        addBreadcrumb('Promise rejection detectada', 'error');
        captureError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
          source: 'unhandledRejection',
          reason: event.reason,
        });
      } catch (sentryError) {
        console.warn('Erro ao processar promise rejection:', sentryError);
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Contador para garantir IDs únicos mesmo no mesmo milissegundo
  const notificationCounter = useRef(0);

  // Notification system functions
  const addNotification = useCallback((type: Notification['type'], title: string, message: string) => {
    try {
      notificationCounter.current += 1;
      const notification: Notification = {
        id: `${Date.now()}-${notificationCounter.current}`,
        type,
        title,
        message,
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, notification]);
      
      // Auto-remove after 5 seconds with cleanup check
      const timeoutId = setTimeout(() => {
        try {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        } catch (timeoutError) {
          console.warn('Erro ao remover notificação automaticamente:', timeoutError);
        }
      }, 5000);

      // Return cleanup function for potential use
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.warn('Erro ao adicionar notificação:', error);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.warn('Erro ao remover notificação:', error);
    }
  }, []);

  // Manual Entry Modal function
  const handleManualDataSubmit = useCallback(async (data: Partial<ReportData>) => {
    try {
      console.log('📝 Processando dados do manual entry...');
      const migratedData = migrateDataToANP52(data);
          setReportData(migratedData);
      setShowManualEntryModal(false);
      addNotification('success', 'Dados Inseridos', 'Dados do formulário manual foram aplicados com sucesso.');
      window.scrollTo(0, 0); // Scroll to top for better UX
      } catch (error) {
      console.error('Erro ao processar dados manual:', error);
      addNotification('error', 'Erro no Processamento', 'Erro ao aplicar dados do formulário manual.');
      }
  }, [addNotification, migrateDataToANP52]);

  useEffect(() => {
    const getComponentValue = (name: string): number => {
      const component = reportData.components.find(c => c.name === name);
      return component ? parseFloat(component.molarPercent) : NaN;
    };

    const nitrogenValue = getComponentValue('Nitrogênio (N₂)');
    const propaneValue = getComponentValue('Propano (C₃)');
    const iButaneValue = getComponentValue('i-Butano (iC₄)');
    const nButaneValue = getComponentValue('n-Butano (nC₄)');



    const updatedComponents = reportData.components.map(comp => {
      let aga8Status = ValidationStatus.Pendente;
      let cepStatus = ValidationStatus.Pendente;
      const molarPercent = parseFloat(comp.molarPercent);
      let currentAga8Max = comp.aga8Max; 
      // Ensure original aga8Max from INITIAL_COMPONENTS is used for CO2 rule re-evaluation
      const initialComp = INITIAL_COMPONENTS.find(c => c.id === comp.id);
      if (initialComp) {
          currentAga8Max = initialComp.aga8Max;
      }


      if (comp.name === 'Dióxido de Carbono (CO₂)') {
        let co2MaxFromRules = INITIAL_COMPONENTS.find(c => c.name === 'Dióxido de Carbono (CO₂)')?.aga8Max || 30.0; 

        if (!isNaN(nitrogenValue)) {
          if (nitrogenValue > 15) co2MaxFromRules = Math.min(co2MaxFromRules, 10.0);
          else if (nitrogenValue > 7) co2MaxFromRules = Math.min(co2MaxFromRules, 20.0);
        }
        if (!isNaN(propaneValue)) {
          if (propaneValue > 2) co2MaxFromRules = Math.min(co2MaxFromRules, 5.0);
          else if (propaneValue > 1) co2MaxFromRules = Math.min(co2MaxFromRules, 7.0);
        }
        if (!isNaN(iButaneValue) && iButaneValue > 0.1) {
          co2MaxFromRules = Math.min(co2MaxFromRules, 10.0);
        }
        if (!isNaN(nButaneValue) && nButaneValue > 0.3) {
          co2MaxFromRules = Math.min(co2MaxFromRules, 10.0);
        }
        currentAga8Max = co2MaxFromRules;
      }
      
      if (!isNaN(molarPercent)) {
        aga8Status = molarPercent >= comp.aga8Min && molarPercent <= currentAga8Max ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa;
      }

      const cepLower = parseFloat(comp.cepLowerLimit);
      const cepUpper = parseFloat(comp.cepUpperLimit);
      if (!isNaN(molarPercent) && !isNaN(cepLower) && !isNaN(cepUpper)) {
        cepStatus = molarPercent >= cepLower && molarPercent <= cepUpper ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa;
      }
      return { ...comp, aga8Status, cepStatus, aga8Max: currentAga8Max }; 
    });

    // Automatic calculations for properties
    const calculatedMolarMass = calculateMolarMass(reportData.components);
    const calculatedRelativeDensity = calculateRelativeDensity(calculatedMolarMass);
    const calculatedRealDensity = calculateRealDensity(calculatedMolarMass);
    const pcsValue = parseFloat(reportData.standardProperties.find(p => p.id === 'pcs')?.value || '0');
    const calculatedPCI = calculatePCI(pcsValue);
    const calculatedWobbeIndex = calculateWobbeIndex(pcsValue, calculatedRelativeDensity);

    const updatedStandardProperties = reportData.standardProperties.map(prop => {
      let cepStatus = ValidationStatus.Pendente;
      let autoCalculatedValue = prop.value;

      // Auto-calculate values if not manually set or if they seem outdated
      const shouldAutoCalculate = !prop.value || prop.value === '' || prop.value === '0';
      
      if (shouldAutoCalculate) {
        switch (prop.id) {
          case 'molarMass':
            if (calculatedMolarMass > 0) {
              autoCalculatedValue = calculatedMolarMass.toFixed(3);
            }
            break;
          case 'relativeDensity':
            if (calculatedRelativeDensity > 0) {
              autoCalculatedValue = calculatedRelativeDensity.toFixed(4);
            }
            break;
          case 'realDensity':
            if (calculatedRealDensity > 0) {
              autoCalculatedValue = calculatedRealDensity.toFixed(3);
            }
            break;
          case 'pci':
            if (calculatedPCI > 0) {
              autoCalculatedValue = calculatedPCI.toFixed(0);
            }
            break;
        }
      }

      const val = parseFloat(autoCalculatedValue);
      const cepLower = parseFloat(prop.cepLowerLimit);
      const cepUpper = parseFloat(prop.cepUpperLimit);

      if (!isNaN(val) && !isNaN(cepLower) && !isNaN(cepUpper)) {
        cepStatus = val >= cepLower && val <= cepUpper ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa;
      }
      
      return { ...prop, value: autoCalculatedValue, cepStatus };
    });

    // Auto-calculate sampling conditions
    const updatedSamplingProperties = reportData.samplingConditionsProperties.map(prop => {
      let autoCalculatedValue = prop.value;
      const shouldAutoCalculate = !prop.value || prop.value === '' || prop.value === '0';
      
      if (shouldAutoCalculate) {
        switch (prop.id) {
          case 'relativeDensitySampling':
            if (calculatedRelativeDensity > 0) {
              autoCalculatedValue = calculatedRelativeDensity.toFixed(4);
            }
            break;
          case 'wobbeIndex':
            if (calculatedWobbeIndex > 0) {
              autoCalculatedValue = calculatedWobbeIndex.toFixed(0);
            }
            break;
        }
      }
      
      return { ...prop, value: autoCalculatedValue };
    });

    // Auto-calculate air contamination
    const oxygenFromAir = reportData.airContaminationProperties.find(p => p.id === 'oxygenFromAir')?.molPercent || '';
    const nitrogenFromAir = reportData.airContaminationProperties.find(p => p.id === 'nitrogenFromAir')?.molPercent || '';
    
    const airContamination = calculateAirContamination(oxygenFromAir, nitrogenFromAir);
    
    const updatedAirProperties = reportData.airContaminationProperties.map(prop => {
      let autoCalculatedValue = prop.molPercent;
      const shouldAutoCalculate = !prop.molPercent || prop.molPercent === '' || prop.molPercent === '0';
      
      if (shouldAutoCalculate) {
        switch (prop.id) {
          case 'nitrogenFromAir':
            if (oxygenFromAir && parseFloat(oxygenFromAir) > 0) {
              autoCalculatedValue = airContamination.nitrogenFromAir;
            }
            break;
          case 'totalAir':
            if ((oxygenFromAir && parseFloat(oxygenFromAir) > 0) || (nitrogenFromAir && parseFloat(nitrogenFromAir) > 0)) {
              autoCalculatedValue = airContamination.totalAir;
            }
            break;
        }
      }
      
      return { ...prop, molPercent: autoCalculatedValue };
    });
    
    const updatedRegulatoryComplianceItems = reportData.regulatoryComplianceItems.map(item => {
        let bulletinValue = '';
        let numericBulletinValue = NaN;
        let status = ValidationStatus.Pendente;

        switch (item.id) {
            case 'metano_aga8':
                const c1Comp = updatedComponents.find(c => c.name === 'Metano (C₁)');
                bulletinValue = c1Comp?.molarPercent || '';
                break;
            case 'co2_aga8':
                const co2Comp = updatedComponents.find(c => c.name === 'Dióxido de Carbono (CO₂)');
                bulletinValue = co2Comp?.molarPercent || '';
                break;
            case 'n2_aga8':
                const n2Comp = updatedComponents.find(c => c.name === 'Nitrogênio (N₂)');
                bulletinValue = n2Comp?.molarPercent || '';
                break;
            case 'h2s_aga8':
                const h2sComp = updatedComponents.find(c => c.name === 'Sulfeto de Hidrogênio (H₂S)');
                bulletinValue = h2sComp?.molarPercent || '';
                break;
            case 'temperatura_aga8':
                const tempC = reportData.sampleInfo?.temperaturaAmostraC || '';
                bulletinValue = tempC ? `${tempC} °C` : '';
                break;
            case 'pressao_aga8':
                const pressaoKpa = reportData.sampleInfo?.pressaoAmostraAbsolutaKpaA || '';
                bulletinValue = pressaoKpa ? `${pressaoKpa} kPa` : '';
                break;
        }
        
        if (bulletinValue) {
            // Para temperatura e pressão, extrair apenas o valor numérico
            if (item.id === 'temperatura_aga8') {
                numericBulletinValue = parseFloat(reportData.sampleInfo?.temperaturaAmostraC || 'NaN');
                if (!isNaN(numericBulletinValue)) {
                    // Verificar se está na faixa -4°C a 62°C (AGA-8 DETAIL)
                    status = (numericBulletinValue >= -4 && numericBulletinValue <= 62) ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa;
                }
            } else if (item.id === 'pressao_aga8') {
                numericBulletinValue = parseFloat(reportData.sampleInfo?.pressaoAmostraAbsolutaKpaA || 'NaN');
                if (!isNaN(numericBulletinValue)) {
                    // Verificar se está abaixo de 10.342 kPa (AGA-8 DETAIL)
                    status = numericBulletinValue <= 10342 ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa;
                }
            } else {
                // Para componentes (valores percentuais)
                numericBulletinValue = parseFloat(bulletinValue);
                if (!isNaN(numericBulletinValue)) {
                    const limitParts = item.limit.match(/([≥≤])\s*([\d,.]+)/);
                    if (limitParts && limitParts.length === 3) {
                        const operator = limitParts[1];
                        const limitValue = parseFloat(limitParts[2].replace(',', '.'));
                        if (operator === '≥') {
                            status = numericBulletinValue >= limitValue ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa;
                        } else if (operator === '≤') {
                            status = numericBulletinValue <= limitValue ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa;
                        }
                    }
                }
            }
        }
        return { ...item, bulletinValue, status };
    });


    let newReferenciaAga8Status: ValidationStatus = ValidationStatus.NA;
    if (updatedComponents.length > 0) {
        if (updatedComponents.some(c => c.aga8Status === ValidationStatus.Pendente && parseFloat(c.molarPercent))) {
          newReferenciaAga8Status = ValidationStatus.Pendente;
        } else if (updatedComponents.some(c => c.aga8Status === ValidationStatus.ForaDaFaixa)) {
          newReferenciaAga8Status = ValidationStatus.ForaDaFaixa;
        } else if (updatedComponents.every(c => c.aga8Status === ValidationStatus.OK || isNaN(parseFloat(c.molarPercent)) )) { 
            if (updatedComponents.some(c => !isNaN(parseFloat(c.molarPercent)) && c.molarPercent !== '')) newReferenciaAga8Status = ValidationStatus.OK; 
        }
    }

    let newFaixaComposicaoCompativelAGA8 = ValidationStatus.Pendente as string;
    switch (newReferenciaAga8Status) {
        case ValidationStatus.OK:
            newFaixaComposicaoCompativelAGA8 = 'Compatível';
            break;
        case ValidationStatus.ForaDaFaixa:
            newFaixaComposicaoCompativelAGA8 = 'Não Compatível';
            break;
        case ValidationStatus.Pendente:
        case ValidationStatus.NA:
        default:
            newFaixaComposicaoCompativelAGA8 = 'Pendente';
            break;
    }

    let newReferenciaCepStatus: ValidationStatus = ValidationStatus.NA;
    const allCepItems = [
        ...updatedComponents.filter(c => !isNaN(parseFloat(c.cepLowerLimit)) && !isNaN(parseFloat(c.cepUpperLimit))), 
        ...updatedStandardProperties.filter(p => !isNaN(parseFloat(p.cepLowerLimit)) && !isNaN(parseFloat(p.cepUpperLimit)))
    ];

    if (allCepItems.length > 0) {
        const hasPending = allCepItems.some(item => {
            const itemValue = parseFloat((item as ComponentData).molarPercent || (item as SampleProperty).value);
            return item.cepStatus === ValidationStatus.Pendente && !isNaN(itemValue) && ((item as ComponentData).molarPercent !== '' || (item as SampleProperty).value !== '');
        });
        const hasForaDaFaixa = allCepItems.some(item => item.cepStatus === ValidationStatus.ForaDaFaixa);
        const allOkOrNotApplicable = allCepItems.every(item => {
            const itemValue = parseFloat((item as ComponentData).molarPercent || (item as SampleProperty).value);
            return item.cepStatus === ValidationStatus.OK || isNaN(itemValue) || ((item as ComponentData).molarPercent === '' && (item as SampleProperty).value === '');
        });
         const anyHadValue = allCepItems.some(item => {
            const itemValue = parseFloat((item as ComponentData).molarPercent || (item as SampleProperty).value);
            return !isNaN(itemValue) && ((item as ComponentData).molarPercent !== '' || (item as SampleProperty).value !== '');
        });


        if (hasPending) {
            newReferenciaCepStatus = ValidationStatus.Pendente;
        } else if (hasForaDaFaixa) {
            newReferenciaCepStatus = ValidationStatus.ForaDaFaixa;
        } else if (allOkOrNotApplicable && anyHadValue) {
            newReferenciaCepStatus = ValidationStatus.OK;
        } else if (!anyHadValue) {
             newReferenciaCepStatus = ValidationStatus.NA; 
        }
    }
    

    let newReferenciaChecklistStatus: ValidationStatus = ValidationStatus.NA;
    if (reportData.checklistItems.length > 0) {
      if (reportData.checklistItems.some(item => item.status === null)) {
        newReferenciaChecklistStatus = ValidationStatus.Pendente;
      } else if (reportData.checklistItems.some(item => item.status === ChecklistStatus.NAO)) {
        newReferenciaChecklistStatus = ValidationStatus.ForaDaFaixa; 
      } else if (reportData.checklistItems.every(item => item.status === ChecklistStatus.SIM || item.status === ChecklistStatus.NaoAplicavel)) {
         if (reportData.checklistItems.some(item => item.status === ChecklistStatus.SIM)) {
            newReferenciaChecklistStatus = ValidationStatus.OK;
         } else {
            newReferenciaChecklistStatus = ValidationStatus.NA; 
         }
      }
    }
    
    const aga8DataNeedsUpdate = reportData.aga8ValidationData.faixaComposicaoCompativel !== newFaixaComposicaoCompativelAGA8;

    // Auto-calculate AGA-8 validation fields usando o novo sistema
    const pressure = reportData.sampleInfo?.pressaoAmostraAbsolutaKpaA || '0';
    const temperature = reportData.sampleInfo?.temperaturaAmostraC || '20';
    
    // Usar o sistema de validação automática integrado (função importada no topo)
    // Usar o sistema de validação automática integrado (função importada no topo)
    const aga8AutoUpdate = atualizarValidacaoAGA8Automatica({
      ...reportData,
      components: updatedComponents,
      standardProperties: updatedStandardProperties
    });
    
    const autoDetectedPressureRange = aga8AutoUpdate.aga8ValidationData?.faixaPressaoValida || detectAGA8Range(updatedComponents, pressure, temperature);
    const autoDetectedTemperatureRange = aga8AutoUpdate.aga8ValidationData?.faixaTemperaturaValida || detectAGA8TemperatureRange(pressure, temperature);
    const autoDetectedZMethod = aga8AutoUpdate.aga8ValidationData?.zCalculadoPorMetodo || determineZMethod({
      ...reportData,
      components: updatedComponents,
      standardProperties: updatedStandardProperties
    });
    const autoDetectedZConsistency = checkZConsistency({
      ...reportData,
      standardProperties: updatedStandardProperties
    });

    // Only auto-update AGA-8 fields if they are empty or default values
    const shouldUpdatePressureRange = !reportData.aga8ValidationData.faixaPressaoValida || 
      reportData.aga8ValidationData.faixaPressaoValida === '0 a 70 MPa (Típica)';
    const shouldUpdateTemperatureRange = !reportData.aga8ValidationData.faixaTemperaturaValida || 
      reportData.aga8ValidationData.faixaTemperaturaValida === '-30°C a 150°C (Típica)';
    const shouldUpdateZMethod = !reportData.aga8ValidationData.zCalculadoPorMetodo || 
      reportData.aga8ValidationData.zCalculadoPorMetodo === '';
    const shouldUpdateZConsistency = !reportData.aga8ValidationData.consistenciaZCondPadraoZAmostragem || 
      reportData.aga8ValidationData.consistenciaZCondPadraoZAmostragem === '' ||
      reportData.aga8ValidationData.consistenciaZCondPadraoZAmostragem === 'Consistente / Inconsistente / Pendente';

    const samplingPropertiesNeedUpdate = JSON.stringify(reportData.samplingConditionsProperties) !== JSON.stringify(updatedSamplingProperties);
    const airPropertiesNeedUpdate = JSON.stringify(reportData.airContaminationProperties) !== JSON.stringify(updatedAirProperties);
    const aga8FieldsNeedUpdate = shouldUpdatePressureRange || shouldUpdateTemperatureRange || shouldUpdateZMethod || shouldUpdateZConsistency;

    if (
        newReferenciaAga8Status !== reportData.referenciaAga8Status ||
        newReferenciaCepStatus !== reportData.referenciaCepStatus ||
        newReferenciaChecklistStatus !== reportData.referenciaChecklistStatus ||
        JSON.stringify(updatedComponents) !== JSON.stringify(reportData.components) ||
        JSON.stringify(updatedStandardProperties) !== JSON.stringify(reportData.standardProperties) ||
        JSON.stringify(updatedRegulatoryComplianceItems) !== JSON.stringify(reportData.regulatoryComplianceItems) ||
        aga8DataNeedsUpdate || samplingPropertiesNeedUpdate || airPropertiesNeedUpdate || aga8FieldsNeedUpdate
      ) {
      setReportData(prev => ({ 
        ...prev, 
        components: updatedComponents, 
        standardProperties: updatedStandardProperties,
        samplingConditionsProperties: updatedSamplingProperties,
        airContaminationProperties: updatedAirProperties,
        regulatoryComplianceItems: updatedRegulatoryComplianceItems,
        referenciaAga8Status: newReferenciaAga8Status,
        referenciaCepStatus: newReferenciaCepStatus,
        referenciaChecklistStatus: newReferenciaChecklistStatus,
        aga8ValidationData: {
            ...prev.aga8ValidationData,
            faixaComposicaoCompativel: newFaixaComposicaoCompativelAGA8,
            faixaPressaoValida: shouldUpdatePressureRange ? autoDetectedPressureRange : prev.aga8ValidationData.faixaPressaoValida,
            faixaTemperaturaValida: shouldUpdateTemperatureRange ? autoDetectedTemperatureRange : prev.aga8ValidationData.faixaTemperaturaValida,
            zCalculadoPorMetodo: shouldUpdateZMethod ? autoDetectedZMethod : prev.aga8ValidationData.zCalculadoPorMetodo,
            consistenciaZCondPadraoZAmostragem: shouldUpdateZConsistency ? autoDetectedZConsistency : prev.aga8ValidationData.consistenciaZCondPadraoZAmostragem,
        }
      }));
    }

  }, [
      reportData.components, 
      reportData.standardProperties,
      reportData.samplingConditionsProperties,
      reportData.airContaminationProperties, 
      reportData.checklistItems, 
      reportData.regulatoryComplianceItems, 
      reportData.aga8ValidationData.faixaComposicaoCompativel, 
      reportData.referenciaAga8Status, 
      reportData.referenciaCepStatus, 
      reportData.referenciaChecklistStatus,
      reportData.sampleInfo.pressaoAmostraAbsolutaKpaA,
      reportData.sampleInfo.temperaturaAmostraC
    ]);

  // Helper function to calculate business days (excluding weekends)
  const calculateBusinessDays = useCallback((startDate: Date, endDate: Date): number => {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }, []);

  useEffect(() => {
    const newDateValidations: DateValidationDetails = JSON.parse(JSON.stringify(INITIAL_DATE_VALIDATION_DETAILS));

    const {
      sampleInfo: { dataHoraColeta },
      bulletinInfo: { dataRecebimentoAmostra, dataAnaliseLaboratorial, dataEmissaoBoletim, dataRecebimentoBoletimSolicitante, tipoProcesso },
      dataRealizacaoAnaliseCritica,
      decisaoFinal,
      acoesRecomendadas: { novaAmostragem }
    } = reportData;

    const dColetaStr = dataHoraColeta ? dataHoraColeta.split('T')[0] : null;
    const dColeta = dColetaStr ? new Date(dColetaStr + 'T00:00:00Z') : null; // Normalize to start of day UTC for comparisons
    const dRecebLab = dataRecebimentoAmostra ? new Date(dataRecebimentoAmostra + 'T00:00:00Z') : null;
    const dAnaliseLab = dataAnaliseLaboratorial ? new Date(dataAnaliseLaboratorial + 'T00:00:00Z') : null;
    const dEmissaoLab = dataEmissaoBoletim ? new Date(dataEmissaoBoletim + 'T00:00:00Z') : null;
    const dRecebSolic = dataRecebimentoBoletimSolicitante ? new Date(dataRecebimentoBoletimSolicitante + 'T00:00:00Z') : null;
    const dAnaliseCritica = dataRealizacaoAnaliseCritica ? new Date(dataRealizacaoAnaliseCritica + 'T00:00:00Z') : null;

    const formatDate = (date: Date | null): string => date ? date.toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A';

    const setValidation = (key: keyof DateValidationDetails, date1: Date | null, date2: Date | null, messageFormat: (d1Str: string, d2Str: string) => string, allowEqual = true) => {
      if (date1 && date2) {
        if ((allowEqual && date1.getTime() > date2.getTime()) || (!allowEqual && date1.getTime() >= date2.getTime())) {
          newDateValidations[key] = { status: ValidationStatus.ForaDaFaixa, message: messageFormat(formatDate(date1), formatDate(date2)) };
        } else {
          newDateValidations[key] = { status: ValidationStatus.OK, message: null };
        }
      } else if ( (key === 'seq_coleta_recebLab' && dataHoraColeta && dataRecebimentoAmostra) ||
                  (key === 'seq_recebLab_analiseLab' && dataRecebimentoAmostra && dataAnaliseLaboratorial) ||
                  (key === 'seq_analiseLab_emissaoLab' && dataAnaliseLaboratorial && dataEmissaoBoletim) ||
                  (key === 'seq_emissaoLab_recebSolic' && dataEmissaoBoletim && dataRecebimentoBoletimSolicitante) ||
                  (key === 'seq_recebSolic_analiseCritica' && dataRecebimentoBoletimSolicitante && dataRealizacaoAnaliseCritica) ||
                  (key === 'anp52_prazoColetaEmissao' && dataHoraColeta && dataEmissaoBoletim) ||
                  (key === 'anp52_prazoColetaImplementacao' && dataHoraColeta && dataEmissaoBoletim) ||
                  (key === 'anp52_novaAmostragem' && decisaoFinal === FinalDecisionStatus.NaoValidadoReprovado && novaAmostragem && dataRealizacaoAnaliseCritica)
      ) {
         newDateValidations[key] = { status: ValidationStatus.Pendente, message: null };
      }
    };
    
    // Sequential validations (unchanged)
    setValidation('seq_coleta_recebLab', dColeta, dRecebLab, (d1, d2) => `Data da Coleta (${d1}) deve ser anterior ou igual à Data de Recebimento Lab. (${d2}).`);
    setValidation('seq_recebLab_analiseLab', dRecebLab, dAnaliseLab, (d1, d2) => `Data de Recebimento Lab. (${d1}) deve ser anterior ou igual à Data de Análise Lab. (${d2}).`);
    setValidation('seq_analiseLab_emissaoLab', dAnaliseLab, dEmissaoLab, (d1, d2) => `Data de Análise Lab. (${d1}) deve ser anterior ou igual à Data de Emissão Boletim Lab. (${d2}).`);
    setValidation('seq_emissaoLab_recebSolic', dEmissaoLab, dRecebSolic, (d1, d2) => `Data de Emissão Boletim Lab. (${d1}) deve ser anterior ou igual à Data de Recebimento Solic. (${d2}).`);
    setValidation('seq_recebSolic_analiseCritica', dRecebSolic, dAnaliseCritica, (d1, d2) => `Data de Recebimento Solic. (${d1}) deve ser anterior ou igual à Data de Análise Crítica (${d2}).`);

    // ANP 52/2013 - Prazo Coleta até Emissão (25 dias corridos)
    if (dColeta && dEmissaoLab) {
      if (dEmissaoLab.getTime() < dColeta.getTime()) {
        newDateValidations.anp52_prazoColetaEmissao = {
          status: ValidationStatus.ForaDaFaixa,
          message: `Data de Emissão do Boletim (${formatDate(dEmissaoLab)}) não pode ser anterior à Data de Coleta (${formatDate(dColeta)}).`
        };
      } else {
        const diffTimeColetaEmissao = dEmissaoLab.getTime() - dColeta.getTime();
        const diffDaysColetaEmissao = Math.ceil(diffTimeColetaEmissao / (1000 * 60 * 60 * 24)); 
        if (diffDaysColetaEmissao > ANP52_PRAZO_COLETA_EMISSAO_DIAS) {
          newDateValidations.anp52_prazoColetaEmissao = {
            status: ValidationStatus.ForaDaFaixa,
            message: `Prazo entre Coleta e Emissão do Boletim (${diffDaysColetaEmissao} dias) excede o limite da Resolução ANP 52/2013 (${ANP52_PRAZO_COLETA_EMISSAO_DIAS} dias corridos).`
          };
        } else {
          newDateValidations.anp52_prazoColetaEmissao = { status: ValidationStatus.OK, message: null };
        }
      }
    } else if (dataHoraColeta && dataEmissaoBoletim) {
      newDateValidations.anp52_prazoColetaEmissao = { status: ValidationStatus.Pendente, message: null };
    }

    // ANP 52/2013 - Prazo total do processo (Normal: 28 dias / Sem Validação: 26 dias)
    if (dColeta && dEmissaoLab && tipoProcesso) {
      const prazoLimite = tipoProcesso === ProcessType.ProcessoNormal ? ANP52_PRAZO_PROCESSO_NORMAL_DIAS : ANP52_PRAZO_PROCESSO_SEM_VALIDACAO_DIAS;
      const diffTimeColetaImplementacao = dEmissaoLab.getTime() - dColeta.getTime();
      const diffDaysColetaImplementacao = Math.ceil(diffTimeColetaImplementacao / (1000 * 60 * 60 * 24)); 
      
      if (diffDaysColetaImplementacao > prazoLimite) {
        newDateValidations.anp52_prazoColetaImplementacao = {
                status: ValidationStatus.ForaDaFaixa,
          message: `Prazo total do processo (${diffDaysColetaImplementacao} dias) excede o limite para ${tipoProcesso} conforme Resolução ANP 52/2013 (${prazoLimite} dias corridos).`
            };
        } else {
        newDateValidations.anp52_prazoColetaImplementacao = { status: ValidationStatus.OK, message: null };
      }
    } else if (dataHoraColeta && dataEmissaoBoletim && tipoProcesso) {
      newDateValidations.anp52_prazoColetaImplementacao = { status: ValidationStatus.Pendente, message: null };
    }

    // ANP 52/2013 - Nova amostragem (3 dias úteis após análise crítica quando decisão = NÃO VALIDADO - REPROVADO e nova amostragem marcada)
    if (decisaoFinal === FinalDecisionStatus.NaoValidadoReprovado && novaAmostragem && dAnaliseCritica) {
      const dataAtual = new Date();
      const businessDaysPassed = calculateBusinessDays(dAnaliseCritica, dataAtual);
      
      if (businessDaysPassed > ANP52_PRAZO_NOVA_AMOSTRAGEM_DIAS_UTEIS) {
        newDateValidations.anp52_novaAmostragem = {
                    status: ValidationStatus.ForaDaFaixa,
          message: `Prazo para nova amostragem excedido (${businessDaysPassed} dias úteis desde a análise crítica). Resolução ANP 52/2013 estabelece ${ANP52_PRAZO_NOVA_AMOSTRAGEM_DIAS_UTEIS} dias úteis.`
                };
            } else {
        const diasRestantes = ANP52_PRAZO_NOVA_AMOSTRAGEM_DIAS_UTEIS - businessDaysPassed;
        newDateValidations.anp52_novaAmostragem = {
          status: ValidationStatus.OK,
          message: `Nova amostragem deve ser realizada em ${diasRestantes} dia(s) útil(eis) (Resolução ANP 52/2013).`
        };
        }
    } else if (decisaoFinal === FinalDecisionStatus.NaoValidadoReprovado && novaAmostragem && dataRealizacaoAnaliseCritica) {
      newDateValidations.anp52_novaAmostragem = { status: ValidationStatus.Pendente, message: null };
    }

    if (JSON.stringify(newDateValidations) !== JSON.stringify(reportData.dateValidationDetails)) {
      setReportData(prev => ({ ...prev, dateValidationDetails: newDateValidations }));
    }

  }, [
    reportData.sampleInfo.dataHoraColeta,
    reportData.bulletinInfo.dataRecebimentoAmostra,
    reportData.bulletinInfo.dataAnaliseLaboratorial,
    reportData.bulletinInfo.dataEmissaoBoletim,
    reportData.bulletinInfo.dataRecebimentoBoletimSolicitante,
    reportData.bulletinInfo.tipoProcesso,
    reportData.dataRealizacaoAnaliseCritica,
    reportData.decisaoFinal,
    reportData.acoesRecomendadas.novaAmostragem,
    reportData.dateValidationDetails,
    calculateBusinessDays
  ]);

  // Update progress and validations
  // Handle progress and validation updates (without automatic notifications)
  useEffect(() => {
    try {
      // Progress calculation removed - not being displayed

      const newMolarValidation = validateMolarComposition(reportData.components || []);
      setMolarValidation(newMolarValidation);

      const newRequiredFieldsValidation = validateRequiredFields(reportData);
      setRequiredFieldsValidation(newRequiredFieldsValidation);

      // Note: Removed automatic notifications - they will only appear when user clicks action buttons
    } catch (error) {
      console.error('Erro no useEffect de validação:', error);
      // Progress and validation error handling removed
      setMolarValidation({ isValid: true, total: 0, message: 'Erro ao validar composição' });
      setRequiredFieldsValidation({ isValid: true, missingFields: [] });
    }
  }, [reportData]);

  // Function to validate and show notifications for required fields (only called when needed)
  const validateAndNotifyRequiredFields = useCallback(() => {
    const validation = validateRequiredFields(reportData);
    if (!validation.isValid && validation.missingFields.length > 0) {
      addNotification('warning', 'Campos Obrigatórios', 
        `Campos obrigatórios pendentes: ${validation.missingFields.slice(0, 3).join(', ')}${validation.missingFields.length > 3 ? '...' : ''}`);
      return false;
    }
    return true;
  }, [reportData, addNotification]);

  // Automatic calculation functions
  const calculateMolarMass = useCallback((components: ComponentData[]): number => {
    // Import AGA-8 critical parameters for precise molar masses
            // Usar getComponentMolarMass já importado no topo

    return components.reduce((sum, comp) => {
      const xi = parseFloat(comp.molarPercent) / 100 || 0;
      const Mi = getComponentMolarMass(comp.name) || 0;
      return sum + (xi * Mi);
    }, 0);
  }, []);

  const calculateRelativeDensity = useCallback((molarMass: number): number => {
    const M_air = 28.9625; // g/mol - molecular weight of air
    return molarMass / M_air;
  }, []);

  const calculateRealDensity = useCallback((molarMass: number, pressure: number = 101.325, temperature: number = 293.15): number => {
    // ρ = (P × M) / (R × T) - Ideal gas law
    // P in kPa, T in K, M in g/mol, R = 8.314 J/(mol·K)
    const R = 8.314; // J/(mol·K)
    return (pressure * 1000 * molarMass) / (R * temperature * 1000); // kg/m³
  }, []);

  const calculateWobbeIndex = useCallback((pcs: number, relativeDensity: number): number => {
    if (relativeDensity <= 0) return 0;
    return pcs / Math.sqrt(relativeDensity);
  }, []);

  const calculatePCI = useCallback((pcs: number): number => {
    // Approximation: PCI ≈ 0.9 × PCS for natural gas
    return pcs * 0.9;
  }, []);

  const calculateAirContamination = useCallback((oxygenPercent: string, nitrogenPercent: string) => {
    const o2 = parseFloat(oxygenPercent) || 0;
    const n2 = parseFloat(nitrogenPercent) || 0;
    
    // If only O₂ is provided, calculate N₂ from air using atmospheric proportion
    if (o2 > 0 && n2 === 0) {
      const n2FromAir = o2 * (79.05 / 20.95); // Atmospheric proportion N₂/O₂
      return {
        nitrogenFromAir: n2FromAir.toFixed(4),
        totalAir: (o2 + n2FromAir).toFixed(4)
      };
    }
    
    // If both provided, calculate total
    return {
      nitrogenFromAir: n2.toFixed(4),
      totalAir: (o2 + n2).toFixed(4)
    };
  }, []);

  // Integração com o novo sistema de validação automática AGA8
  const detectAGA8Range = useCallback((components: ComponentData[], pressure: string, temperature: string): string => {
    // Usar escolherCriterioAGA8 já importado no topo
    
    const pressao_kPa = parseFloat(pressure) || 0;
    const temperatura_C = parseFloat(temperature) || 20;
    
    const resultado = escolherCriterioAGA8(components, temperatura_C, pressao_kPa);
    
    switch (resultado.modelo) {
      case 'DETAIL':
        return '0 a 10.3 MPa (AGA-8 DETAIL Range A)';
      case 'GROSS':
        return '0 a 20.7 MPa (AGA-8 GROSS Method)';
      case 'GERG-2008':
        return '0 a 70 MPa (GERG-2008)';
      default:
        return '0 a 70 MPa (Padrão)';
    }
  }, []);

  const detectAGA8TemperatureRange = useCallback((pressure: string, temperature: string): string => {
    // Usar escolherCriterioAGA8 já importado no topo
    
    const pressao_kPa = parseFloat(pressure) || 0;
    const temperatura_C = parseFloat(temperature) || 20;
    
    // Para o range de temperatura, usamos uma composição padrão se não houver dados
    const componentsDefault = reportData.components.length > 0 ? reportData.components : [];
    const resultado = escolherCriterioAGA8(componentsDefault, temperatura_C, pressao_kPa);
    
    switch (resultado.modelo) {
      case 'DETAIL':
      case 'GROSS':
        return '-4°C a 62°C (AGA-8)';
      case 'GERG-2008':
        return '-160°C a 200°C (GERG-2008)';
      default:
        return '-30°C a 150°C (Padrão)';
    }
  }, [reportData.components]);

  const determineZMethod = useCallback((reportData: ReportData): string => {
    // Usar escolherCriterioAGA8 já importado no topo
    
    const temperatura = parseFloat(reportData.sampleInfo?.temperaturaAmostraC || '20');
    const pressao = parseFloat(reportData.sampleInfo?.pressaoAmostraAbsolutaKpaA || '0');
    
    const resultado = escolherCriterioAGA8(reportData.components, temperatura, pressao);
    
    const hasCompleteComposition = reportData.components.filter(c => 
      parseFloat(c.molarPercent) > 0
    ).length >= 10;
    
    const pcs = parseFloat(reportData.standardProperties.find(p => p.id === 'pcs')?.value || '0');
    const density = parseFloat(reportData.standardProperties.find(p => p.id === 'relativeDensity')?.value || '0');
    
    if (resultado.modelo === 'DETAIL' && hasCompleteComposition) {
      return `Detalhado (${resultado.criterio})`;
    } else if (resultado.modelo === 'GROSS' || (pcs > 0 && density > 0)) {
      return `Gross Method (${resultado.criterio})`;
    } else if (resultado.modelo === 'GERG-2008') {
      return `GERG-2008 (${resultado.criterio})`;
    } else {
      return 'N/A (Dados Insuficientes)';
    }
  }, [reportData.components, reportData.sampleInfo, reportData.standardProperties]);

  const checkZConsistency = useCallback((reportData: ReportData): string => {
    const zStandard = parseFloat(reportData.standardProperties.find(p => p.id === 'compressibilityFactor')?.value || '0');
    const zSampling = parseFloat(reportData.samplingConditionsProperties.find(p => p.id === 'compressibilityFactorSampling')?.value || '0');
    
    if (zStandard === 0 || zSampling === 0) {
      return 'Pendente (Dados Insuficientes)';
    }
    
    const difference = Math.abs(zStandard - zSampling) / zStandard * 100;
    
    if (difference <= 5) { // 5% tolerance
      return 'Consistente (Δ ≤ 5%)';
    } else if (difference <= 10) {
      return 'Aceitável (5% < Δ ≤ 10%)';
    } else {
      return 'Inconsistente (Δ > 10%)';
    }
  }, []);

  // ============================================================================
  // HANDLERS CEP - CONTROLE ESTATÍSTICO DE PROCESSO
  // ============================================================================

  // Handler para forçar validação CEP manual
  const handleManualCEPValidation = useCallback(async () => {
    try {
      await runCEPValidation();
      addNotification('success', 'Validação CEP', 'Validação CEP executada com sucesso.');
    } catch (error) {
      addNotification('error', 'Erro CEP', 'Erro ao executar validação CEP.');
    }
  }, [runCEPValidation, addNotification]);

  // Handler para adicionar amostra ao histórico CEP
  const handleAddCEPToHistory = useCallback(() => {
    if (!reportData.numeroBoletim || !reportData.sampleInfo?.dataHoraColeta) {
      addNotification('warning', 'Dados Incompletos', 'Número do boletim e data de coleta são obrigatórios para adicionar ao histórico CEP.');
      return;
    }

    try {
      addCEPToHistory();
      addNotification('success', 'Histórico CEP', 'Amostra adicionada ao histórico CEP com sucesso.');
    } catch (error) {
      addNotification('error', 'Erro Histórico CEP', 'Erro ao adicionar amostra ao histórico CEP.');
    }
  }, [reportData.numeroBoletim, reportData.sampleInfo?.dataHoraColeta, addCEPToHistory, addNotification]);

  // Essential handler functions for the UI
  const handleInputChange = useCallback((field: keyof ReportData, value: any) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNestedInputChange = useCallback((sectionKey: keyof ReportData, field: string, value: string) => {
    setReportData(prev => {
      const section = prev[sectionKey] as any; 
      let updatedSection = {
        ...section,
        [field]: value,
      };

      // Auto-convert between Celsius and Kelvin for temperature fields
      if (sectionKey === 'sampleInfo') {
        if (field === 'temperaturaAmostraC' && value) {
          const tempC = parseFloat(value);
          if (!isNaN(tempC)) {
            updatedSection.temperaturaAmostraK = (tempC + 273.15).toFixed(2);
          }
        } else if (field === 'temperaturaAmostraK' && value) {
          const tempK = parseFloat(value);
          if (!isNaN(tempK)) {
            updatedSection.temperaturaAmostraC = (tempK - 273.15).toFixed(2);
          }
        }
        
        // Auto-convert between absolute and gauge pressure
        if (field === 'pressaoAmostraManometricaKpa' && value) {
          const pGauge = parseFloat(value);
          if (!isNaN(pGauge)) {
            updatedSection.pressaoAmostraAbsolutaKpaA = (pGauge + 101.325).toFixed(3);
          }
        }
      }

      return {
        ...prev,
        [sectionKey]: updatedSection,
      };
    });
  }, []);

  const handleComponentChange = useCallback((id: number, field: keyof ComponentData, value: string | number) => {
    setReportData(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === id ? { ...comp, [field]: value } : comp
      ),
    }));
  }, []);
  
  const handleStandardPropertyChange = useCallback((id: string, field: keyof SampleProperty, value: string) => {
    setReportData(prev => ({
      ...prev,
      standardProperties: prev.standardProperties.map(prop =>
        prop.id === id ? { ...prop, [field]: value } : prop
      ),
    }));
  }, []);

  // Handle component field blur events - DESABILITADO
  const handleComponentBlur = useCallback((_id: number, _field: keyof ComponentData, _componentName: string) => {
    // NOTIFICAÇÕES DESABILITADAS - Função mantida para compatibilidade
    // As validações visuais continuam funcionando através dos status na tabela
  }, []);

  // Handler para atualizar checklist NBR ISO/IEC 17025
  const handleChecklistChange = useCallback((id: number, field: 'status' | 'observation', value: any) => {
    setChecklistItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }, []);

  // Handler para controlar expansão/contração das seções
  const toggleSection = useCallback((parte: 'parte1' | 'parte2' | 'parte3', item: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [parte]: {
        ...prev[parte],
        [item]: !prev[parte][item as keyof typeof prev[typeof parte]]
      }
    }));
  }, []);

  return (
    <ErrorBoundary>
      <div className="container p-4 mx-auto min-h-screen bg-gray-50">
        
        {/* ====================================================================== */}
        {/* CABEÇALHO - IDENTIFICAÇÃO DO REGISTRO */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center text-white">
              ANÁLISE CRÍTICA DE BOLETINS ANALÍTICOS - CROMATOGRAFIA
      </h1>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Nº Rastreabilidade
                </label>
                <input
                  type="text"
                  value={reportData.numeroUnicoRastreabilidade}
                  onChange={(e) => handleInputChange('numeroUnicoRastreabilidade', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Gerado automaticamente"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Data Análise Crítica
                </label>
                <input
                  type="date"
                  value={reportData.dataRealizacaoAnaliseCritica}
                  onChange={(e) => handleInputChange('dataRealizacaoAnaliseCritica', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Revisão Análise Crítica
                </label>
                <input
                  type="text"
                  value={reportData.revisaoAnaliseCritica}
                  onChange={(e) => handleInputChange('revisaoAnaliseCritica', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Se houver"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* PARTE 1 - VERIFICAÇÃO DOCUMENTAL DO BOLETIM */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-blue-800 rounded-t-lg">
            <h2 className="text-lg font-bold text-white">
              PARTE 1 - VERIFICAÇÃO DOCUMENTAL DO BOLETIM (ISO/IEC 17025)
            </h2>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 1. LISTA DE VERIFICAÇÃO NBR ISO/IEC 17025 */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-blue-600 rounded-t-lg">
            <h3 className="text-lg font-bold text-white">1. LISTA DE VERIFICAÇÃO NBR ISO/IEC 17025</h3>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                      ITEM
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                      DESCRIÇÃO
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                      SIM
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                      NÃO
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                      NÃO APLICÁVEL
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                      OBSERVAÇÃO
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {checklistItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-center text-gray-900 border border-gray-300">
                        {item.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-center border border-gray-300">
                        <input
                          type="radio"
                          name={`checklist-${item.id}`}
                          checked={item.status === 'SIM'}
                          onChange={() => handleChecklistChange(item.id, 'status', 'SIM')}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center border border-gray-300">
                        <input
                          type="radio"
                          name={`checklist-${item.id}`}
                          checked={item.status === 'NÃO'}
                          onChange={() => handleChecklistChange(item.id, 'status', 'NÃO')}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center border border-gray-300">
                        <input
                          type="radio"
                          name={`checklist-${item.id}`}
                          checked={item.status === 'NÃO APLICÁVEL'}
                          onChange={() => handleChecklistChange(item.id, 'status', 'NÃO APLICÁVEL')}
                          className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 focus:ring-gray-500"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <input
                          type="text"
                          value={item.observation}
                          onChange={(e) => handleChecklistChange(item.id, 'observation', e.target.value)}
                          className="p-1 w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Observações"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 2. INFORMAÇÕES DO SOLICITANTE */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-blue-600 rounded-t-lg">
            <h3 className="text-lg font-bold text-white">2. INFORMAÇÕES DO SOLICITANTE</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Nome do Cliente/Solicitante
                </label>
                <input
                  type="text"
                  value={reportData.solicitantInfo?.nomeClienteSolicitante || ''}
                  onChange={(e) => handleNestedInputChange('solicitantInfo', 'nomeClienteSolicitante', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Contato/Responsável
                </label>
                <input
                  type="text"
                  value={reportData.solicitantInfo?.contatoResponsavelSolicitacao || ''}
                  onChange={(e) => handleNestedInputChange('solicitantInfo', 'contatoResponsavelSolicitacao', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 3. INFORMAÇÕES DA AMOSTRA */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-blue-600 rounded-t-lg">
            <h3 className="text-lg font-bold text-white">3. INFORMAÇÕES DA AMOSTRA</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Nº da Amostra
                </label>
                <input
                  type="text"
                  value={reportData.sampleInfo?.numeroAmostra || ''}
                  onChange={(e) => handleNestedInputChange('sampleInfo', 'numeroAmostra', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Data e Hora da Coleta
                </label>
                <input
                  type="datetime-local"
                  value={reportData.sampleInfo?.dataHoraColeta || ''}
                  onChange={(e) => handleNestedInputChange('sampleInfo', 'dataHoraColeta', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Local da Coleta
                </label>
                <input
                  type="text"
                  value={reportData.sampleInfo?.localColeta || ''}
                  onChange={(e) => handleNestedInputChange('sampleInfo', 'localColeta', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Ponto de Coleta (TAG)
                </label>
                <input
                  type="text"
                  value={reportData.sampleInfo?.pontoColetaTAG || ''}
                  onChange={(e) => handleNestedInputChange('sampleInfo', 'pontoColetaTAG', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Responsável pela Coleta
                </label>
                <input
                  type="text"
                  value={reportData.sampleInfo?.responsavelColeta || ''}
                  onChange={(e) => handleNestedInputChange('sampleInfo', 'responsavelColeta', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Temperatura da Amostra (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={reportData.sampleInfo?.temperaturaAmostraC || ''}
                  onChange={(e) => handleNestedInputChange('sampleInfo', 'temperaturaAmostraC', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Pressão Absoluta (kPa)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={reportData.sampleInfo?.pressaoAmostraAbsolutaKpaA || ''}
                  onChange={(e) => handleNestedInputChange('sampleInfo', 'pressaoAmostraAbsolutaKpaA', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 4. DADOS DO BOLETIM */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-blue-600 rounded-t-lg">
            <h3 className="text-lg font-bold text-white">4. DADOS DO BOLETIM</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Data Análise Laboratorial
                </label>
                <input
                  type="date"
                  value={reportData.bulletinInfo?.dataAnaliseLabEmissora || ''}
                  onChange={(e) => handleNestedInputChange('bulletinInfo', 'dataAnaliseLabEmissora', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Laboratório Emissor
                </label>
                <input
                  type="text"
                  value={reportData.bulletinInfo?.laboratorioEmissor || ''}
                  onChange={(e) => handleNestedInputChange('bulletinInfo', 'laboratorioEmissor', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Data Emissão Boletim
                </label>
                <input
                  type="date"
                  value={reportData.bulletinInfo?.dataEmissaoBoletim || ''}
                  onChange={(e) => handleNestedInputChange('bulletinInfo', 'dataEmissaoBoletim', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Data Implementação
                </label>
                <input
                  type="date"
                  value={reportData.bulletinInfo?.dataImplementacao || ''}
                  onChange={(e) => handleNestedInputChange('bulletinInfo', 'dataImplementacao', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fim da refatoração - removendo o resto das divs antigas */}
          
          {/* 2. Informações do Solicitante */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('parte1', 'item2')}
              className="flex justify-between items-center p-4 w-full text-left transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <h3 className="font-semibold text-blue-800 text-md">2. INFORMAÇÕES DO SOLICITANTE</h3>
              <span className="text-lg text-blue-800">
                {expandedSections.parte1.item2 ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSections.parte1.item1 && (
              <div className="p-6 pt-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                    <thead className="bg-blue-600">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                          ITEM
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                          DESCRIÇÃO
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                          SIM
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                          NÃO
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                          NÃO APLICÁVEL
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">
                          OBSERVAÇÃO
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {checklistItems.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm font-medium text-center text-gray-900 border border-gray-300">
                            {item.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-center border border-gray-300">
                            <input
                              type="radio"
                              name={`checklist-${item.id}`}
                              checked={item.status === 'SIM'}
                              onChange={() => handleChecklistChange(item.id, 'status', 'SIM')}
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center border border-gray-300">
                            <input
                              type="radio"
                              name={`checklist-${item.id}`}
                              checked={item.status === 'NÃO'}
                              onChange={() => handleChecklistChange(item.id, 'status', 'NÃO')}
                              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center border border-gray-300">
                            <input
                              type="radio"
                              name={`checklist-${item.id}`}
                              checked={item.status === 'NÃO APLICÁVEL'}
                              onChange={() => handleChecklistChange(item.id, 'status', 'NÃO APLICÁVEL')}
                              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 focus:ring-gray-500"
                            />
                          </td>
                          <td className="px-4 py-3 border border-gray-300">
                            <input
                              type="text"
                              value={item.observation}
                              onChange={(e) => handleChecklistChange(item.id, 'observation', e.target.value)}
                              className="p-1 w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Observações"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 2. Informações do Solicitante */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('parte1', 'item2')}
              className="flex justify-between items-center p-4 w-full text-left transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <h3 className="font-semibold text-blue-800 text-md">2. INFORMAÇÕES DO SOLICITANTE</h3>
              <span className="text-lg text-blue-800">
                {expandedSections.parte1.item2 ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSections.parte1.item2 && (
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Nome do Cliente/Solicitante
                    </label>
                    <input
                      type="text"
                      value={reportData.solicitantInfo?.nomeClienteSolicitante || ''}
                      onChange={(e) => handleNestedInputChange('solicitantInfo', 'nomeClienteSolicitante', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Contato/Responsável
                    </label>
                    <input
                      type="text"
                      value={reportData.solicitantInfo?.contatoResponsavelSolicitacao || ''}
                      onChange={(e) => handleNestedInputChange('solicitantInfo', 'contatoResponsavelSolicitacao', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Informações da Amostra */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('parte1', 'item3')}
              className="flex justify-between items-center p-4 w-full text-left transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <h3 className="font-semibold text-blue-800 text-md">3. INFORMAÇÕES DA AMOSTRA</h3>
              <span className="text-lg text-blue-800">
                {expandedSections.parte1.item3 ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSections.parte1.item3 && (
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Nº da Amostra
                    </label>
                    <input
                      type="text"
                      value={reportData.sampleInfo?.numeroAmostra || ''}
                      onChange={(e) => handleNestedInputChange('sampleInfo', 'numeroAmostra', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Data e Hora da Coleta
                    </label>
                    <input
                      type="datetime-local"
                      value={reportData.sampleInfo?.dataHoraColeta || ''}
                      onChange={(e) => handleNestedInputChange('sampleInfo', 'dataHoraColeta', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Local da Coleta
                    </label>
                    <input
                      type="text"
                      value={reportData.sampleInfo?.localColeta || ''}
                      onChange={(e) => handleNestedInputChange('sampleInfo', 'localColeta', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Ponto de Coleta (TAG)
                    </label>
                    <input
                      type="text"
                      value={reportData.sampleInfo?.pontoColetaTAG || ''}
                      onChange={(e) => handleNestedInputChange('sampleInfo', 'pontoColetaTAG', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Poço (Apropriação)
                    </label>
                    <input
                      type="text"
                      value={reportData.sampleInfo?.pocoApropriacao || ''}
                      onChange={(e) => handleNestedInputChange('sampleInfo', 'pocoApropriacao', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Pressão Absoluta (kPa.a)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={reportData.sampleInfo?.pressaoAmostraAbsolutaKpaA || ''}
                      onChange={(e) => handleNestedInputChange('sampleInfo', 'pressaoAmostraAbsolutaKpaA', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Pressão Manométrica (kPa)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={reportData.sampleInfo?.pressaoAmostraManometricaKpa || ''}
                      onChange={(e) => handleNestedInputChange('sampleInfo', 'pressaoAmostraManometricaKpa', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Temperatura (K)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={reportData.sampleInfo?.temperaturaAmostraK || ''}
                      onChange={(e) => handleNestedInputChange('sampleInfo', 'temperaturaAmostraK', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Temperatura (°C)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={reportData.sampleInfo?.temperaturaAmostraC || ''}
                      onChange={(e) => handleNestedInputChange('sampleInfo', 'temperaturaAmostraC', e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Dados do Boletim */}
          <div className="p-6">
            <h3 className="mb-4 font-semibold text-blue-800 text-md">4. DADOS DO BOLETIM</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Data Análise Laboratorial
                </label>
                <input
                  type="date"
                  value={reportData.bulletinInfo?.dataAnaliseLaboratorial || ''}
                  onChange={(e) => handleNestedInputChange('bulletinInfo', 'dataAnaliseLaboratorial', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Data Emissão Boletim
                </label>
                <input
                  type="date"
                  value={reportData.bulletinInfo?.dataEmissaoBoletim || ''}
                  onChange={(e) => handleNestedInputChange('bulletinInfo', 'dataEmissaoBoletim', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Laboratório Emissor
                </label>
                <input
                  type="text"
                  value={reportData.bulletinInfo?.laboratorioEmissor || ''}
                  onChange={(e) => handleNestedInputChange('bulletinInfo', 'laboratorioEmissor', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Data Implementação
                </label>
                <input
                  type="date"
                  value={reportData.bulletinInfo?.dataRecebimentoBoletimSolicitante || ''}
                  onChange={(e) => handleNestedInputChange('bulletinInfo', 'dataRecebimentoBoletimSolicitante', e.target.value)}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 5. COMPOSIÇÃO MOLAR E INCERTEZAS */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-blue-600 rounded-t-lg">
            <h3 className="text-lg font-bold text-white">5. COMPOSIÇÃO MOLAR E INCERTEZAS</h3>
        </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Componente</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">% Molar</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Incerteza %</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status AGA-8</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status CEP</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.components.map((component, index) => (
                    <tr key={component.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {component.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <input
                          type="number"
                          step="0.0001"
                          value={component.molarPercent}
                          onChange={(e) => handleComponentChange(component.id, 'molarPercent', e.target.value)}
                          onBlur={() => handleComponentBlur(component.id, 'molarPercent', component.name)}
                          className="p-1 w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <input
                          type="number"
                          step="0.0001"
                          value={component.incertezaAssociadaPercent}
                          onChange={(e) => handleComponentChange(component.id, 'incertezaAssociadaPercent', e.target.value)}
                          className="p-1 w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={component.aga8Status} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={component.cepStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Validação da composição molar */}
            <div className="mt-4 p-3 rounded-lg ${molarValidation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}">
              <p className="text-sm font-medium ${molarValidation.isValid ? 'text-green-800' : 'text-red-800'}">
                Total: {molarValidation.total.toFixed(4)}% mol - {molarValidation.message}
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 6. PROPRIEDADES DO GÁS - CONDIÇÕES PADRÃO */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-blue-600 rounded-t-lg">
            <h3 className="text-lg font-bold text-white">6. PROPRIEDADES DO GÁS - CONDIÇÕES PADRÃO</h3>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Propriedade</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Valor</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Incerteza Expandida</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status CEP</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.standardProperties.map((property, index) => (
                    <tr key={property.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {property.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <input
                          type="number"
                          step="0.0001"
                          value={property.value}
                          onChange={(e) => handleStandardPropertyChange(property.id, 'value', e.target.value)}
                          className="p-1 w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <input
                          type="number"
                          step="0.0001"
                          value={property.incertezaExpandida}
                          onChange={(e) => handleStandardPropertyChange(property.id, 'incertezaExpandida', e.target.value)}
                          className="p-1 w-full text-sm rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={property.cepStatus || ValidationStatus.Pendente} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* OBSERVAÇÕES */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-gray-600 rounded-t-lg">
            <h3 className="text-lg font-bold text-white">OBSERVAÇÕES</h3>
          </div>
          
          <div className="p-6">
            <textarea
              value={reportData.observacoesBoletim}
              onChange={(e) => handleInputChange('observacoesBoletim', e.target.value)}
              rows={4}
              className="p-3 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Inserir observações feitas no boletim..."
            />
          </div>
        </div>

        {/* ====================================================================== */}
        {/* PARTE 2 - VALIDAÇÃO TÉCNICA E METROLÓGICA */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-teal-700 rounded-t-lg">
            <h2 className="text-lg font-bold text-white">
              PARTE 2 - VALIDAÇÃO TÉCNICA E METROLÓGICA DOS RESULTADOS
            </h2>
          </div>
          
          {/* 5. Tabela de Componentes Validados */}
          <div className="border-b border-gray-200">
            <button 
              onClick={() => toggleSection('parte2', 'item5')}
              className="flex justify-between items-center p-4 w-full text-left transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <h3 className="font-semibold text-blue-800 text-md">5. RESULTADOS DA VALIDAÇÃO - COMPONENTES</h3>
              <span className="text-lg text-blue-800">
                {expandedSections.parte2.item5 ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSections.parte2.item5 && (
              <div className="p-6 pt-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                    <thead className="bg-blue-900">
                      <tr>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">Item</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">Componente</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">% Molar</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">Status AGA8</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">Status CEP</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border border-gray-300" colSpan={2}>AGA8</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700 border border-gray-300" colSpan={2}>CEP</th>
                      </tr>
                      <tr>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border border-gray-300"></th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border border-gray-300"></th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border border-gray-300"></th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border border-gray-300"></th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border border-gray-300"></th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border border-gray-300">Limite Inferior</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border border-gray-300">Limite Superior</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700 border border-gray-300">Limite Inferior</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700 border border-gray-300">Limite Superior</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.components.map((component, index) => {
                        const molarValue = parseFloat(component.molarPercent) || 0;
                        const isValidated = component.molarPercent && molarValue > 0;
                        const cepResult = cepComponentResults.find(r => r.componentName === component.name);
                        
                        return (
                          <tr key={component.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 text-sm font-medium text-center text-gray-900 border border-gray-300">
                              {component.id}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 border border-gray-300">
                              {component.name}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-900 border border-gray-300">
                              {isValidated ? `${molarValue.toFixed(3)}%` : '---'}
                            </td>
                            <td className="px-3 py-2 text-sm text-center border border-gray-300">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                component.aga8Status === ValidationStatus.OK ? 'bg-green-100 text-green-800' :
                                component.aga8Status === ValidationStatus.ForaDaFaixa ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isValidated ? (component.aga8Status === ValidationStatus.OK ? 'VALIDADO' : 
                                                component.aga8Status === ValidationStatus.ForaDaFaixa ? 'INVÁLIDO' : 'PENDENTE') : '***'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-sm text-center border border-gray-300">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                component.cepStatus === ValidationStatus.OK ? 'bg-green-100 text-green-800' :
                                component.cepStatus === ValidationStatus.ForaDaFaixa ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isValidated ? (component.cepStatus === ValidationStatus.OK ? 'VALIDADO' : 
                                               component.cepStatus === ValidationStatus.ForaDaFaixa ? 'INVÁLIDO' : 'INVÁLIDO') : 'INVÁLIDO'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-900 border border-gray-300">
                              {isValidated ? `${component.aga8Min}%` : '0%'}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-900 border border-gray-300">
                              {isValidated ? `${component.aga8Max}%` : '100%'}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-900 border border-gray-300">
                              {cepResult?.statistics.lowerControlLimit ? cepResult.statistics.lowerControlLimit.toFixed(3) + '%' : '***'}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-900 border border-gray-300">
                              {cepResult?.statistics.upperControlLimit ? cepResult.statistics.upperControlLimit.toFixed(3) + '%' : '***'}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Linha de Total */}
                      <tr className="font-semibold bg-yellow-200">
                        <td className="px-3 py-2 text-sm text-center text-gray-900 border border-gray-300"></td>
                        <td className="px-3 py-2 text-sm text-gray-900 border border-gray-300">TOTAL</td>
                        <td className="px-3 py-2 text-sm text-center text-gray-900 border border-gray-300">
                          {molarValidation.total.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-sm text-center border border-gray-300" colSpan={6}>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            molarValidation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {molarValidation.isValid ? '100%' : `${molarValidation.total.toFixed(2)}%`}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 6. Tabela de Propriedades Validadas */}
          <div className="border-b border-gray-200">
            <button 
              onClick={() => toggleSection('parte2', 'item6')}
              className="flex justify-between items-center p-4 w-full text-left transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <h3 className="font-semibold text-blue-800 text-md">6. RESULTADOS DA VALIDAÇÃO - PROPRIEDADES</h3>
              <span className="text-lg text-blue-800">
                {expandedSections.parte2.item6 ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSections.parte2.item6 && (
              <div className="p-6 pt-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                    <thead className="bg-blue-900">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">Propriedade</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">Valor</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">Status AGA8</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border border-gray-300">Status CEP</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border border-gray-300" colSpan={2}>AGA8</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700 border border-gray-300" colSpan={2}>CEP</th>
                      </tr>
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border border-gray-300"></th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border border-gray-300"></th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border border-gray-300"></th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border border-gray-300"></th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border border-gray-300">Limite Inferior</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border border-gray-300">Limite Superior</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700 border border-gray-300">Limite Inferior</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700 border border-gray-300">Limite Superior</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.standardProperties.map((property, index) => {
                        const propertyValue = parseFloat(property.value) || 0;
                        const isValidated = property.value && propertyValue > 0;
                                                 const cepResult = cepPropertyResults.find(r => r.componentName === property.name);
                        
                        return (
                          <tr key={property.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                              {property.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border border-gray-300">
                              {isValidated ? propertyValue.toFixed(4) : '***'}
                            </td>
                            <td className="px-4 py-3 text-sm text-center border border-gray-300">
                              <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded">
                                ***
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center border border-gray-300">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                property.cepStatus === ValidationStatus.OK ? 'bg-green-100 text-green-800' :
                                property.cepStatus === ValidationStatus.ForaDaFaixa ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isValidated ? (property.cepStatus === ValidationStatus.OK ? 'VALIDADO' : 'INVÁLIDO') : 'INVÁLIDO'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border border-gray-300">***</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border border-gray-300">***</td>
                                                         <td className="px-4 py-3 text-sm text-center text-gray-900 border border-gray-300">
                               {cepResult?.statistics.lowerControlLimit ? cepResult.statistics.lowerControlLimit.toFixed(4) : '***'}
                             </td>
                             <td className="px-4 py-3 text-sm text-center text-gray-900 border border-gray-300">
                               {cepResult?.statistics.upperControlLimit ? cepResult.statistics.upperControlLimit.toFixed(4) : '***'}
                             </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================================== */}
        {/* AÇÕES E ENTRADA MANUAL */}
        {/* ====================================================================== */}
        
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 bg-purple-600 rounded-t-lg">
            <h3 className="text-lg font-bold text-white">AÇÕES E FERRAMENTAS</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <button
                onClick={() => setShowManualEntryModal(true)}
                className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
              >
                ✏️ Entrada Manual
              </button>
              
              <button
                onClick={() => {
                  if (validateAndNotifyRequiredFields()) {
                    handleManualCEPValidation();
                  }
                }}
                disabled={isCEPValidating}
                className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-purple-600 rounded-lg transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {isCEPValidating ? '⏳ Validando...' : '🔄 Revalidar CEP'}
            </button>
          
              <button
                onClick={() => {
                  if (validateAndNotifyRequiredFields()) {
                    handleAddCEPToHistory();
                  }
                }}
                className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
              >
                💾 Adicionar ao Histórico CEP
              </button>
            
            <button
                onClick={() => setShowCEPHistoryModal(true)}
                className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-indigo-600 rounded-lg transition-colors hover:bg-indigo-700"
            >
                📈 Ver Histórico CEP
            </button>
            
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja limpar todo o histórico CEP? Esta ação não pode ser desfeita.')) {
                    clearCEPHistory();
                  }
                }}
                className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
              >
                🗑️ Limpar Histórico CEP
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* MODAIS */}
        {/* ====================================================================== */}
        
        {/* Modal de Entrada Manual */}
        {showManualEntryModal && (
          <ManualEntryModal
            isOpen={showManualEntryModal}
            onClose={() => setShowManualEntryModal(false)}
            onDataSubmit={handleManualDataSubmit}
          />
        )}
        
        {/* Modal do Histórico CEP */}
        <CEPHistoryViewer
          isOpen={showCEPHistoryModal}
          onClose={() => setShowCEPHistoryModal(false)}
        />
        
        {/* Sistema de Notificações */}
        <NotificationSystem 
          notifications={notifications} 
          onRemove={removeNotification} 
        />
      </div>
    );
};

export default App;
