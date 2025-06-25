// cSpell:ignore Solicitante
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { captureError, addBreadcrumb } from './src/config/sentry';
import { atualizarValidacaoAGA8Automatica, escolherCriterioAGA8 } from './aga8-criteria-validator';
import { getComponentMolarMass } from './aga8-parameters';
import { 
  ReportData, ComponentData, ChecklistItem, SampleProperty, ValidationStatus, ChecklistStatus, 
  StatisticalProcessControlData, 
  RecommendedActions, SamplingConditionProperty, 
  AirContaminationProperty, RegulatoryComplianceItem, DateValidationDetails, ProcessType, FinalDecisionStatus
} from './types';
import { 
  INITIAL_COMPONENTS, INITIAL_CHECKLIST_ITEMS, INITIAL_STANDARD_PROPERTIES, 
  INITIAL_SAMPLING_CONDITION_PROPERTIES, INITIAL_AIR_CONTAMINATION_PROPERTIES,
  INITIAL_REGULATORY_COMPLIANCE_ITEMS, PART_TITLE_CLASS,
  INITIAL_DATE_VALIDATION_DETAILS, ANP52_PRAZO_COLETA_EMISSAO_DIAS,
  ANP52_PRAZO_PROCESSO_NORMAL_DIAS, ANP52_PRAZO_PROCESSO_SEM_VALIDACAO_DIAS,
  ANP52_PRAZO_NOVA_AMOSTRAGEM_DIAS_UTEIS
} from './constants';
import ReportHeader from './components/ReportHeader';
import DocumentAndSampleInfoForm from './components/ReportInfoForm'; 
import ChecklistTable from './components/ChecklistTable';
import ComponentTable from './components/ComponentTable';
import StandardPropertiesTable from './components/PropertiesTable'; 
import SamplingConditionsPropertiesTable from './components/SamplingConditionsPropertiesTable';
import AirContaminationTable from './components/AirContaminationTable';
import ObservationsSection from './components/ObservationsSection';
import TechnicalValidationSectionWrapper from './components/TechnicalValidationSectionWrapper';
import FinalConclusionSection from './components/FinalConclusionSection';
import ApprovalSection from './components/ApprovalSection';
import ProgressBar from './components/ui/ProgressBar';
import NotificationSystem from './components/ui/NotificationSystem';
import ErrorBoundary from './components/ui/ErrorBoundary';
import TemplateSelector from './components/TemplateSelector';
import PDFGenerator from './components/PDFGenerator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ExcelTemplateManager from './components/ExcelTemplateManager';

// Notification system
interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

// Progress calculation
const calculateProgress = (reportData: ReportData): number => {
  try {
    let totalFields = 0;
    let filledFields = 0;

    // Basic info fields (weight: 10%)
    const basicFields = [
      reportData.numeroUnicoRastreabilidade,
      reportData.numeroBoletim,
      reportData.plataforma,
      reportData.solicitantInfo?.nomeClienteSolicitante,
      reportData.sampleInfo?.numeroAmostra,
      reportData.sampleInfo?.dataHoraColeta,
      reportData.bulletinInfo?.dataEmissaoBoletim
    ];
    totalFields += basicFields.length;
    filledFields += basicFields.filter(field => field && field.trim() !== '').length;

    // Components (weight: 30%)
    if (reportData.components && Array.isArray(reportData.components)) {
      const componentsWithData = reportData.components.filter(c => c.molarPercent && c.molarPercent.trim() !== '');
      totalFields += reportData.components.length;
      filledFields += componentsWithData.length;
    }

    // Properties (weight: 20%)
    if (reportData.standardProperties && Array.isArray(reportData.standardProperties)) {
      const propertiesWithData = reportData.standardProperties.filter(p => p.value && p.value.trim() !== '');
      totalFields += reportData.standardProperties.length;
      filledFields += propertiesWithData.length;
    }

    // Checklist (weight: 15%)
    if (reportData.checklistItems && Array.isArray(reportData.checklistItems)) {
      const checklistCompleted = reportData.checklistItems.filter(item => item.status !== null);
      totalFields += reportData.checklistItems.length;
      filledFields += checklistCompleted.length;
    }

    // Technical validation (weight: 15%)
    const technicalFields = [
      reportData.aga8ValidationData?.zCalculadoPorMetodo,
      reportData.aga8ValidationData?.consistenciaZCondPadraoZAmostragem,
      reportData.statisticalProcessControlData?.tendenciaHistoricaComposicao,
      reportData.statisticalProcessControlData?.resultadosDentroFaixaCartasControle
    ];
    totalFields += technicalFields.length;
    filledFields += technicalFields.filter(field => field && field.trim() !== '').length;

    // Final decision (weight: 10%)
    const finalFields = [
      reportData.decisaoFinal,
      reportData.justificativaTecnica,
      reportData.responsavelAnaliseNome,
      reportData.aprovacaoAnaliseNome
    ];
    totalFields += finalFields.length;
    filledFields += finalFields.filter(field => field && field.toString().trim() !== '').length;

    // Ensure we don't divide by zero
    if (totalFields === 0) return 0;
    
    const result = Math.round((filledFields / totalFields) * 100);
    
    // Ensure result is within valid range
    return Math.max(0, Math.min(100, result));
  } catch (error) {
    console.warn('Erro ao calcular progresso:', error);
    return 0;
  }
};

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
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [fontSizePercentage, setFontSizePercentage] = useState<number>(100);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [molarValidation, setMolarValidation] = useState({ isValid: true, total: 0, message: '' });
  
  // UI modals state
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [requiredFieldsValidation, setRequiredFieldsValidation] = useState({ isValid: true, missingFields: [] as string[] });

  // Control which validations should run based on field blur events
  const pendingValidationsRef = useRef<Set<string>>(new Set());
  const [validationTrigger, _setValidationTrigger] = useState<number>(0);

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

  const handleIncreaseFontSize = useCallback(() => {
    setFontSizePercentage(prev => Math.min(prev + 10, 150)); // Max 150%
  }, []);

  const handleDecreaseFontSize = useCallback(() => {
    setFontSizePercentage(prev => Math.max(prev - 10, 70)); // Min 70%
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

  // Template system functions
  const applyTemplate = useCallback((templateData: Partial<ReportData>) => {
    setReportData(prev => {
      const newData = { ...prev, ...templateData };
      return newData;
    });
    addNotification('success', 'Template Aplicado', 'Template aplicado com sucesso!');
  }, [addNotification]);

  // Enhanced notification function for compatibility
  const addSimpleNotification = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    addNotification(type, type.charAt(0).toUpperCase() + type.slice(1), message);
  }, [addNotification]);

    // Handle component field blur events - DESABILITADO
  const handleComponentBlur = useCallback((_id: number, _field: keyof ComponentData, _componentName: string) => {
    // NOTIFICAÇÕES DESABILITADAS - Função mantida para compatibilidade
    // As validações visuais continuam funcionando através dos status na tabela
  }, []);

  // useEffect separado para validações baseadas em onBlur - DESABILITADO
  useEffect(() => {
    // NOTIFICAÇÕES DE COMPONENTES DESABILITADAS A PEDIDO DO USUÁRIO
    // As validações continuam funcionando através dos status AGA-8 e CEP na tabela
    // mas não geram notificações automáticas
    
    // Limpar pendências para evitar acúmulo
    if (pendingValidationsRef.current.size > 0) {
      pendingValidationsRef.current.clear();
    }
  }, [validationTrigger]);

  // Data import function for Excel/CSV
  const handleDataImport = useCallback((importedData: Partial<ReportData>) => {
    console.log('📥 Importando dados do CSV...');
    console.log('🔍 DEBUG handleDataImport - Dados recebidos:', importedData);
    
    setReportData(prev => {
      console.log('🔍 DEBUG handleDataImport - Estado anterior:', {
        solicitantInfo: prev.solicitantInfo,
        sampleInfo: prev.sampleInfo,
        bulletinInfo: prev.bulletinInfo
      });
      
      const mergedData = {
        ...prev,
        ...importedData,
        // Fazer merge inteligente dos arrays
        components: importedData.components || prev.components,
        standardProperties: importedData.standardProperties || prev.standardProperties,
        samplingConditionsProperties: importedData.samplingConditionsProperties || prev.samplingConditionsProperties,
        airContaminationProperties: importedData.airContaminationProperties || prev.airContaminationProperties,
      };
      
      console.log('🔍 DEBUG handleDataImport - Dados após merge:', {
        solicitantInfo: mergedData.solicitantInfo,
        sampleInfo: mergedData.sampleInfo,
        bulletinInfo: mergedData.bulletinInfo
      });
      
      console.log('✅ Dados aplicados ao estado da aplicação');
      return mergedData;
    });
  }, []);


  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

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

  const handleSamplingPropertyChange = useCallback((id: string, field: keyof SamplingConditionProperty, value: string) => {
    setReportData(prev => ({
      ...prev,
      samplingConditionsProperties: prev.samplingConditionsProperties.map(prop =>
        prop.id === id ? { ...prop, [field]: value } : prop
      ),
    }));
  }, []);

  const handleAirContaminationPropertyChange = useCallback((id: string, field: keyof AirContaminationProperty, value: string) => {
    setReportData(prev => ({
      ...prev,
      airContaminationProperties: prev.airContaminationProperties.map(prop =>
        prop.id === id ? { ...prop, [field]: value } : prop
      ),
    }));
  }, []);


  const handleChecklistItemChange = useCallback((id: number, field: keyof ChecklistItem, value: any) => {
    setReportData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const handleAga8DataChange = useCallback((field: keyof ReportData['aga8ValidationData'], value: string) => {
    setReportData(prev => ({ ...prev, aga8ValidationData: { ...prev.aga8ValidationData, [field]: value }}));
  }, []);

  const handleRegulatoryItemChange = useCallback((id: string, field: keyof RegulatoryComplianceItem, value: string | ValidationStatus) => {
     setReportData(prev => ({
      ...prev,
      regulatoryComplianceItems: prev.regulatoryComplianceItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);
  
  const handleSqcDataChange = useCallback((field: keyof StatisticalProcessControlData, value: string) => {
    setReportData(prev => ({ ...prev, statisticalProcessControlData: { ...prev.statisticalProcessControlData, [field]: value }}));
  }, []);

  const handleDecisionChange = useCallback((field: keyof Pick<ReportData, 'decisaoFinal' | 'justificativaTecnica'>, value: any) => {
     setReportData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleActionChange = useCallback((field: keyof RecommendedActions, value: any) => {
    setReportData(prev => ({ ...prev, acoesRecomendadas: {...prev.acoesRecomendadas, [field]: value }}));
  }, []);
  
  const handleDateActionChange = useCallback((value: string) => {
     setReportData(prev => ({ ...prev, acoesRecomendadas: {...prev.acoesRecomendadas, dataImplementacaoComputadorVazao: value }}));
  }, []);

  const handleClearData = useCallback(() => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados do formulário? Esta ação não poderá ser desfeita.")) {
      setReportData(getInitialReportData());
      setLogoSrc(null);
      setFontSizePercentage(100);
      localStorage.removeItem('validador-cromatografia-autosave');
      localStorage.removeItem('validador-cromatografia-autosave-timestamp');
      addNotification('info', 'Formulário Limpo', 'Todos os dados foram removidos, incluindo os salvos automaticamente.');
      window.scrollTo(0, 0); // Scroll to top for better UX
    }
  }, [addNotification]);

  // Import JSON function
  const handleImportJSON = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Basic validation
        if (jsonData && typeof jsonData === 'object' && jsonData.numeroUnicoRastreabilidade !== undefined) {
          const migratedData = migrateDataToANP52(jsonData);
          setReportData(migratedData);
          addNotification('success', 'Dados Importados', `Arquivo "${file.name}" carregado com sucesso e migrado para ANP 52/2013.`);
        } else {
          addNotification('error', 'Erro na Importação', 'Arquivo JSON não possui o formato esperado.');
        }
      } catch (error) {
        addNotification('error', 'Erro na Importação', 'Arquivo JSON inválido ou corrompido.');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
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
    // const { atualizarValidacaoAGA8Automatica } = require('./aga8-criteria-validator');
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
      const newProgress = calculateProgress(reportData);
      setProgress(newProgress);

      const newMolarValidation = validateMolarComposition(reportData.components || []);
      setMolarValidation(newMolarValidation);

      const newRequiredFieldsValidation = validateRequiredFields(reportData);
      setRequiredFieldsValidation(newRequiredFieldsValidation);

      // Note: Removed automatic notifications - they will only appear when user clicks action buttons
    } catch (error) {
      console.error('Erro no useEffect de validação:', error);
      setProgress(0);
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

  // Function to validate and show notifications for molar composition (only called when needed)  
  const validateAndNotifyMolarComposition = useCallback(() => {
    const validation = validateMolarComposition(reportData.components || []);
    if (!validation.isValid && reportData.components && reportData.components.some(c => c.molarPercent && c.molarPercent.trim() !== '')) {
      addNotification('warning', 'Composição Molar', validation.message);
      return false;
    }
    return true;
  }, [reportData, addNotification]);

  // Automatic calculation functions
  const calculateMolarMass = useCallback((components: ComponentData[]): number => {
    // Import AGA-8 critical parameters for precise molar masses
            // const { getComponentMolarMass } = require('./aga8-parameters'); // já importado no topo

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
    // const { escolherCriterioAGA8 } = require('./aga8-criteria-validator'); // já importado no topo
    
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
    // const { escolherCriterioAGA8 } = require('./aga8-criteria-validator'); // já importado no topo
    
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
    // const { escolherCriterioAGA8 } = require('./aga8-criteria-validator'); // já importado no topo
    
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

  return (
    <ErrorBoundary>
      <div className="container p-4 mx-auto min-h-screen bg-gray-50">
      <ReportHeader
        numeroUnicoRastreabilidade={reportData.numeroUnicoRastreabilidade}
        onNumeroUnicoRastreabilidadeChange={(value) => handleInputChange('numeroUnicoRastreabilidade', value)}
        dataRealizacaoAnaliseCritica={reportData.dataRealizacaoAnaliseCritica}
        onDataRealizacaoAnaliseCriticaChange={(value) => handleInputChange('dataRealizacaoAnaliseCritica', value)}
        revisaoAnaliseCritica={reportData.revisaoAnaliseCritica}
        onRevisaoAnaliseCriticaChange={(value) => handleInputChange('revisaoAnaliseCritica', value)}
        logoSrc={logoSrc}
        onLogoUpload={handleLogoUpload}
        currentFontSizePercentage={fontSizePercentage}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
      />

      <h1 className={PART_TITLE_CLASS}>
        PARTE 1 - ANÁLISE DAS INFORMAÇÕES DO BOLETIM DE RESULTADO ANALÍTICO
      </h1>

      <DocumentAndSampleInfoForm
        reportData={{
          objetivo: reportData.objetivo,
          solicitantInfo: reportData.solicitantInfo,
          sampleInfo: reportData.sampleInfo,
          bulletinInfo: reportData.bulletinInfo,
          numeroBoletim: reportData.numeroBoletim,
          plataforma: reportData.plataforma,
          sistemaMedicao: reportData.sistemaMedicao,
          dateValidationDetails: reportData.dateValidationDetails,
        }}
        onInputChange={handleInputChange}
        onNestedInputChange={handleNestedInputChange}
      />
      
      <ComponentTable 
        components={reportData.components} 
        onComponentChange={handleComponentChange}
        onComponentBlur={handleComponentBlur}
        molarValidation={molarValidation}
      />
      <StandardPropertiesTable properties={reportData.standardProperties} onPropertyChange={handleStandardPropertyChange} />
      <SamplingConditionsPropertiesTable properties={reportData.samplingConditionsProperties} onPropertyChange={handleSamplingPropertyChange} />
      <AirContaminationTable properties={reportData.airContaminationProperties} onPropertyChange={handleAirContaminationPropertyChange} />
      <ObservationsSection observacoes={reportData.observacoesBoletim} onObservacoesChange={(val) => handleInputChange('observacoesBoletim', val)} />
      <ChecklistTable items={reportData.checklistItems} onItemChange={handleChecklistItemChange} />
      
      <TechnicalValidationSectionWrapper 
        reportData={reportData}
        onAga8DataChange={handleAga8DataChange}
        onRegulatoryItemChange={handleRegulatoryItemChange}
        onSqcDataChange={handleSqcDataChange}
      />

      <FinalConclusionSection 
        reportData={{
            decisaoFinal: reportData.decisaoFinal,
            justificativaTecnica: reportData.justificativaTecnica,
            acoesRecomendadas: reportData.acoesRecomendadas,
            referenciaCepStatus: reportData.referenciaCepStatus,
            referenciaAga8Status: reportData.referenciaAga8Status,
            referenciaChecklistStatus: reportData.referenciaChecklistStatus,
            dateValidationDetails: reportData.dateValidationDetails,
        }}
        onDecisionChange={handleDecisionChange}
        onActionChange={handleActionChange}
        onDateActionChange={handleDateActionChange}
      />
      
      <ApprovalSection 
        reportData={{
          responsavelAnaliseNome: reportData.responsavelAnaliseNome,
          responsavelAnaliseData: reportData.responsavelAnaliseData,
          aprovacaoAnaliseNome: reportData.aprovacaoAnaliseNome,
          aprovacaoAnaliseData: reportData.aprovacaoAnaliseData,
        }}
        onInputChange={handleInputChange}
      />

                      {/* Progress Bar */}
        <div className="p-4 mb-6 bg-white rounded-xl shadow-md">
          <ProgressBar progress={progress} />
        </div>

        {/* Validation Summary */}
        <div className="p-4 mb-6 bg-white rounded-xl shadow-md">
          <h2 className="mb-3 text-lg font-semibold text-gray-700">Status de Validação</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={`p-3 rounded-lg ${molarValidation.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <h3 className="font-medium">Composição Molar</h3>
              <p className="text-sm">{molarValidation.message}</p>
            </div>
            <div className={`p-3 rounded-lg ${requiredFieldsValidation.isValid ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
              <h3 className="font-medium">Campos Obrigatórios</h3>
              <p className="text-sm">
                {requiredFieldsValidation.isValid 
                  ? 'Todos os campos obrigatórios preenchidos' 
                  : `${requiredFieldsValidation.missingFields.length} campo(s) pendente(s)`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Excel Template Manager */}
        <ExcelTemplateManager
          reportData={reportData}
          onDataImport={handleDataImport}
          onNotification={addNotification}
        />

        <div className="p-4 mt-8 mb-4 bg-white rounded-xl shadow-md">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Opções</h2>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowTemplateSelector(true)}
              className="px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
              aria-label="Selecionar template pré-configurado"
            >
              📋 Templates
            </button>
            
            <PDFGenerator 
              reportData={reportData} 
              onNotification={addSimpleNotification}
              onValidateRequiredFields={validateAndNotifyRequiredFields}
              onValidateMolarComposition={validateAndNotifyMolarComposition}
            />
            
            <button 
              onClick={() => setShowAnalyticsDashboard(true)}
              className="px-4 py-2 font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700"
              aria-label="Abrir dashboard analítico"
            >
              📊 Dashboard
            </button>
            
            <button 
              onClick={() => {
                // Validate before exporting
                let isValid = true;
                
                if (!validateAndNotifyRequiredFields()) {
                  isValid = false;
                }
                
                if (!validateAndNotifyMolarComposition()) {
                  isValid = false;
                }
                
                if (!isValid) {
                  addNotification('error', 'Exportação Cancelada', 'Corrija os problemas de validação antes de exportar.');
                  return;
                }
                
                // Exportar dados para JSON
                const dataStr = JSON.stringify(reportData, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `relatorio_validacao_${reportData.numeroBoletim || 'dados'}_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                addNotification('success', 'Exportação Concluída', 'Dados exportados para arquivo JSON com sucesso.');
              }}
              className="px-4 py-2 font-bold text-white rounded bg-purple-custom hover:bg-purple-700"
              aria-label="Exportar dados para arquivo JSON"
            >
              📥 Exportar JSON
            </button>
          
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              style={{ display: 'none' }}
              id="import-json"
            />
            <label
              htmlFor="import-json"
              className="inline-block px-4 py-2 font-bold text-white bg-green-600 rounded cursor-pointer hover:bg-green-700"
            >
              📤 Importar JSON
            </label>
            
            <button
              onClick={handleClearData}
              className="px-4 py-2 font-bold text-black bg-yellow-500 rounded hover:bg-yellow-600"
              aria-label="Limpar todos os dados do formulário"
            >
              Limpar Dados
            </button>
            

          </div>
        </div>

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onTemplateSelect={applyTemplate}
      />

      {/* Analytics Dashboard Modal */}
      <AnalyticsDashboard
        reportData={reportData}
        isOpen={showAnalyticsDashboard}
        onClose={() => setShowAnalyticsDashboard(false)}
      />
    </div>
    </ErrorBoundary>
  );
};

export default App;
