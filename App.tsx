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
  const [requiredFieldsValidation, setRequiredFieldsValidation] = useState({ isValid: true, missingFields: [] as string[] });

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
   const [expandedSections] = useState({
     parte1: {
       item1: true, // Lista de verificação sempre expandida por padrão
       item2: true,
       item3: true,
       item4: true,
       item5: true,
       item6: true
     },
     parte2: {
       item5: true,
       item6: true,
       item7: true,
       item8: true
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

  // Sincronizar resultados CEP com componentes e propriedades
  useEffect(() => {
    let hasChanges = false;
    
    // Atualizar componentes com resultados CEP
    const updatedComponents = reportData.components.map(comp => {
      const cepResult = cepComponentResults.find(r => r.componentName === comp.name);
      if (cepResult && cepResult.statistics.sampleCount >= 2) {
        const newCepStatus = cepResult.status;
        const newLowerLimit = cepResult.statistics.lowerControlLimit.toFixed(3);
        const newUpperLimit = cepResult.statistics.upperControlLimit.toFixed(3);
        
        if (comp.cepStatus !== newCepStatus || 
            comp.cepLowerLimit !== newLowerLimit || 
            comp.cepUpperLimit !== newUpperLimit) {
          hasChanges = true;
          return {
            ...comp,
            cepStatus: newCepStatus,
            cepLowerLimit: newLowerLimit,
            cepUpperLimit: newUpperLimit
          };
        }
      }
      return comp;
    });

    // Atualizar propriedades com resultados CEP
    const updatedProperties = reportData.standardProperties.map(prop => {
      const cepResult = cepPropertyResults.find(r => r.componentName === prop.name);
      if (cepResult && cepResult.statistics.sampleCount >= 2) {
        const newCepStatus = cepResult.status;
        const newLowerLimit = cepResult.statistics.lowerControlLimit.toFixed(4);
        const newUpperLimit = cepResult.statistics.upperControlLimit.toFixed(4);
        
        if (prop.cepStatus !== newCepStatus || 
            prop.cepLowerLimit !== newLowerLimit || 
            prop.cepUpperLimit !== newUpperLimit) {
          hasChanges = true;
          return {
            ...prop,
            cepStatus: newCepStatus,
            cepLowerLimit: newLowerLimit,
            cepUpperLimit: newUpperLimit
          };
        }
      }
      return prop;
    });

    // Aplicar mudanças se houver
    if (hasChanges) {
      setReportData(prev => ({
        ...prev,
        components: updatedComponents,
        standardProperties: updatedProperties
      }));
    }
  }, [cepComponentResults, cepPropertyResults, reportData.components, reportData.standardProperties]);

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
    
    // Executar validação CEP automaticamente quando % molar é alterado
    if (field === 'molarPercent' && value && String(value).trim() !== '') {
      setTimeout(() => runCEPValidation(), 500); // Delay para aguardar setState
    }
  }, [runCEPValidation]);
  
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



  // ============================================================================
  // DADOS HISTÓRICOS PARA IMPORTAÇÃO
  // ============================================================================
  
  // Função para importar dados históricos da tabela fornecida pelo usuário
  const importHistoricalData = useCallback(() => {
    // Dados extraídos da imagem fornecida - 15 primeiras linhas da tabela histórica
    const historicalSamples = [
      {
        boletimNumber: "328.19REV.00",
        date: "2019-03-20",
        components: {
          "Metano (C₁)": 99.063,
          "Etano (C₂)": 0.096,
          "Propano (C₃)": 0.009,
          "i-Butano (iC₄)": 0.003,
          "n-Butano (nC₄)": 0.003,
          "Isopentano": 0.000,
          "N-Pentano": 0.001,
          "Hexano": 0.001,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.230,
          "Dióxido de Carbono (CO₂)": 0.594
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.677,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "414.19REV.00",
        date: "2019-04-13",
        components: {
          "Metano (C₁)": 99.046,
          "Etano (C₂)": 0.086,
          "Propano (C₃)": 0.009,
          "i-Butano (iC₄)": 0.002,
          "n-Butano (nC₄)": 0.003,
          "Isopentano": 0.000,
          "N-Pentano": 0.001,
          "Hexano": 0.001,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.241,
          "Dióxido de Carbono (CO₂)": 0.611
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.677,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "518.19REV.00",
        date: "2019-05-09",
        components: {
          "Metano (C₁)": 99.053,
          "Etano (C₂)": 0.085,
          "Propano (C₃)": 0.009,
          "i-Butano (iC₄)": 0.003,
          "n-Butano (nC₄)": 0.003,
          "Isopentano": 0.000,
          "N-Pentano": 0.001,
          "Hexano": 0.001,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.246,
          "Dióxido de Carbono (CO₂)": 0.599
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.677,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "629.19REV.00",
        date: "2019-06-20",
        components: {
          "Metano (C₁)": 98.982,
          "Etano (C₂)": 0.091,
          "Propano (C₃)": 0.010,
          "i-Butano (iC₄)": 0.000,
          "n-Butano (nC₄)": 0.005,
          "Isopentano": 0.000,
          "N-Pentano": 0.001,
          "Hexano": 0.001,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.253,
          "Dióxido de Carbono (CO₂)": 0.720
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.679,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "699.19REV.00",
        date: "2019-07-01",
        components: {
          "Metano (C₁)": 98.933,
          "Etano (C₂)": 0.081,
          "Propano (C₃)": 0.008,
          "i-Butano (iC₄)": 0.000,
          "n-Butano (nC₄)": 0.004,
          "Isopentano": 0.000,
          "N-Pentano": 0.000,
          "Hexano": 0.001,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.252,
          "Dióxido de Carbono (CO₂)": 0.721
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.679,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "779.19REV.00",
        date: "2019-08-07",
        components: {
          "Metano (C₁)": 98.579,
          "Etano (C₂)": 0.090,
          "Propano (C₃)": 0.008,
          "i-Butano (iC₄)": 0.000,
          "n-Butano (nC₄)": 0.005,
          "Isopentano": 0.000,
          "N-Pentano": 0.001,
          "Hexano": 0.001,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.253,
          "Dióxido de Carbono (CO₂)": 1.170
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.679,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "899.19REV.00",
        date: "2019-08-15",
        components: {
          "Metano (C₁)": 98.827,
          "Etano (C₂)": 0.088,
          "Propano (C₃)": 0.009,
          "i-Butano (iC₄)": 0.004,
          "n-Butano (nC₄)": 0.002,
          "Isopentano": 0.001,
          "N-Pentano": 0.001,
          "Hexano": 0.001,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.245,
          "Dióxido de Carbono (CO₂)": 0.777
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.679,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "944.19REV.00",
        date: "2019-11-09",
        components: {
          "Metano (C₁)": 98.696,
          "Etano (C₂)": 0.089,
          "Propano (C₃)": 0.009,
          "i-Butano (iC₄)": 0.004,
          "n-Butano (nC₄)": 0.001,
          "Isopentano": 0.000,
          "N-Pentano": 0.000,
          "Hexano": 0.001,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.217,
          "Dióxido de Carbono (CO₂)": 0.783
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.679,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "962.19REV.00",
        date: "2019-12-27",
        components: {
          "Metano (C₁)": 98.916,
          "Etano (C₂)": 0.081,
          "Propano (C₃)": 0.008,
          "i-Butano (iC₄)": 0.002,
          "n-Butano (nC₄)": 0.004,
          "Isopentano": 0.000,
          "N-Pentano": 0.000,
          "Hexano": 0.000,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.239,
          "Dióxido de Carbono (CO₂)": 0.750
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.679,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "1074.19REV.00",
        date: "2019-10-24",
        components: {
          "Metano (C₁)": 98.857,
          "Etano (C₂)": 0.093,
          "Propano (C₃)": 0.010,
          "i-Butano (iC₄)": 0.003,
          "n-Butano (nC₄)": 0.004,
          "Isopentano": 0.001,
          "N-Pentano": 0.001,
          "Hexano": 0.000,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.233,
          "Dióxido de Carbono (CO₂)": 0.798
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.679,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "1149.19REV.00",
        date: "2019-11-20",
        components: {
          "Metano (C₁)": 98.856,
          "Etano (C₂)": 0.085,
          "Propano (C₃)": 0.009,
          "i-Butano (iC₄)": 0.003,
          "n-Butano (nC₄)": 0.004,
          "Isopentano": 0.000,
          "N-Pentano": 0.000,
          "Hexano": 0.001,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.210,
          "Dióxido de Carbono (CO₂)": 0.813
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.680,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "1228.19REV.00",
        date: "2019-12-18",
        components: {
          "Metano (C₁)": 98.853,
          "Etano (C₂)": 0.089,
          "Propano (C₃)": 0.009,
          "i-Butano (iC₄)": 0.003,
          "n-Butano (nC₄)": 0.004,
          "Isopentano": 0.001,
          "N-Pentano": 0.001,
          "Hexano": 0.001,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.295,
          "Dióxido de Carbono (CO₂)": 0.744
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.679,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "0056.20REV.00",
        date: "2020-01-16",
        components: {
          "Metano (C₁)": 98.899,
          "Etano (C₂)": 0.089,
          "Propano (C₃)": 0.000,
          "i-Butano (iC₄)": 0.003,
          "n-Butano (nC₄)": 0.004,
          "Isopentano": 0.000,
          "N-Pentano": 0.000,
          "Hexano": 0.000,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.257,
          "Dióxido de Carbono (CO₂)": 0.748
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.679,
          molarMass: 16.3000
        }
      },
      {
        boletimNumber: "0156.20REV.00",
        date: "2020-02-11",
        components: {
          "Metano (C₁)": 99.025,
          "Etano (C₂)": 0.081,
          "Propano (C₃)": 0.000,
          "i-Butano (iC₄)": 0.001,
          "n-Butano (nC₄)": 0.002,
          "Isopentano": 0.000,
          "N-Pentano": 0.000,
          "Hexano": 0.000,
          "Heptano": 0.000,
          "Octano": 0.000,
          "Nonano": 0.000,
          "Decano": 0.000,
          "Oxigênio": 0.000,
          "Nitrogênio (N₂)": 0.150,
          "Dióxido de Carbono (CO₂)": 0.741
        },
        properties: {
          compressibilityFactor: 0.9981,
          specificMass: 0.678,
          molarMass: 16.3000
        }
      },
             {
         boletimNumber: "0933.21REV.00",
         date: "2021-12-09",
         components: {
           "Metano (C₁)": 97.815,
           "Etano (C₂)": 0.265,
           "Propano (C₃)": 0.199,
           "i-Butano (iC₄)": 0.000,
           "n-Butano (nC₄)": 0.009,
           "Isopentano": 0.000,
           "N-Pentano": 0.000,
           "Hexano": 0.000,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.872,
           "Dióxido de Carbono (CO₂)": 0.849
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.686,
           molarMass: 16.4777
         }
       },
       // Dados restantes da segunda imagem (2022-2024)
       {
         boletimNumber: "0133.22REV.00",
         date: "2022-02-04",
         components: {
           "Metano (C₁)": 98.636,
           "Etano (C₂)": 0.080,
           "Propano (C₃)": 0.104,
           "i-Butano (iC₄)": 0.000,
           "n-Butano (nC₄)": 0.000,
           "Isopentano": 0.000,
           "N-Pentano": 0.000,
           "Hexano": 0.000,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.298,
           "Dióxido de Carbono (CO₂)": 0.882
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.682,
           molarMass: 16.3660
         }
       },
       {
         boletimNumber: "0259.22REV.00",
         date: "2022-03-03",
         components: {
           "Metano (C₁)": 99.502,
           "Etano (C₂)": 0.082,
           "Propano (C₃)": 0.150,
           "i-Butano (iC₄)": 0.001,
           "n-Butano (nC₄)": 0.002,
           "Isopentano": 0.001,
           "N-Pentano": 0.001,
           "Hexano": 0.001,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.542,
           "Dióxido de Carbono (CO₂)": 0.718
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.682,
           molarMass: 16.3650
         }
       },
       {
         boletimNumber: "0371.22REV.00",
         date: "2022-04-01",
         components: {
           "Metano (C₁)": 98.636,
           "Etano (C₂)": 0.081,
           "Propano (C₃)": 0.048,
           "i-Butano (iC₄)": 0.000,
           "n-Butano (nC₄)": 0.007,
           "Isopentano": 0.000,
           "N-Pentano": 0.001,
           "Hexano": 0.003,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.324,
           "Dióxido de Carbono (CO₂)": 0.899
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.682,
           molarMass: 16.3562
         }
       },
       {
         boletimNumber: "0463.22REV.00",
         date: "2022-04-29",
         components: {
           "Metano (C₁)": 98.401,
           "Etano (C₂)": 0.082,
           "Propano (C₃)": 0.318,
           "i-Butano (iC₄)": 0.001,
           "n-Butano (nC₄)": 0.004,
           "Isopentano": 0.000,
           "N-Pentano": 0.000,
           "Hexano": 0.001,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.286,
           "Dióxido de Carbono (CO₂)": 0.907
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.685,
           molarMass: 16.4347
         }
       },
       {
         boletimNumber: "0549.22REV.00",
         date: "2022-05-26",
         components: {
           "Metano (C₁)": 98.642,
           "Etano (C₂)": 0.077,
           "Propano (C₃)": 0.081,
           "i-Butano (iC₄)": 0.000,
           "n-Butano (nC₄)": 0.003,
           "Isopentano": 0.000,
           "N-Pentano": 0.000,
           "Hexano": 0.001,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.293,
           "Dióxido de Carbono (CO₂)": 0.903
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.682,
           molarMass: 16.3666
         }
       },
       {
         boletimNumber: "0693.22REV.00",
         date: "2022-06-17",
         components: {
           "Metano (C₁)": 98.521,
           "Etano (C₂)": 0.090,
           "Propano (C₃)": 0.092,
           "i-Butano (iC₄)": 0.004,
           "n-Butano (nC₄)": 0.013,
           "Isopentano": 0.008,
           "N-Pentano": 0.013,
           "Hexano": 0.024,
           "Heptano": 0.021,
           "Octano": 0.012,
           "Nonano": 0.003,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.280,
           "Dióxido de Carbono (CO₂)": 0.929
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.685,
           molarMass: 16.4419
         }
       },
       {
         boletimNumber: "1232.22REV.00",
         date: "2022-10-18",
         components: {
           "Metano (C₁)": 98.220,
           "Etano (C₂)": 0.072,
           "Propano (C₃)": 0.017,
           "i-Butano (iC₄)": 0.002,
           "n-Butano (nC₄)": 0.004,
           "Isopentano": 0.000,
           "N-Pentano": 0.001,
           "Hexano": 0.001,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.953,
           "Dióxido de Carbono (CO₂)": 0.724
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.679,
           molarMass: 16.3058
         }
       },
       {
         boletimNumber: "1315.22REV.00",
         date: "2022-11-09",
         components: {
           "Metano (C₁)": 98.348,
           "Etano (C₂)": 0.076,
           "Propano (C₃)": 0.014,
           "i-Butano (iC₄)": 0.002,
           "n-Butano (nC₄)": 0.003,
           "Isopentano": 0.001,
           "N-Pentano": 0.001,
           "Hexano": 0.001,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.666,
           "Dióxido de Carbono (CO₂)": 0.888
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.683,
           molarMass: 16.3630
         }
       },
       {
         boletimNumber: "1412.22REV.00",
         date: "2022-12-27",
         components: {
           "Metano (C₁)": 98.450,
           "Etano (C₂)": 0.078,
           "Propano (C₃)": 0.230,
           "i-Butano (iC₄)": 0.000,
           "n-Butano (nC₄)": 0.004,
           "Isopentano": 0.000,
           "N-Pentano": 0.000,
           "Hexano": 0.001,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.324,
           "Dióxido de Carbono (CO₂)": 0.913
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.684,
           molarMass: 16.4160
         }
       },
       {
         boletimNumber: "0113.23REV.00",
         date: "2023-02-14",
         components: {
           "Metano (C₁)": 98.656,
           "Etano (C₂)": 0.077,
           "Propano (C₃)": 0.000,
           "i-Butano (iC₄)": 0.004,
           "n-Butano (nC₄)": 0.000,
           "Isopentano": 0.000,
           "N-Pentano": 0.001,
           "Hexano": 0.000,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.307,
           "Dióxido de Carbono (CO₂)": 0.925
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.681,
           molarMass: 16.3520
         }
       },
       {
         boletimNumber: "0180.23REV.00",
         date: "2023-03-15",
         components: {
           "Metano (C₁)": 98.445,
           "Etano (C₂)": 0.081,
           "Propano (C₃)": 0.135,
           "i-Butano (iC₄)": 0.004,
           "n-Butano (nC₄)": 0.005,
           "Isopentano": 0.000,
           "N-Pentano": 0.000,
           "Hexano": 0.001,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.330,
           "Dióxido de Carbono (CO₂)": 0.998
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.684,
           molarMass: 16.4160
         }
       },
       {
         boletimNumber: "0243.23REV.00",
         date: "2023-04-06",
         components: {
           "Metano (C₁)": 99.614,
           "Etano (C₂)": 0.078,
           "Propano (C₃)": 0.001,
           "i-Butano (iC₄)": 0.002,
           "n-Butano (nC₄)": 0.004,
           "Isopentano": 0.000,
           "N-Pentano": 0.000,
           "Hexano": 0.001,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.378,
           "Dióxido de Carbono (CO₂)": 1.692
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.683,
           molarMass: 16.4050
         }
       },
       {
         boletimNumber: "0320.23REV.00",
         date: "2023-04-28",
         components: {
           "Metano (C₁)": 98.667,
           "Etano (C₂)": 0.082,
           "Propano (C₃)": 0.001,
           "i-Butano (iC₄)": 0.002,
           "n-Butano (nC₄)": 0.005,
           "Isopentano": 0.001,
           "N-Pentano": 0.000,
           "Hexano": 0.000,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.252,
           "Dióxido de Carbono (CO₂)": 0.790
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.679,
           molarMass: 16.3100
         }
       },
       {
         boletimNumber: "0403.23REV.00",
         date: "2023-05-07",
         components: {
           "Metano (C₁)": 99.063,
           "Etano (C₂)": 0.074,
           "Propano (C₃)": 0.000,
           "i-Butano (iC₄)": 0.002,
           "n-Butano (nC₄)": 0.004,
           "Isopentano": 0.000,
           "N-Pentano": 0.000,
           "Hexano": 0.001,
           "Heptano": 0.000,
           "Octano": 0.000,
           "Nonano": 0.000,
           "Decano": 0.000,
           "Oxigênio": 0.000,
           "Nitrogênio (N₂)": 0.270,
           "Dióxido de Carbono (CO₂)": 0.586
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.677,
           molarMass: 16.2520
         }
       },
       {
         boletimNumber: "PTI23-10970",
         date: "2023-12-20",
         components: {
           "Metano (C₁)": 97.626,
           "Etano (C₂)": 0.085,
           "Propano (C₃)": 0.140,
           "i-Butano (iC₄)": 0.021,
           "n-Butano (nC₄)": 0.091,
           "Isopentano": 0.099,
           "N-Pentano": 0.219,
           "Hexano": 0.458,
           "Heptano": 0.162,
           "Octano": 0.017,
           "Nonano": 0.001,
           "Decano": 0.000,
           "Oxigênio": 0.011,
           "Nitrogênio (N₂)": 0.405,
           "Dióxido de Carbono (CO₂)": 0.665
         },
         properties: {
           compressibilityFactor: 0.9979,
           specificMass: 0.710,
           molarMass: 17.0313
         }
       },
       {
         boletimNumber: "PTI23-11279",
         date: "2024-01-18",
         components: {
           "Metano (C₁)": 99.101,
           "Etano (C₂)": 0.086,
           "Propano (C₃)": 0.516,
           "i-Butano (iC₄)": 0.002,
           "n-Butano (nC₄)": 0.009,
           "Isopentano": 0.003,
           "N-Pentano": 0.003,
           "Hexano": 0.011,
           "Heptano": 0.011,
           "Octano": 0.005,
           "Nonano": 0.002,
           "Decano": 0.000,
           "Oxigênio": 0.015,
           "Nitrogênio (N₂)": 0.349,
           "Dióxido de Carbono (CO₂)": 0.782
         },
         properties: {
           compressibilityFactor: 0.9980,
           specificMass: 0.689,
           molarMass: 16.5274
         }
       },
       {
         boletimNumber: "PTI24-11127",
         date: "2024-02-15",
         components: {
           "Metano (C₁)": 97.289,
           "Etano (C₂)": 0.131,
           "Propano (C₃)": 0.139,
           "i-Butano (iC₄)": 0.010,
           "n-Butano (nC₄)": 0.027,
           "Isopentano": 0.008,
           "N-Pentano": 0.013,
           "Hexano": 0.027,
           "Heptano": 0.022,
           "Octano": 0.014,
           "Nonano": 0.003,
           "Decano": 0.000,
           "Oxigênio": 0.020,
           "Nitrogênio (N₂)": 1.133,
           "Dióxido de Carbono (CO₂)": 0.784
         },
         properties: {
           compressibilityFactor: 0.9981,
           specificMass: 0.691,
           molarMass: 16.5859
         }
       },
       {
         boletimNumber: "PTI24-12161",
         date: "2024-03-07",
         components: {
           "Metano (C₁)": 97.151,
           "Etano (C₂)": 0.160,
           "Propano (C₃)": 0.594,
           "i-Butano (iC₄)": 0.026,
           "n-Butano (nC₄)": 0.075,
           "Isopentano": 0.040,
           "N-Pentano": 0.077,
           "Hexano": 0.170,
           "Heptano": 0.112,
           "Octano": 0.018,
           "Nonano": 0.001,
           "Decano": 0.000,
           "Oxigênio": 0.104,
           "Nitrogênio (N₂)": 0.684,
           "Dióxido de Carbono (CO₂)": 0.788
         },
         properties: {
           compressibilityFactor: 0.9979,
           specificMass: 0.704,
           molarMass: 16.8914
         }
       },
       {
         boletimNumber: "PTI24-12574",
         date: "2024-04-03",
         components: {
           "Metano (C₁)": 97.821,
           "Etano (C₂)": 0.094,
           "Propano (C₃)": 0.638,
           "i-Butano (iC₄)": 0.009,
           "n-Butano (nC₄)": 0.015,
           "Isopentano": 0.007,
           "N-Pentano": 0.011,
           "Hexano": 0.045,
           "Heptano": 0.052,
           "Octano": 0.018,
           "Nonano": 0.002,
           "Decano": 0.000,
           "Oxigênio": 0.041,
           "Nitrogênio (N₂)": 0.413,
           "Dióxido de Carbono (CO₂)": 0.814
         },
         properties: {
           compressibilityFactor: 0.9980,
           specificMass: 0.693,
           molarMass: 16.6309
         }
       },
       {
         boletimNumber: "PTI24-13046",
         date: "2024-05-06",
         components: {
           "Metano (C₁)": 98.398,
           "Etano (C₂)": 0.089,
           "Propano (C₃)": 0.129,
           "i-Butano (iC₄)": 0.003,
           "n-Butano (nC₄)": 0.012,
           "Isopentano": 0.005,
           "N-Pentano": 0.009,
           "Hexano": 0.037,
           "Heptano": 0.080,
           "Octano": 0.042,
           "Nonano": 0.005,
           "Decano": 0.000,
           "Oxigênio": 0.012,
           "Nitrogênio (N₂)": 0.345,
           "Dióxido de Carbono (CO₂)": 0.834
         },
         properties: {
           compressibilityFactor: 0.9980,
           specificMass: 0.688,
           molarMass: 16.5224
         }
       },
       {
         boletimNumber: "PTI24-13669",
         date: "2024-06-18",
         components: {
           "Metano (C₁)": 98.076,
           "Etano (C₂)": 0.087,
           "Propano (C₃)": 0.338,
           "i-Butano (iC₄)": 0.004,
           "n-Butano (nC₄)": 0.014,
           "Isopentano": 0.010,
           "N-Pentano": 0.019,
           "Hexano": 0.077,
           "Heptano": 0.083,
           "Octano": 0.033,
           "Nonano": 0.003,
           "Decano": 0.000,
           "Oxigênio": 0.013,
           "Nitrogênio (N₂)": 0.520,
           "Dióxido de Carbono (CO₂)": 0.875
         },
         properties: {
           compressibilityFactor: 0.9979,
           specificMass: 0.693,
           molarMass: 16.6279
         }
       },
       {
         boletimNumber: "PTI24-14803",
         date: "2024-08-19",
         components: {
           "Metano (C₁)": 97.550,
           "Etano (C₂)": 0.097,
           "Propano (C₃)": 0.636,
           "i-Butano (iC₄)": 0.014,
           "n-Butano (nC₄)": 0.033,
           "Isopentano": 0.026,
           "N-Pentano": 0.051,
           "Hexano": 0.176,
           "Heptano": 0.147,
           "Octano": 0.032,
           "Nonano": 0.001,
           "Decano": 0.000,
           "Oxigênio": 0.017,
           "Nitrogênio (N₂)": 0.424,
           "Dióxido de Carbono (CO₂)": 0.795
         },
         properties: {
           compressibilityFactor: 0.9979,
           specificMass: 0.702,
           molarMass: 16.8535
         }
       }
    ];

    try {
      // Carregar dados existentes
      const existingData = localStorage.getItem('cep_historical_samples');
      const existing = existingData ? JSON.parse(existingData) : [];
      
      // Filtrar amostras que já existem (por boletimNumber)
      const existingNumbers = existing.map((s: any) => s.boletimNumber);
      const newSamples = historicalSamples.filter(sample => 
        !existingNumbers.includes(sample.boletimNumber)
      );
      
      if (newSamples.length === 0) {
        addNotification('info', 'Dados Históricos', 'Todas as amostras da tabela já estão no histórico CEP.');
        return;
      }
      
      // Adicionar as novas amostras
      const updatedData = [...newSamples, ...existing];
      localStorage.setItem('cep_historical_samples', JSON.stringify(updatedData));
      
      addNotification('success', 'Dados Históricos Importados', 
        `${newSamples.length} amostras da tabela foram adicionadas ao histórico CEP (39 amostras completas: 2019-2024).`);
      
      // Forçar revalidação CEP com novos dados
      setTimeout(() => {
        runCEPValidation();
      }, 500);
      
    } catch (error) {
      console.error('Erro ao importar dados históricos:', error);
      addNotification('error', 'Erro na Importação', 'Erro ao importar dados históricos da tabela.');
    }
  }, [addNotification, runCEPValidation]);

  // Função para carregar dados de exemplo da tabela histórica
  const loadSampleDataFromTable = useCallback(() => {
    // Usar dados da última amostra da tabela completa (PTI24-14803)
    const sampleData = {
      numeroBoletim: "PTI24-14803",
      dataRealizacaoAnaliseCritica: "2024-08-19",
      
      solicitantInfo: {
        nomeClienteSolicitante: "Exemplo - Cliente da Tabela Histórica",
        enderecoLocalizacaoClienteSolicitante: "",
        contatoResponsavelSolicitacao: "",
      },
      
      sampleInfo: {
        numeroAmostra: "PTI24-14803-SAMPLE",
        dataHoraColeta: "2024-08-19T10:00",
        localColeta: "Ponto de Medição - Exemplo",
        pontoColetaTAG: "TAG-PTI24-14803",
        pocoApropriacao: "",
        numeroCilindroAmostra: "",
        responsavelAmostragem: "",
        pressaoAmostraAbsolutaKpaA: "2500",
        pressaoAmostraManometricaKpa: "2399",
        temperaturaAmostraK: "293.15",
        temperaturaAmostraC: "20.00",
      },
      
      bulletinInfo: {
        dataRecebimentoAmostra: "2024-08-20",
        dataAnaliseLaboratorial: "2024-08-21", 
        dataEmissaoBoletim: "2024-08-22",
        dataRecebimentoBoletimSolicitante: "2024-08-23",
        laboratorioEmissor: "Laboratório Exemplo - Análise Cromatográfica",
        equipamentoCromatografoUtilizado: "CG-MS Modelo ABC",
        metodoNormativo: "ASTM D1945",
        tipoProcesso: ProcessType.ProcessoNormal,
      },
      
      // Componentes da última amostra da tabela completa (PTI24-14803)
      components: reportData.components.map(comp => {
        const sampleValues: Record<string, string> = {
          "Metano (C₁)": "97.550",
          "Etano (C₂)": "0.097", 
          "Propano (C₃)": "0.636",
          "i-Butano (iC₄)": "0.014",
          "n-Butano (nC₄)": "0.033",
          "Isopentano": "0.026",
          "N-Pentano": "0.051",
          "Hexano": "0.176",
          "Heptano": "0.147",
          "Octano": "0.032",
          "Nonano": "0.001",
          "Decano": "0.000",
          "Oxigênio": "0.017",
          "Nitrogênio (N₂)": "0.424",
          "Dióxido de Carbono (CO₂)": "0.795"
        };
        
        return {
          ...comp,
          molarPercent: sampleValues[comp.name] || "0.000",
          incertezaAssociadaPercent: "0.01" // 1% de incerteza padrão
        };
      }),
      
      // Propriedades calculadas da amostra (PTI24-14803)
      standardProperties: reportData.standardProperties.map(prop => {
        const sampleValues: Record<string, string> = {
          "compressibilityFactor": "0.9979",
          "specificMass": "0.702", 
          "molarMass": "16.8535",
          "pcs": "39500", // Estimado
          "pci": "35550", // Estimado (90% do PCS)
          "relativeDensity": "0.582", // Calculado
          "realDensity": "0.726" // Calculado
        };
        
        return {
          ...prop,
          value: sampleValues[prop.id] || "",
          incertezaExpandida: "0.5" // 0.5% de incerteza expandida padrão
        };
      })
    };
    
    setReportData(prev => ({
      ...prev,
      ...sampleData
    }));
    
    addNotification('success', 'Dados Carregados', 
      'Dados da amostra PTI24-14803 carregados da tabela histórica completa (última amostra de 2024).');
      
  }, [reportData.components, reportData.standardProperties, addNotification]);

  // Função para debug dos cálculos CEP - comparar com dados da imagem
  const debugCEPCalculations = useCallback(() => {
    const historicalData = localStorage.getItem('cep_historical_samples');
    const samples = historicalData ? JSON.parse(historicalData) : [];
    
    console.log('=== DEBUG CEP CALCULATIONS ===');
    console.log('Histórico atual:', samples.length, 'amostras');
    
    if (samples.length === 0) {
      addNotification('warning', 'Debug CEP', 'Nenhum histórico disponível. Use "Importar Histórico" primeiro.');
      return;
    }
    
    // Analisar Metano (C₁) como exemplo
    const metanoValues = samples
      .map((s: any) => s.components["Metano (C₁)"])
      .filter((v: any) => v !== undefined && v > 0)
      .slice(0, 8); // Últimas 8
    
    console.log('Valores Metano (C₁):', metanoValues);
    
    if (metanoValues.length >= 2) {
      const mean = metanoValues.reduce((sum: number, val: number) => sum + val, 0) / metanoValues.length;
      
      // Calcular amplitudes móveis
      const mobileRanges = [];
      for (let i = 1; i < metanoValues.length; i++) {
        mobileRanges.push(Math.abs(metanoValues[i] - metanoValues[i - 1]));
      }
      
      const mobileRangeMean = mobileRanges.reduce((sum, range) => sum + range, 0) / mobileRanges.length;
      
      // Fator de controle com D2 = 1.128
      const controlFactor = 3 * (mobileRangeMean / 1.128);
      const upperLimit = mean + controlFactor;
      const lowerLimit = Math.max(0, mean - controlFactor);
      
      console.log('=== CÁLCULOS METANO (C₁) ===');
      console.log('Média (x̄):', mean.toFixed(6));
      console.log('Amplitudes móveis:', mobileRanges.map(r => r.toFixed(6)));
      console.log('Média das amplitudes (MR̄):', mobileRangeMean.toFixed(6));
      console.log('Fator de controle (3×MR̄/D2):', controlFactor.toFixed(6));
      console.log('Limite Superior (LCS):', upperLimit.toFixed(6));
      console.log('Limite Inferior (LCI):', lowerLimit.toFixed(6));
      
      addNotification('success', 'Debug CEP Completo', 
        `Cálculos detalhados no console. Média Metano: ${mean.toFixed(4)}%, LCI: ${lowerLimit.toFixed(4)}%, LCS: ${upperLimit.toFixed(4)}%`);
    }
     }, [addNotification]);

  // ============================================================================
  // TEMPLATE EXCEL PARA IMPORTAÇÃO DE DADOS HISTÓRICOS
  // ============================================================================
  
  const generateExcelTemplate = useCallback(async () => {
    try {
      // Importar biblioteca Excel dinamicamente
      const ExcelJS = await import('exceljs');
      
      // Criar workbook e worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Dados Históricos CEP');
      
      // Cabeçalhos do template
      const headers = [
        'DATA_COLETA', 'DATA_EMISSAO_RELATORIO', 'DATA_VALIDACAO', 'BOLETIM',
        'Metano (%)', 'Etano (%)', 'Propano (%)', 'Isobutano (%)', 'n-butano (%)', 'Isopentano (%)', 
        'N-Pentano (%)', 'Hexano (%)', 'Heptano (%)', 'Octano (%)', 'Nonano (%)', 'Decano (%)',
        'Oxigenio (%)', 'Nitrogenio (%)', 'Dioxido_Carbono (%)', 'TOTAL (%)',
        'Fator_Compressibilidade', 'Massa_Especifica (kg/m³)', 'Massa_Molecular (g/mol)'
      ];
      
      // Adicionar cabeçalhos
      worksheet.addRow(headers);
      
      // Dados de exemplo
      const exampleRows = [
        ['20/03/2019', '27/03/2019', '27/03/2019', '328.19REV.00',
         99.063, 0.098, 0.006, 0.003, 0.003, 0.000,
         0.001, 0.001, 0.000, 0.000, 0.000, 0.000,
         0.000, 0.230, 0.594, 100,
         0.9981, 0.677, 16.3000],
        ['13/04/2019', '17/04/2019', '17/04/2019', '414.19REV.00',
         99.046, 0.086, 0.009, 0.002, 0.003, 0.000,
         0.001, 0.001, 0.000, 0.000, 0.000, 0.000,
         0.000, 0.241, 0.611, 100,
         0.9981, 0.677, 16.3000]
      ];
      
      // Adicionar exemplos
      exampleRows.forEach(row => worksheet.addRow(row));
      
      // Estilizar cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      
      // Ajustar larguras das colunas
      headers.forEach((_, index) => {
        const width = index < 4 ? 15 : index < 19 ? 12 : 18;
        worksheet.getColumn(index + 1).width = width;
      });
      
      // Criar aba de instruções
      const instructionsWs = workbook.addWorksheet('Instruções');
      instructionsWs.addRow(['INSTRUÇÕES PARA PREENCHIMENTO DO TEMPLATE']);
      instructionsWs.addRow(['']);
      instructionsWs.addRow(['1. FORMATO DAS DATAS:', 'Use formato DD/MM/AAAA']);
      instructionsWs.addRow(['2. BOLETIM:', 'Número único do boletim']);
      instructionsWs.addRow(['3. COMPONENTES:', 'Valores em percentual molar']);
      instructionsWs.addRow(['4. Use ponto (.) como separador decimal']);
      
      // Gerar arquivo
      const fileName = `template_historico_cep_${new Date().toISOString().split('T')[0]}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      
      addNotification('success', 'Template Excel Gerado', 
        'Template Excel baixado com instruções completas. Preencha com seus dados históricos.');
        
    } catch (error) {
      console.error('Erro ao gerar template Excel:', error);
      
      // Fallback para CSV caso a biblioteca não funcione
      const headers = [
        'DATA_COLETA', 'DATA_EMISSAO_RELATORIO', 'DATA_VALIDACAO', 'BOLETIM',
        'Metano', 'Etano', 'Propano', 'Isobutano', 'n-butano', 'Isopentano', 
        'N-Pentano', 'Hexano', 'Heptano', 'Octano', 'Nonano', 'Decano',
        'Oxigenio', 'Nitrogenio', 'Dioxido_Carbono', 'TOTAL',
        'Fator_Compressibilidade', 'Massa_Especifica', 'Massa_Molecular'
      ];
      
      const exampleRows = [
        '20/03/2019,27/03/2019,27/03/2019,328.19REV.00,99.063,0.098,0.006,0.003,0.003,0.000,0.001,0.001,0.000,0.000,0.000,0.000,0.000,0.230,0.594,100,0.9981,0.677,16.3000',
        '13/04/2019,17/04/2019,17/04/2019,414.19REV.00,99.046,0.086,0.009,0.002,0.003,0.000,0.001,0.001,0.000,0.000,0.000,0.000,0.000,0.241,0.611,100,0.9981,0.677,16.3000',
        ',,,,,,,,,,,,,,,,,,,,,,'
      ];
      
      const csvContent = [headers.join(','), ...exampleRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `template_historico_cep_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification('success', 'Template CSV Gerado', 
        'Template CSV baixado. Use Excel para abrir e preencher os dados.');
    }
  }, [addNotification]);

  // Função para processar arquivo importado (CSV ou Excel)
  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Processar arquivo Excel
        const ExcelJS = await import('exceljs');
        const reader = new FileReader();
        
                 return new Promise<void>((resolve, reject) => {
           reader.onload = async (e) => {
             try {
               const buffer = e.target?.result as ArrayBuffer;
               const workbook = new ExcelJS.Workbook();
               await workbook.xlsx.load(buffer);
               const worksheet = workbook.getWorksheet(1);
               const jsonData: any[][] = [];
               
               worksheet?.eachRow((row) => {
                 jsonData.push(row.values as any[]);
               });
               
               processImportedData(jsonData);
               resolve();
             } catch (error) {
               reject(error);
             }
           };
           reader.readAsArrayBuffer(file);
         });
      } else {
        // Processar arquivo CSV
        const reader = new FileReader();
        return new Promise<void>((resolve, reject) => {
          reader.onload = (e) => {
            try {
              const text = e.target?.result as string;
              const lines = text.split('\n');
              const csvData = lines.map(line => line.split(',').map(cell => cell.trim()));
              
              processImportedData(csvData);
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.readAsText(file);
        });
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      addNotification('error', 'Erro na Importação', 
        'Erro ao processar o arquivo. Verifique se é um arquivo Excel (.xlsx) ou CSV válido.');
    } finally {
      // Limpar input
      event.target.value = '';
    }
    
    // Função interna para processar dados
    function processImportedData(csvData: any[][]) {
      const importedSamples = [];
      
      for (let i = 1; i < csvData.length; i++) {
        const values = csvData[i].map((v: any) => String(v || '').trim());
        
        if (values.length < 4 || !values[3]) continue; // Pular linhas vazias ou sem boletim
        
        const sample = {
          id: `${values[3]}_${Date.now()}_${i}`,
          boletimNumber: values[3],
          date: parseImportDate(values[0]) || new Date().toISOString(),
          components: {
            "Metano (C₁)": parseFloat(values[4]) || 0,
            "Etano (C₂)": parseFloat(values[5]) || 0,
            "Propano (C₃)": parseFloat(values[6]) || 0,
            "i-Butano (iC₄)": parseFloat(values[7]) || 0,
            "n-Butano (nC₄)": parseFloat(values[8]) || 0,
            "Isopentano": parseFloat(values[9]) || 0,
            "N-Pentano": parseFloat(values[10]) || 0,
            "Hexano": parseFloat(values[11]) || 0,
            "Heptano": parseFloat(values[12]) || 0,
            "Octano": parseFloat(values[13]) || 0,
            "Nonano": parseFloat(values[14]) || 0,
            "Decano": parseFloat(values[15]) || 0,
            "Oxigênio": parseFloat(values[16]) || 0,
            "Nitrogênio (N₂)": parseFloat(values[17]) || 0,
            "Dióxido de Carbono (CO₂)": parseFloat(values[18]) || 0
          },
          properties: {
            compressibilityFactor: parseFloat(values[20]) || 0,
            specificMass: parseFloat(values[21]) || 0,
            molarMass: parseFloat(values[22]) || 0
          }
        };
        
        // Validar dados mínimos
        const totalComponents = Object.values(sample.components).reduce((sum, val) => sum + val, 0);
        if (totalComponents > 0 && sample.properties.compressibilityFactor > 0) {
          importedSamples.push(sample);
        }
      }
      
      if (importedSamples.length > 0) {
        // Carregar dados existentes
        const existingData = localStorage.getItem('cep_historical_samples');
        const existing = existingData ? JSON.parse(existingData) : [];
        
        // Filtrar duplicatas por boletimNumber
        const existingNumbers = existing.map((s: any) => s.boletimNumber);
        const newSamples = importedSamples.filter(sample => 
          !existingNumbers.includes(sample.boletimNumber)
        );
        
        // Adicionar as novas amostras
        const updatedData = [...newSamples, ...existing];
        localStorage.setItem('cep_historical_samples', JSON.stringify(updatedData));
        
        addNotification('success', 'Importação Concluída', 
          `${newSamples.length} amostras importadas com sucesso. Total no histórico: ${updatedData.length}`);
        
        // Forçar revalidação CEP
        setTimeout(() => {
          runCEPValidation();
        }, 500);
        
      } else {
        addNotification('warning', 'Nenhum Dado Válido', 
          'Não foram encontrados dados válidos no arquivo. Verifique o formato e se as colunas estão preenchidas.');
      }
    }
  }, [addNotification, runCEPValidation]);

  // Função auxiliar para converter data
  const parseImportDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    
    try {
      // Tentar formatos dd/mm/yyyy, yyyy-mm-dd, etc.
      const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/mm/yyyy
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-mm-dd
      ];
      
      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          if (format === formats[0]) {
            // dd/mm/yyyy
            const [, day, month, year] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
          } else {
            // yyyy-mm-dd
            const [, year, month, day] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
          }
        }
      }
      
      // Fallback: tentar parsing direto
      return new Date(dateStr).toISOString();
    } catch {
      return null;
    }
  };

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
        
        <div className="mb-6 bg-white rounded-lg border border-gray-300 shadow-lg shadow-gray-200/50">
          <div className="p-6 bg-blue-900 rounded-t-lg border-b border-gray-200">
            <h2 className="text-xl font-bold text-center text-white">
              PARTE 1 - VERIFICAÇÃO DOCUMENTAL DO BOLETIM (ISO/IEC 17025)
            </h2>
          </div>
          
          {/* 1. Lista de Verificação NBR ISO/IEC 17025 */}
          <div className="mb-4 border border-gray-300 rounded-lg shadow-md shadow-gray-200/30">
            <div className="p-4 bg-blue-600 rounded-t-lg border-b border-gray-200">
              <h3 className="text-lg font-bold text-white">1. LISTA DE VERIFICAÇÃO NBR ISO/IEC 17025</h3>
            </div>
            
            {expandedSections.parte1.item1 && (
              <div className="p-6 pt-4">
                <div className="overflow-x-auto">
                  <table className="overflow-hidden min-w-full rounded-lg border border-gray-300 divide-y divide-gray-300 shadow-sm bg-white">
                    <thead className="bg-blue-600">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">
                          ITEM
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">
                          DESCRIÇÃO
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">
                          SIM
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">
                          NÃO
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">
                          NÃO APLICÁVEL
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase">
                          OBSERVAÇÃO
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                      {checklistItems.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/30 hover:bg-gray-100/50'}>
                          <td className="px-4 py-3 text-sm font-medium text-center text-gray-900 border-r border-gray-300/70">
                            {item.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300/70">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-center border-r border-gray-300/70">
                            <input
                              type="radio"
                              name={`checklist-${item.id}`}
                              checked={item.status === 'SIM'}
                              onChange={() => handleChecklistChange(item.id, 'status', 'SIM')}
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center border-r border-gray-300/70">
                            <input
                              type="radio"
                              name={`checklist-${item.id}`}
                              checked={item.status === 'NÃO'}
                              onChange={() => handleChecklistChange(item.id, 'status', 'NÃO')}
                              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center border-r border-gray-300/70">
                            <input
                              type="radio"
                              name={`checklist-${item.id}`}
                              checked={item.status === 'NÃO APLICÁVEL'}
                              onChange={() => handleChecklistChange(item.id, 'status', 'NÃO APLICÁVEL')}
                              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 focus:ring-gray-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.observation}
                              onChange={(e) => handleChecklistChange(item.id, 'observation', e.target.value)}
                              className="p-1 w-full text-sm rounded border border-gray-300/70 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 focus:bg-white"
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
          <div className="mb-4 border border-gray-300 rounded-lg shadow-md shadow-gray-200/30">
            <div className="p-4 bg-blue-600 rounded-t-lg border-b border-gray-200">
              <h3 className="text-lg font-bold text-white">2. INFORMAÇÕES DO SOLICITANTE</h3>
            </div>
            
            {expandedSections.parte1.item2 && (
              <div className="p-6 pt-4">
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
          <div className="mb-4 border border-gray-300 rounded-lg shadow-md shadow-gray-200/30">
            <div className="p-4 bg-blue-600 rounded-t-lg border-b border-gray-200">
              <h3 className="text-lg font-bold text-white">3. INFORMAÇÕES DA AMOSTRA</h3>
            </div>
            
            {expandedSections.parte1.item3 && (
              <div className="p-6 pt-4">
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
          <div className="mb-4 border-b border-gray-200">
            <div className="p-4 bg-blue-600 rounded-t-lg">
              <h3 className="text-lg font-bold text-white">4. DADOS DO BOLETIM</h3>
        </div>

            {expandedSections.parte1.item4 && (
              <div className="p-6 pt-0">
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
            )}
          </div>

          {/* 5. Composição Molar e Incertezas */}
          <div className="mb-4 border-b border-gray-200">
            <div className="p-4 bg-blue-600 rounded-t-lg">
              <h3 className="text-lg font-bold text-white">5. COMPOSIÇÃO MOLAR E INCERTEZAS</h3>
            </div>
            
            {expandedSections.parte1.item5 && (
              <div className="p-6 pt-0">
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
                <div className={`mt-4 p-3 rounded-lg ${molarValidation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-sm font-medium ${molarValidation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                    Total: {molarValidation.total.toFixed(4)}% mol - {molarValidation.message}
              </p>
            </div>
          </div>
            )}
        </div>

          {/* 6. Propriedades do Gás - Condições Padrão */}
          <div className="mb-4 border border-gray-300 rounded-lg shadow-md shadow-gray-200/30">
            <div className="p-4 bg-blue-600 rounded-t-lg border-b border-gray-200">
              <h3 className="text-lg font-bold text-white">6. PROPRIEDADES DO GÁS - CONDIÇÕES PADRÃO</h3>
            </div>
            
            {expandedSections.parte1.item6 && (
              <div className="p-6 pt-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-lg shadow-sm bg-white divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-r border-gray-300/50">Propriedade</th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-r border-gray-300/50">Valor</th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-r border-gray-300/50">Incerteza Expandida</th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status CEP</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                      {reportData.standardProperties.map((property, index) => (
                        <tr key={property.id} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/30 hover:bg-gray-100/50'}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-300/70">
                            {property.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300/70">
                            <input
                              type="number"
                              step="0.0001"
                              value={property.value}
                              onChange={(e) => handleStandardPropertyChange(property.id, 'value', e.target.value)}
                              className="p-1 w-full text-sm rounded border border-gray-300/70 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 focus:bg-white"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300/70">
                            <input
                              type="number"
                              step="0.0001"
                              value={property.incertezaExpandida}
                              onChange={(e) => handleStandardPropertyChange(property.id, 'incertezaExpandida', e.target.value)}
                              className="p-1 w-full text-sm rounded border border-gray-300/70 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 focus:bg-white"
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
            )}
          </div>
        </div>

        {/* ====================================================================== */}
        {/* OBSERVAÇÕES */}
        {/* ====================================================================== */}
        
        <div className="mt-8 mb-6 bg-white rounded-lg border border-gray-300 shadow-lg shadow-gray-200/50">
          <div className="p-4 bg-gray-600 rounded-t-lg border-b border-gray-200">
            <h3 className="text-lg font-bold text-white">OBSERVAÇÕES</h3>
          </div>
          
          <div className="p-6">
            <textarea
              value={reportData.observacoesBoletim}
              onChange={(e) => handleInputChange('observacoesBoletim', e.target.value)}
              rows={4}
              className="p-3 w-full rounded-md border border-gray-300/70 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 focus:bg-white shadow-inner"
              placeholder="Inserir observações feitas no boletim..."
            />
          </div>
        </div>

        {/* ====================================================================== */}
        {/* PARTE 2 - VALIDAÇÃO TÉCNICA E METROLÓGICA */}
        {/* ====================================================================== */}
        
        <div className="mt-8 mb-6 bg-white rounded-lg border border-gray-300 shadow-lg shadow-gray-200/50">
          <div className="p-6 bg-blue-900 rounded-t-lg border-b border-gray-200">
            <h2 className="text-xl font-bold text-center text-white">
              PARTE 2 - VALIDAÇÃO TÉCNICA E METROLÓGICA DOS RESULTADOS
            </h2>
          </div>
          
          {/* 5. Resultados da Validação - Componentes */}
          <div className="mb-4 border border-gray-300 rounded-lg shadow-md shadow-gray-200/30">
            <div className="p-4 bg-blue-600 rounded-t-lg border-b border-gray-200">
                             <h3 className="text-lg font-bold text-white">6. RESULTADOS DA VALIDAÇÃO - COMPONENTES</h3>
            </div>
            
            {expandedSections.parte2.item5 && (
              <div className="p-6 pt-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-lg shadow-sm bg-white divide-y divide-gray-300">
                    <thead className="bg-blue-900">
                      <tr>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">Item</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">Componente</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">% Molar</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">Status AGA8</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">Status CEP</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border-r border-gray-400/50" colSpan={2}>AGA8</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700" colSpan={2}>CEP</th>
                      </tr>
                      <tr>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border-r border-gray-400/50"></th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border-r border-gray-400/50"></th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border-r border-gray-400/50"></th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border-r border-gray-400/50"></th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border-r border-gray-400/50"></th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border-r border-gray-400/50">Limite Inferior</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border-r border-gray-400/50">Limite Superior</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700 border-r border-gray-400/50">Limite Inferior</th>
                        <th className="px-3 py-2 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700">Limite Superior</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                      {reportData.components.map((component, index) => {
                        const molarValue = parseFloat(component.molarPercent) || 0;
                        const isValidated = component.molarPercent && molarValue > 0;
                        const cepResult = cepComponentResults.find(r => r.componentName === component.name);
                        
                        return (
                          <tr key={component.id} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/30 hover:bg-gray-100/50'}>
                            <td className="px-3 py-2 text-sm font-medium text-center text-gray-900 border-r border-gray-300/70">
                              {component.id}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-300/70">
                              {component.name}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-900 border-r border-gray-300/70">
                              {isValidated ? `${molarValue.toFixed(3)}%` : '---'}
                            </td>
                            <td className="px-3 py-2 text-sm text-center border-r border-gray-300/70">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                component.aga8Status === ValidationStatus.OK ? 'bg-green-100 text-green-800' :
                                component.aga8Status === ValidationStatus.ForaDaFaixa ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isValidated ? (component.aga8Status === ValidationStatus.OK ? 'VALIDADO' : 
                                                component.aga8Status === ValidationStatus.ForaDaFaixa ? 'INVÁLIDO' : 'PENDENTE') : '***'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-sm text-center border-r border-gray-300/70">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                component.cepStatus === ValidationStatus.OK ? 'bg-green-100 text-green-800' :
                                component.cepStatus === ValidationStatus.ForaDaFaixa ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isValidated ? (component.cepStatus === ValidationStatus.OK ? 'VALIDADO' : 
                                               component.cepStatus === ValidationStatus.ForaDaFaixa ? 'INVÁLIDO' : 'PENDENTE') : '***'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-900 border-r border-gray-300/70">
                              {isValidated ? `${component.aga8Min}%` : '0%'}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-900 border-r border-gray-300/70">
                              {isValidated ? `${component.aga8Max}%` : '100%'}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-900 border-r border-gray-300/70">
                              {cepResult?.statistics.lowerControlLimit ? cepResult.statistics.lowerControlLimit.toFixed(3) + '%' : '***'}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-900">
                              {cepResult?.statistics.upperControlLimit ? cepResult.statistics.upperControlLimit.toFixed(3) + '%' : '***'}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Linha de Total */}
                      <tr className="font-semibold bg-yellow-200/80 hover:bg-yellow-200">
                        <td className="px-3 py-2 text-sm text-center text-gray-900 border-r border-gray-300/70"></td>
                        <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-300/70">TOTAL</td>
                        <td className="px-3 py-2 text-sm text-center text-gray-900 border-r border-gray-300/70">
                          {molarValidation.total.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-sm text-center" colSpan={6}>
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

          {/* 6. Resultados da Validação - Propriedades */}
          <div className="mb-4 border border-gray-300 rounded-lg shadow-md shadow-gray-200/30">
            <div className="p-4 bg-blue-600 rounded-t-lg border-b border-gray-200">
                             <h3 className="text-lg font-bold text-white">7. RESULTADOS DA VALIDAÇÃO - PROPRIEDADES</h3>
            </div>
            
            {expandedSections.parte2.item6 && (
              <div className="p-6 pt-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-lg shadow-sm bg-white divide-y divide-gray-300">
                    <thead className="bg-blue-900">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">Propriedade</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">Valor</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">Status AGA8</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase border-r border-gray-400/50">Status CEP</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border-r border-gray-400/50" colSpan={2}>AGA8</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700" colSpan={2}>CEP</th>
                      </tr>
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border-r border-gray-400/50"></th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border-r border-gray-400/50"></th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border-r border-gray-400/50"></th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-900 border-r border-gray-400/50"></th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border-r border-gray-400/50">Limite Inferior</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-800 border-r border-gray-400/50">Limite Superior</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700 border-r border-gray-400/50">Limite Inferior</th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-white uppercase bg-blue-700">Limite Superior</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                      {reportData.standardProperties.map((property, index) => {
                        const propertyValue = parseFloat(property.value) || 0;
                        const isValidated = property.value && propertyValue > 0;
                        const cepResult = cepPropertyResults.find(r => r.componentName === property.name);
                        
                        return (
                          <tr key={property.id} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/30 hover:bg-gray-100/50'}>
                            <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300/70">
                              {property.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300/70">
                              {isValidated ? propertyValue.toFixed(4) : '***'}
                            </td>
                            <td className="px-4 py-3 text-sm text-center border-r border-gray-300/70">
                              <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded">
                                ***
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center border-r border-gray-300/70">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                property.cepStatus === ValidationStatus.OK ? 'bg-green-100 text-green-800' :
                                property.cepStatus === ValidationStatus.ForaDaFaixa ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isValidated ? (property.cepStatus === ValidationStatus.OK ? 'VALIDADO' : 'PENDENTE') : '***'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300/70">***</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300/70">***</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300/70">
                              {cepResult?.statistics.lowerControlLimit ? cepResult.statistics.lowerControlLimit.toFixed(4) : '***'}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900">
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
         {/* PARTE 3 - AÇÕES E FERRAMENTAS */}
         {/* ====================================================================== */}
         
         <div className="mb-6 bg-white rounded-lg border border-gray-300 shadow-lg shadow-gray-200/50">
           <div className="p-6 bg-blue-900 rounded-t-lg border-b border-gray-200">
             <h2 className="text-xl font-bold text-center text-white">
               PARTE 3 - AÇÕES E FERRAMENTAS
             </h2>
           </div>
          
          {/* Status de Campos Obrigatórios */}
          {!requiredFieldsValidation.isValid && (
            <div className="p-4 m-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800">Campos Obrigatórios Pendentes</h4>
              <p className="text-sm text-yellow-700">
                {requiredFieldsValidation.missingFields.slice(0, 3).join(', ')}
                {requiredFieldsValidation.missingFields.length > 3 ? '...' : ''}
              </p>
            </div>
          )}
          
                     <div className="p-6">
             <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-8">
            <button 
                 onClick={() => setShowManualEntryModal(true)}
                 className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
            >
                 ✏️ Entrada Manual
            </button>
            
               <button
                 onClick={importHistoricalData}
                 className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-orange-600 rounded-lg transition-colors hover:bg-orange-700"
               >
                 📊 Importar Histórico
               </button>
            
            <button 
                 onClick={() => loadSampleDataFromTable()}
                 className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-teal-600 rounded-lg transition-colors hover:bg-teal-700"
            >
                 🧪 Carregar Amostra
            </button>
            
            <button 
                 onClick={debugCEPCalculations}
                 className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-purple-600 rounded-lg transition-colors hover:bg-purple-700"
               >
                 🔍 Debug CEP
               </button>
               
               <button
                 onClick={generateExcelTemplate}
                 className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
               >
                 📊 Gerar Template
            </button>
          
               <div className="relative">
            <input
              type="file"
                   accept=".csv,.xlsx,.xls"
                   onChange={handleFileImport}
                   className="absolute inset-0 opacity-0 cursor-pointer"
                   id="file-import"
            />
            <label
                   htmlFor="file-import"
                   className="flex gap-2 justify-center items-center px-4 py-3 text-white bg-indigo-600 rounded-lg transition-colors cursor-pointer hover:bg-indigo-700"
            >
                   📁 Importar CSV
            </label>
               </div>
            
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
        
        {/* Modal de Histórico CEP */}
        {showCEPHistoryModal && (
          <CEPHistoryViewer
            isOpen={showCEPHistoryModal}
            onClose={() => setShowCEPHistoryModal(false)}
          />
        )}
        
                 {/* Sistema de Notificações */}
         <NotificationSystem 
           notifications={notifications} 
           onRemove={removeNotification}
      />
    </div>
    </ErrorBoundary>
  );
};

export default App;
