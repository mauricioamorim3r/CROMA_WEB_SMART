
// cSpell:ignore Solicitante
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ReportData, ComponentData, ChecklistItem, SampleProperty, ValidationStatus, ChecklistStatus, 
  StatisticalProcessControlData, 
  RecommendedActions, SamplingConditionProperty, 
  AirContaminationProperty, RegulatoryComplianceItem, DateValidationDetails
} from './types';
import { 
  INITIAL_COMPONENTS, INITIAL_CHECKLIST_ITEMS, INITIAL_STANDARD_PROPERTIES, 
  INITIAL_SAMPLING_CONDITION_PROPERTIES, INITIAL_AIR_CONTAMINATION_PROPERTIES,
  INITIAL_REGULATORY_COMPLIANCE_ITEMS, PART_TITLE_CLASS,
  INITIAL_DATE_VALIDATION_DETAILS
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

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizePercentage}%`;
  }, [fontSizePercentage]);

  const handleIncreaseFontSize = useCallback(() => {
    setFontSizePercentage(prev => Math.min(prev + 10, 150)); // Max 150%
  }, []);

  const handleDecreaseFontSize = useCallback(() => {
    setFontSizePercentage(prev => Math.max(prev - 10, 70)); // Min 70%
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
      return {
        ...prev,
        [sectionKey]: {
          ...section,
          [field]: value,
        },
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
      window.scrollTo(0, 0); // Scroll to top for better UX
    }
  }, []);


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

    const updatedStandardProperties = reportData.standardProperties.map(prop => {
      let cepStatus = ValidationStatus.Pendente;
      const val = parseFloat(prop.value);
      const cepLower = parseFloat(prop.cepLowerLimit);
      const cepUpper = parseFloat(prop.cepUpperLimit);

      if (!isNaN(val) && !isNaN(cepLower) && !isNaN(cepUpper)) {
        cepStatus = val >= cepLower && val <= cepUpper ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa;
      }
      return { ...prop, cepStatus };
    });
    
    const updatedRegulatoryComplianceItems = reportData.regulatoryComplianceItems.map(item => {
        let bulletinValue = '';
        let numericBulletinValue = NaN;
        let status = ValidationStatus.Pendente;

        switch (item.id) {
            case 'pcs_reg':
                const pcsProp = reportData.standardProperties.find(p => p.id === 'pcs');
                bulletinValue = pcsProp?.value || '';
                break;
            case 'co2_reg':
                const co2Comp = updatedComponents.find(c => c.name === 'Dióxido de Carbono (CO₂)');
                bulletinValue = co2Comp?.molarPercent || '';
                break;
            case 'h2s_reg': 
                bulletinValue = item.bulletinValue; // Manual Input
                 break;
            case 'inerts_reg':
                const n2Comp = updatedComponents.find(c => c.name === 'Nitrogênio (N₂)');
                const co2ForInerts = updatedComponents.find(c => c.name === 'Dióxido de Carbono (CO₂)');
                const n2Val = parseFloat(n2Comp?.molarPercent || 'NaN');
                const co2Val = parseFloat(co2ForInerts?.molarPercent || 'NaN');
                if (!isNaN(n2Val) && !isNaN(co2Val)) {
                    bulletinValue = (n2Val + co2Val).toFixed(4);
                } else if (!isNaN(n2Val)) {
                    bulletinValue = n2Val.toFixed(4);
                } else if (!isNaN(co2Val)) {
                    bulletinValue = co2Val.toFixed(4);
                } else {
                    bulletinValue = '';
                }
                break;
            case 'c6plus_reg':
                const c6 = getComponentValue('Hexano (C₆)');
                const c7 = getComponentValue('Heptano (C₇)');
                const c8 = getComponentValue('Octano (C₈)');
                const c9plus = getComponentValue('Nonano (C₉⁺)');
                const c6PlusValues = [c6,c7,c8,c9plus].filter(v => !isNaN(v));
                if (c6PlusValues.length > 0) {
                   bulletinValue = c6PlusValues.reduce((sum, v) => sum + v, 0).toFixed(4);
                } else {
                    bulletinValue = '';
                }
                break;
            case 'c1_reg':
                const c1Comp = updatedComponents.find(c => c.name === 'Metano (C₁)');
                bulletinValue = c1Comp?.molarPercent || '';
                break;
        }
        
        if (bulletinValue) {
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
        return { ...item, bulletinValue: item.id === 'h2s_reg' ? item.bulletinValue : bulletinValue, status };
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

    if (
        newReferenciaAga8Status !== reportData.referenciaAga8Status ||
        newReferenciaCepStatus !== reportData.referenciaCepStatus ||
        newReferenciaChecklistStatus !== reportData.referenciaChecklistStatus ||
        JSON.stringify(updatedComponents) !== JSON.stringify(reportData.components) ||
        JSON.stringify(updatedStandardProperties) !== JSON.stringify(reportData.standardProperties) ||
        JSON.stringify(updatedRegulatoryComplianceItems) !== JSON.stringify(reportData.regulatoryComplianceItems) ||
        aga8DataNeedsUpdate
      ) {
      setReportData(prev => ({ 
        ...prev, 
        components: updatedComponents, 
        standardProperties: updatedStandardProperties,
        regulatoryComplianceItems: updatedRegulatoryComplianceItems,
        referenciaAga8Status: newReferenciaAga8Status,
        referenciaCepStatus: newReferenciaCepStatus,
        referenciaChecklistStatus: newReferenciaChecklistStatus,
        aga8ValidationData: {
            ...prev.aga8ValidationData,
            faixaComposicaoCompativel: newFaixaComposicaoCompativelAGA8,
        }
      }));
    }

  }, [
      reportData.components, 
      reportData.standardProperties, 
      reportData.checklistItems, 
      reportData.regulatoryComplianceItems, 
      reportData.aga8ValidationData.faixaComposicaoCompativel, 
      reportData.referenciaAga8Status, 
      reportData.referenciaCepStatus, 
      reportData.referenciaChecklistStatus
    ]);

  useEffect(() => {
    const newDateValidations: DateValidationDetails = JSON.parse(JSON.stringify(INITIAL_DATE_VALIDATION_DETAILS));
    const PRAZO_COLETA_EMISSAO_DIAS = 30; // 30-day limit

    const {
      sampleInfo: { dataHoraColeta },
      bulletinInfo: { dataRecebimentoAmostra, dataAnaliseLaboratorial, dataEmissaoBoletim, dataRecebimentoBoletimSolicitante },
      dataRealizacaoAnaliseCritica
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
                  (key === 'rtm52_prazoEmissaoBoletim' && dataAnaliseLaboratorial && dataEmissaoBoletim) ||
                  (key === 'prazo_coleta_emissao_boletim' && dataHoraColeta && dataEmissaoBoletim) 
      ) {
        // If one date is filled but the other isn't, but both are required for the rule, it's effectively pending on the other date.
        // The individual date input itself triggers the logic, so this covers cases where inputs are partially complete for a rule.
        // Keep as pending unless an error is detected.
         newDateValidations[key] = { status: ValidationStatus.Pendente, message: null };
      }
    };
    
    setValidation('seq_coleta_recebLab', dColeta, dRecebLab, (d1, d2) => `Data da Coleta (${d1}) deve ser anterior ou igual à Data de Recebimento Lab. (${d2}).`);
    setValidation('seq_recebLab_analiseLab', dRecebLab, dAnaliseLab, (d1, d2) => `Data de Recebimento Lab. (${d1}) deve ser anterior ou igual à Data de Análise Lab. (${d2}).`);
    setValidation('seq_analiseLab_emissaoLab', dAnaliseLab, dEmissaoLab, (d1, d2) => `Data de Análise Lab. (${d1}) deve ser anterior ou igual à Data de Emissão Boletim Lab. (${d2}).`);
    setValidation('seq_emissaoLab_recebSolic', dEmissaoLab, dRecebSolic, (d1, d2) => `Data de Emissão Boletim Lab. (${d1}) deve ser anterior ou igual à Data de Recebimento Solic. (${d2}).`);
    setValidation('seq_recebSolic_analiseCritica', dRecebSolic, dAnaliseCritica, (d1, d2) => `Data de Recebimento Solic. (${d1}) deve ser anterior ou igual à Data de Análise Crítica (${d2}).`);

    // RTM52 - Prazo emissão boletim (após análise)
    if (dAnaliseLab && dEmissaoLab) {
      if (dEmissaoLab.getTime() < dAnaliseLab.getTime()){
          newDateValidations.rtm52_prazoEmissaoBoletim = { status: ValidationStatus.ForaDaFaixa, message: `Data de Emissão do Boletim (${formatDate(dEmissaoLab)}) não pode ser anterior à Data de Análise Laboratorial (${formatDate(dAnaliseLab)}).` };
      } else {
        const diffTime = dEmissaoLab.getTime() - dAnaliseLab.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays > 7) { 
          newDateValidations.rtm52_prazoEmissaoBoletim = {
            status: ValidationStatus.ForaDaFaixa,
            message: `Prazo para emissão do boletim (RTM ANP 52: ~5 dias úteis) pode ter sido excedido (${diffDays.toFixed(0)} dias corridos entre análise e emissão). Verifique feriados/fins de semana.`
          };
        } else {
          newDateValidations.rtm52_prazoEmissaoBoletim = { status: ValidationStatus.OK, message: null };
        }
      }
    } else if (dataAnaliseLaboratorial && dataEmissaoBoletim) {
        newDateValidations.rtm52_prazoEmissaoBoletim = { status: ValidationStatus.Pendente, message: null };
    }


    // Prazo Coleta até Emissão Boletim
    if (dColeta && dEmissaoLab) {
        if (dEmissaoLab.getTime() < dColeta.getTime()) {
            newDateValidations.prazo_coleta_emissao_boletim = {
                status: ValidationStatus.ForaDaFaixa,
                message: `Data de Emissão do Boletim (${formatDate(dEmissaoLab)}) não pode ser anterior à Data de Coleta (${formatDate(dColeta)}).`
            };
        } else {
            const diffTimeColetaEmissao = dEmissaoLab.getTime() - dColeta.getTime();
            const diffDaysColetaEmissao = Math.ceil(diffTimeColetaEmissao / (1000 * 60 * 60 * 24)); 
            if (diffDaysColetaEmissao > PRAZO_COLETA_EMISSAO_DIAS) {
                newDateValidations.prazo_coleta_emissao_boletim = {
                    status: ValidationStatus.ForaDaFaixa,
                    message: `Prazo entre Coleta (${formatDate(dColeta)}) e Emissão do Boletim (${formatDate(dEmissaoLab)}) de ${diffDaysColetaEmissao} dias excede o limite de ${PRAZO_COLETA_EMISSAO_DIAS} dias.`
                };
            } else {
                newDateValidations.prazo_coleta_emissao_boletim = { status: ValidationStatus.OK, message: null };
            }
        }
    } else if (dataHoraColeta && dataEmissaoBoletim) {
        newDateValidations.prazo_coleta_emissao_boletim = { status: ValidationStatus.Pendente, message: null };
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
    reportData.dataRealizacaoAnaliseCritica,
    reportData.dateValidationDetails 
  ]);


  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
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
      
      <ComponentTable components={reportData.components} onComponentChange={handleComponentChange} />
      <StandardPropertiesTable properties={reportData.standardProperties} onPropertyChange={handleStandardPropertyChange} />
      <SamplingConditionsPropertiesTable properties={reportData.samplingConditionsProperties} onPropertyChange={handleSamplingPropertyChange} />
      <AirContaminationTable properties={reportData.airContaminationProperties} onPropertyChange={handleAirContaminationPropertyChange} />
      <ObservationsSection observacoes={reportData.observacoesBoletim} onObservacoesChange={(val) => handleInputChange('observacoesBoletim', val)} />
      <ChecklistTable items={reportData.checklistItems} onItemChange={handleChecklistItemChange} />
      
      <TechnicalValidationSectionWrapper 
        reportData={{
            aga8ValidationData: reportData.aga8ValidationData,
            regulatoryComplianceItems: reportData.regulatoryComplianceItems,
            statisticalProcessControlData: reportData.statisticalProcessControlData,
        }}
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

              <div className="mt-8 mb-4 p-4 bg-white shadow-md rounded-xl">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Opções</h2>
        <button 
                      onClick={() => {
              // Exportar dados para JSON
              const dataStr = JSON.stringify(reportData, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `relatorio_validacao_${reportData.numeroBoletim || 'dados'}_${new Date().toISOString().split('T')[0]}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          className="bg-purple-custom hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2"
          aria-label="Logar estado atual do formulário em formato JSON no console"
        >
          Log Estado Atual (JSON)
        </button>
        <button
          onClick={handleClearData}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded mr-2"
          aria-label="Limpar todos os dados do formulário"
        >
          Limpar Dados
        </button>
         <button 
            onClick={() => window.print()}
            className="bg-lime-custom hover:bg-lime-500 text-purple-custom font-bold py-2 px-4 rounded"
            aria-label="Imprimir relatório"
        >
            Imprimir Relatório
        </button>
      </div>

    </div>
  );
};

export default App;
