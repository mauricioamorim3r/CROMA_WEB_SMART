import React, { useState, useEffect } from 'react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import { ReportData, ValidationStatus } from '../types';
import { captureError } from '../src/config/sentry';
import { generateCEPSection } from './PDFCEPIntegration';

interface PDFGeneratorProps {
  reportData: ReportData;
  onNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onValidateRequiredFields?: () => boolean;
  onValidateMolarComposition?: () => boolean;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ 
  reportData, 
  onNotification
}) => {
  const [showPreview, setShowPreview] = useState(false);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clean up any orphaned PDF containers when component unmounts
      try {
        const containers = document.querySelectorAll('[data-pdf-generator="true"]');
        containers.forEach(container => {
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        });
      } catch (error) {
        console.warn('Erro na limpeza final do PDFGenerator:', error);
        captureError(error instanceof Error ? error : new Error(String(error)), { 
          source: 'PDFGenerator', 
          context: 'finalCleanup' 
        });
      }
    };
  }, []);

  const generatePDF = async () => {
    onNotification('📄 Geração de PDF temporariamente indisponível. Aguardando instalação das bibliotecas necessárias.', 'warning');
  };

  const generatePDFContent = (): string => {
    const { components, aga8ValidationData } = reportData;
    
    // ✅ SEÇÃO QUALIDADE - Função para adicionar seção de qualidade no PDF
    const addQualitySection = (): string => {
      if (!reportData.gasQuality) return '';
      
      // ✅ CORREÇÃO LINTER - Verificação segura de qualityValidationDetails
      const hasViolations = reportData.qualityValidationDetails?.violations?.pipeline?.length && 
                           reportData.qualityValidationDetails.violations.pipeline.length > 0;
      
      const violationsList = reportData.qualityValidationDetails?.violations?.pipeline || [];
      
      return `
        <!-- Quality Classification Section -->
        <div style="margin-bottom: 25px;">
          <h3 style="background: #1b0571; color: #d5fb00; padding: 8px 12px; margin: 0 0 15px 0; border-radius: 4px; font-size: 14px;">
            3. CLASSIFICAÇÃO DE QUALIDADE - AGA-8 PART 2
          </h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; background: #f9f9f9; font-weight: bold; width: 30%;">Qualidade do Gás:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reportData.gasQuality}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; background: #f9f9f9; font-weight: bold;">Método de Validação:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reportData.validationMethod || 'N/A'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; background: #f9f9f9; font-weight: bold;">Faixa Operacional:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reportData.operationalRange?.toUpperCase() || 'N/A'}</td>
            </tr>
          </table>
          
          ${hasViolations ? `
          <div style="margin-top: 15px; padding: 10px; border: 2px solid #dc2626; border-radius: 8px; background: #fef2f2;">
            <h4 style="margin: 0 0 10px 0; color: #dc2626; font-weight: bold;">Violações Pipeline Quality:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #dc2626;">
              ${violationsList.map(violation => 
                `<li style="margin-bottom: 5px;">${violation}</li>`
              ).join('')}
            </ul>
          </div>
          ` : ''}
        </div>
      `;
    };
    
    return `
      <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1b0571; padding-bottom: 20px;">
          <h1 style="color: #1b0571; font-size: 24px; margin: 0 0 10px 0; font-weight: bold;">
            RELATÓRIO DE VALIDAÇÃO CROMATOGRÁFICA
          </h1>
          <h2 style="color: #d5fb00; background: #1b0571; padding: 8px 16px; margin: 0; font-size: 16px; border-radius: 4px;">
            Análise de Gás Natural
          </h2>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 11px;">
            Data de Geração: ${new Date().toLocaleDateString('pt-BR')} | 
            Hora: ${new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>

        <!-- Report Info -->
        <div style="margin-bottom: 25px;">
          <h3 style="background: #1b0571; color: #d5fb00; padding: 8px 12px; margin: 0 0 15px 0; border-radius: 4px; font-size: 14px;">
            1. INFORMAÇÕES DO RELATÓRIO
          </h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; background: #f9f9f9; font-weight: bold; width: 30%;">Objetivo:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reportData.objetivo || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; background: #f9f9f9; font-weight: bold;">Plataforma/Campo:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reportData.plataforma || 'Não informado'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; background: #f9f9f9; font-weight: bold;">Sistema de Medição:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reportData.sistemaMedicao || 'Não informado'}</td>
            </tr>
          </table>
        </div>

        <!-- Components Table -->
        <div style="margin-bottom: 25px;">
          <h3 style="background: #1b0571; color: #d5fb00; padding: 8px 12px; margin: 0 0 15px 0; border-radius: 4px; font-size: 14px;">
            2. COMPOSIÇÃO MOLAR
          </h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 11px;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Componente</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">% Molar</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Limite Inf. CEP</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Limite Sup. CEP</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${components.map(comp => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 6px;">${comp.name}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${comp.molarPercent || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${comp.cepLowerLimit || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${comp.cepUpperLimit || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center; ${
                    comp.cepStatus === ValidationStatus.OK ? 'color: #059669; font-weight: bold;' :
                    comp.cepStatus === ValidationStatus.ForaDaFaixa ? 'color: #dc2626; font-weight: bold;' :
                    'color: #d97706; font-weight: bold;'
                  }">${comp.cepStatus}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- ✅ INSERÇÃO SEÇÃO QUALIDADE - Adicionar seção de qualidade após composição e antes da validação CEP -->
        ${addQualitySection()}

        <!-- AGA Validation -->
        <div style="margin-bottom: 25px;">
          <h3 style="background: #1b0571; color: #d5fb00; padding: 8px 12px; margin: 0 0 15px 0; border-radius: 4px; font-size: 14px;">
            4. VALIDAÇÃO A.G.A Report Nº8
          </h3>
          <div style="padding: 15px; border: 2px solid #059669; border-radius: 8px; background: #f0fdf4;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #059669;">
              Faixa de Pressão: ${aga8ValidationData.faixaPressaoValida || 'N/A'}
            </p>
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #059669;">
              Faixa de Temperatura: ${aga8ValidationData.faixaTemperaturaValida || 'N/A'}
            </p>
            <p style="margin: 0; font-size: 11px;">
              Composição Compatível: ${aga8ValidationData.faixaComposicaoCompativel || 'Pendente'}
            </p>
          </div>
        </div>

        <!-- CEP Section -->
        ${generateCEPSection()}

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #1b0571; text-align: center; font-size: 10px; color: #666;">
          <p style="margin: 0;">Relatório gerado automaticamente pelo Sistema de Validação Cromatográfica</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} - Todos os direitos reservados</p>
        </div>
      </div>
    `;
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={generatePDF}
        className="flex gap-2 items-center px-4 py-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        📄 Gerar PDF
      </button>

      <button
        onClick={() => {
          // Always allow preview regardless of validation status
          setShowPreview(!showPreview);
        }}
        className="flex gap-2 items-center px-4 py-2 text-white bg-gray-600 rounded-lg transition-colors hover:bg-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        👁️ Preview
      </button>

      {/* Preview Modal */}
      {showPreview && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 border-solid">
              <h3 className="text-lg font-semibold">Preview do PDF</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fechar preview"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div 
              className="p-6"
              dangerouslySetInnerHTML={{ __html: generatePDFContent() }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFGenerator;