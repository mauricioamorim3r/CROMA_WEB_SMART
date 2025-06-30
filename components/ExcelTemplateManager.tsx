import React, { useCallback, useRef, useState } from 'react';
import { ReportData, ProcessType } from '../types';
import { INITIAL_COMPONENTS, INITIAL_STANDARD_PROPERTIES, INITIAL_SAMPLING_CONDITION_PROPERTIES, INITIAL_AIR_CONTAMINATION_PROPERTIES } from '../constants';
// import * as ExcelJS from 'exceljs';

interface ExcelTemplateManagerProps {
  reportData: ReportData;
  onDataImport: (data: Partial<ReportData>) => void;
  onNotification: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
}

const ExcelTemplateManager: React.FC<ExcelTemplateManagerProps> = ({
  reportData,
  onDataImport,
  onNotification
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Função para converter data de DD/MM/AAAA para YYYY-MM-DD
  const convertDateFormat = useCallback((dateStr: string): string => {
    if (!dateStr) return '';
    
    // Se já está no formato correto (YYYY-MM-DD), retorna como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Converter de DD/MM/AAAA para YYYY-MM-DD
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateStr; // Retorna original se não conseguir converter
  }, []);

  // Função para converter data e hora de DD/MM/AAAA HH:MM para YYYY-MM-DDTHH:MM
  const convertDateTimeFormat = useCallback((dateTimeStr: string): string => {
    if (!dateTimeStr) return '';
    
    // Se já está no formato correto (YYYY-MM-DDTHH:MM), retorna como está
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateTimeStr)) {
      return dateTimeStr;
    }
    
    // Converter de DD/MM/AAAA HH:MM para YYYY-MM-DDTHH:MM
    const match = dateTimeStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
    if (match) {
      const [, day, month, year, hour, minute] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}`;
    }
    
    return dateTimeStr; // Retorna original se não conseguir converter
  }, []);

  // Função para download de CSV
  const downloadCSV = useCallback((content: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Gerar template CSV vazio com formato Excel adequado
  const generateCSVTemplate = useCallback(() => {
    try {
      let csvContent = 'A,B,C,D,E\n';
      
      // Seção 2: Informações do Solicitante
      csvContent += '2. INFORMAÇÕES DO SOLICITANTE,,,,\n';
      csvContent += ',Nome do Cliente/Solicitante,,Nome completo da empresa ou pessoa física,\n';
      csvContent += ',Endereço/Localização,,Endereço completo da empresa/instalação,\n';
      csvContent += ',Contato Responsável,,Nome e contato do responsável pela solicitação,\n';
      csvContent += ',,,,\n';

      // Seção 3: Informações da Amostra
      csvContent += '3. INFORMAÇÕES DA AMOSTRA,,,,\n';
      csvContent += ',Número da Amostra,,Identificação única da amostra,\n';
      csvContent += ',Data/Hora da Coleta,,Formato: DD/MM/AAAA HH:MM,\n';
      csvContent += ',Local da Coleta,,Descrição do local de coleta,\n';
      csvContent += ',Ponto de Coleta (TAG),,Identificação do ponto de medição,\n';
      csvContent += ',Poço de Apropriação,,Identificação do poço quando aplicável,\n';
      csvContent += ',Número do Cilindro,,Identificação do cilindro da amostra,\n';
      csvContent += ',Responsável pela Amostragem,,Nome do responsável técnico,\n';
      csvContent += ',Pressão Absoluta (kPa.A),,Pressão da amostra em kPa absoluto,\n';
      csvContent += ',Pressão Manométrica (kPa),,Pressão da amostra em kPa manométrico,\n';
      csvContent += ',Temperatura (K),,Temperatura da amostra em Kelvin,\n';
      csvContent += ',Temperatura (°C),,Temperatura da amostra em Celsius,\n';
      csvContent += ',,,,\n';

      // Seção 4: Dados do Boletim
      csvContent += '4. DADOS DO BOLETIM,,,,\n';
      csvContent += ',Data Recebimento Amostra,,Formato: DD/MM/AAAA,\n';
      csvContent += ',Data Análise Laboratorial,,Formato: DD/MM/AAAA,\n';
      csvContent += ',Data Emissão Boletim,,Formato: DD/MM/AAAA,\n';
      csvContent += ',Data Recebimento Solicitante,,Formato: DD/MM/AAAA,\n';
      csvContent += ',Laboratório Emissor,,Nome do laboratório que emitiu o boletim,\n';
      csvContent += ',Equipamento Utilizado,,Identificação do cromatógrafo utilizado,\n';
      csvContent += ',Método Normativo,,Normas e métodos utilizados na análise,\n';
      csvContent += ',Tipo de Processo,,ProcessoNormal ou ProcessoSemValidacao,\n';
      csvContent += ',,,,\n';

      // Seção 5: Composição Molar (2 colunas de valores: C e D)
      csvContent += '5. COMPOSIÇÃO MOLAR,,,,\n';
      csvContent += ',COMPONENTE,COMPOSIÇÃO MOLAR (%),INCERTEZA ASSOCIADA (%),\n';
      INITIAL_COMPONENTS.forEach(comp => {
        csvContent += `,"${comp.name}",,,\n`;
      });
      csvContent += ',,,,\n';

      // Seção 6: Propriedades Padrão (2 colunas de valores: C e D)
      csvContent += '6. PROPRIEDADES PADRÃO,,,,\n';
      csvContent += ',PROPRIEDADE,VALOR,REFERÊNCIA,\n';
      INITIAL_STANDARD_PROPERTIES.forEach(prop => {
        csvContent += `,"${prop.name}",,,\n`;
      });
      csvContent += ',,,,\n';

      // Seção 7: Condições de Amostragem (2 colunas de valores: C e D)
      csvContent += '7. CONDIÇÕES DE AMOSTRAGEM,,,,\n';
      csvContent += ',PROPRIEDADE,VALOR,REFERÊNCIA,\n';
      INITIAL_SAMPLING_CONDITION_PROPERTIES.forEach(prop => {
        csvContent += `,"${prop.name}",,,\n`;
      });
      csvContent += ',,,,\n';

      // Seção 8: Contaminação por Ar (2 colunas de valores: C e D)
      csvContent += '8. CONTAMINAÇÃO POR AR,,,,\n';
      csvContent += ',COMPONENTE,COMPOSIÇÃO MOLAR (%),REFERÊNCIA,\n';
      INITIAL_AIR_CONTAMINATION_PROPERTIES.forEach(prop => {
        csvContent += `,"${prop.name}",,,\n`;
      });
      csvContent += ',,,,\n';

      // Seção 7: Observações (apenas coluna C)
      csvContent += '7. OBSERVAÇÕES,,,,\n';
      csvContent += ',Observações do Boletim,,Observações e comentários sobre o boletim analítico,\n';
      csvContent += ',Número Único Rastreabilidade,,Código único de rastreabilidade,\n';
      csvContent += ',Número do Boletim,,Número de identificação do boletim,\n';
      csvContent += ',Plataforma/Instalação,,Nome da plataforma ou instalação,\n';
      csvContent += ',Sistema de Medição,,Descrição do sistema de medição,\n';
      csvContent += ',Objetivo da Análise,,Objetivo da análise crítica,\n';

      const fileName = `Template_Validacao_Cromatografia_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, fileName);
      
              onNotification('success', 'Template Gerado', `Template "${fileName}" foi gerado e baixado com sucesso! Abra no Excel e renomeie a aba para "Template_Validacao_Cromatografi".`);
    } catch (error) {
      console.error('Erro ao gerar template CSV:', error);
      onNotification('error', 'Erro', `Erro ao gerar template CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [downloadCSV, onNotification]);

  // Gerar template CSV simples e intuitivo (NOVA VERSÃO)
  const generateSimpleCSVTemplate = useCallback(() => {
    try {
      let csvContent = 'CAMPO,VALOR,OBSERVACAO\n';
      
      // SEÇÃO: Informações do Solicitante
      csvContent += 'SECAO_SOLICITANTE,,,\n';
      csvContent += 'Nome do Cliente/Solicitante,,Nome completo da empresa ou pessoa física\n';
      csvContent += 'Endereco/Localizacao,,Endereço completo da empresa/instalação\n';
      csvContent += 'Contato Responsavel,,Nome e contato do responsável pela solicitação\n';
      csvContent += ',,,\n';

      // SEÇÃO: Informações da Amostra
      csvContent += 'SECAO_AMOSTRA,,,\n';
      csvContent += 'Numero da Amostra,,Identificação única da amostra\n';
      csvContent += 'Data/Hora da Coleta,,Formato: DD/MM/AAAA HH:MM\n';
      csvContent += 'Local da Coleta,,Descrição do local de coleta\n';
      csvContent += 'Ponto de Coleta (TAG),,Identificação do ponto de medição\n';
      csvContent += 'Poco de Apropriacao,,Identificação do poço quando aplicável\n';
      csvContent += 'Numero do Cilindro,,Identificação do cilindro da amostra\n';
      csvContent += 'Responsavel pela Amostragem,,Nome do responsável técnico\n';
      csvContent += 'Pressao Absoluta (kPa.A),,Pressão da amostra em kPa absoluto\n';
      csvContent += 'Pressao Manometrica (kPa),,Pressão da amostra em kPa manométrico\n';
      csvContent += 'Temperatura (K),,Temperatura da amostra em Kelvin\n';
      csvContent += 'Temperatura (C),,Temperatura da amostra em Celsius\n';
      csvContent += ',,,\n';

      // SEÇÃO: Dados do Boletim
      csvContent += 'SECAO_BOLETIM,,,\n';
      csvContent += 'Data Recebimento Amostra,,Formato: DD/MM/AAAA\n';
      csvContent += 'Data Analise Laboratorial,,Formato: DD/MM/AAAA\n';
      csvContent += 'Data Emissao Boletim,,Formato: DD/MM/AAAA\n';
      csvContent += 'Data Recebimento Solicitante,,Formato: DD/MM/AAAA\n';
      csvContent += 'Laboratorio Emissor,,Nome do laboratório que emitiu o boletim\n';
      csvContent += 'Equipamento Utilizado,,Identificação do cromatógrafo utilizado\n';
      csvContent += 'Metodo Normativo,,Normas e métodos utilizados na análise\n';
      csvContent += 'Tipo de Processo,ProcessoNormal,ProcessoNormal ou ProcessoSemValidacao\n';
      csvContent += ',,,\n';

      // SEÇÃO: Composição Molar
      csvContent += 'SECAO_COMPONENTES,,,\n';
      INITIAL_COMPONENTS.forEach(comp => {
        const simpleName = comp.name.replace(/[(),₁₂₃₄₅₆₇₈₉₀]/g, '').replace(/\s+/g, '_');
        csvContent += `${simpleName},,Composição molar em %\n`;
        csvContent += `${simpleName}_Incerteza,,Incerteza associada em %\n`;
      });
      csvContent += ',,,\n';

      // SEÇÃO: Propriedades Padrão
      csvContent += 'SECAO_PROPRIEDADES_PADRAO,,,\n';
      INITIAL_STANDARD_PROPERTIES.forEach(prop => {
        const simpleName = prop.name.replace(/[(),]/g, '').replace(/\s+/g, '_');
        csvContent += `${simpleName},,Valor\n`;
        csvContent += `${simpleName}_Referencia,,Referência\n`;
      });
      csvContent += ',,,\n';

      // SEÇÃO: Condições de Amostragem
      csvContent += 'SECAO_CONDICOES_AMOSTRAGEM,,,\n';
      INITIAL_SAMPLING_CONDITION_PROPERTIES.forEach(prop => {
        const simpleName = prop.name.replace(/[(),]/g, '').replace(/\s+/g, '_');
        csvContent += `${simpleName},,Valor\n`;
        csvContent += `${simpleName}_Referencia,,Referência\n`;
      });
      csvContent += ',,,\n';

      // SEÇÃO: Contaminação por Ar
      csvContent += 'SECAO_CONTAMINACAO_AR,,,\n';
      INITIAL_AIR_CONTAMINATION_PROPERTIES.forEach(prop => {
        const simpleName = prop.name.replace(/[(),]/g, '').replace(/\s+/g, '_');
        csvContent += `${simpleName},,Composição molar em %\n`;
        csvContent += `${simpleName}_Referencia,,Referência\n`;
      });
      csvContent += ',,,\n';

      // SEÇÃO: Observações
      csvContent += 'SECAO_OBSERVACOES,,,\n';
      csvContent += 'Observacoes do Boletim,,Observações e comentários sobre o boletim analítico\n';
      csvContent += 'Numero Unico Rastreabilidade,,Código único de rastreabilidade\n';
      csvContent += 'Numero do Boletim,,Número de identificação do boletim\n';
      csvContent += 'Plataforma/Instalacao,,Nome da plataforma ou instalação\n';
      csvContent += 'Sistema de Medicao,,Descrição do sistema de medição\n';

      const fileName = `Template_Simples_Validacao_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, fileName);
      
      onNotification('success', 'Template Simples Gerado', `Template simples "${fileName}" foi gerado! Muito mais fácil de preencher no Excel - apenas 2 colunas: CAMPO e VALOR.`);
    } catch (error) {
      console.error('Erro ao gerar template simples:', error);
      onNotification('error', 'Erro', `Erro ao gerar template simples: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [downloadCSV, onNotification]);

  // Exportar dados atuais para CSV com formato Excel adequado
  const exportCurrentDataToCSV = useCallback(() => {
    try {
      let csvContent = 'A,B,C,D,E\n';
      
      // Seção 2: Informações do Solicitante (com dados)
      csvContent += '2. INFORMAÇÕES DO SOLICITANTE,,,,\n';
      csvContent += `,Nome do Cliente/Solicitante,"${reportData.solicitantInfo?.nomeClienteSolicitante || ''}",Nome completo da empresa ou pessoa física,\n`;
      csvContent += `,Endereço/Localização,"${reportData.solicitantInfo?.enderecoLocalizacaoClienteSolicitante || ''}",Endereço completo da empresa/instalação,\n`;
      csvContent += `,Contato Responsável,"${reportData.solicitantInfo?.contatoResponsavelSolicitacao || ''}",Nome e contato do responsável pela solicitação,\n`;
      csvContent += ',,,,\n';

      // Seção 3: Informações da Amostra (com dados)
      csvContent += '3. INFORMAÇÕES DA AMOSTRA,,,,\n';
      csvContent += `,Número da Amostra,"${reportData.sampleInfo?.numeroAmostra || ''}",Identificação única da amostra,\n`;
      csvContent += `,Data/Hora da Coleta,"${reportData.sampleInfo?.dataHoraColeta || ''}",Formato: DD/MM/AAAA HH:MM,\n`;
      csvContent += `,Local da Coleta,"${reportData.sampleInfo?.localColeta || ''}",Descrição do local de coleta,\n`;
      csvContent += `,Ponto de Coleta (TAG),"${reportData.sampleInfo?.pontoColetaTAG || ''}",Identificação do ponto de medição,\n`;
      csvContent += `,Poço de Apropriação,"${reportData.sampleInfo?.pocoApropriacao || ''}",Identificação do poço quando aplicável,\n`;
      csvContent += `,Número do Cilindro,"${reportData.sampleInfo?.numeroCilindroAmostra || ''}",Identificação do cilindro da amostra,\n`;
      csvContent += `,Responsável pela Amostragem,"${reportData.sampleInfo?.responsavelAmostragem || ''}",Nome do responsável técnico,\n`;
      csvContent += `,Pressão Absoluta (kPa.A),"${reportData.sampleInfo?.pressaoAmostraAbsolutaKpaA || ''}",Pressão da amostra em kPa absoluto,\n`;
      csvContent += `,Pressão Manométrica (kPa),"${reportData.sampleInfo?.pressaoAmostraManometricaKpa || ''}",Pressão da amostra em kPa manométrico,\n`;
      csvContent += `,Temperatura (K),"${reportData.sampleInfo?.temperaturaAmostraK || ''}",Temperatura da amostra em Kelvin,\n`;
      csvContent += `,Temperatura (°C),"${reportData.sampleInfo?.temperaturaAmostraC || ''}",Temperatura da amostra em Celsius,\n`;
      csvContent += ',,,,\n';

      // Seção 4: Dados do Boletim (com dados)
      csvContent += '4. DADOS DO BOLETIM,,,,\n';
      csvContent += `,Data Recebimento Amostra,"${reportData.bulletinInfo?.dataRecebimentoAmostra || ''}",Formato: DD/MM/AAAA,\n`;
      csvContent += `,Data Análise Laboratorial,"${reportData.bulletinInfo?.dataAnaliseLaboratorial || ''}",Formato: DD/MM/AAAA,\n`;
      csvContent += `,Data Emissão Boletim,"${reportData.bulletinInfo?.dataEmissaoBoletim || ''}",Formato: DD/MM/AAAA,\n`;
      csvContent += `,Data Recebimento Solicitante,"${reportData.bulletinInfo?.dataRecebimentoBoletimSolicitante || ''}",Formato: DD/MM/AAAA,\n`;
      csvContent += `,Laboratório Emissor,"${reportData.bulletinInfo?.laboratorioEmissor || ''}",Nome do laboratório que emitiu o boletim,\n`;
      csvContent += `,Equipamento Utilizado,"${reportData.bulletinInfo?.equipamentoCromatografoUtilizado || ''}",Identificação do cromatógrafo utilizado,\n`;
      csvContent += `,Método Normativo,"${reportData.bulletinInfo?.metodoNormativo || ''}",Normas e métodos utilizados na análise,\n`;
      csvContent += `,Tipo de Processo,"${reportData.bulletinInfo?.tipoProcesso || 'ProcessoNormal'}",ProcessoNormal ou ProcessoSemValidacao,\n`;
      csvContent += ',,,,\n';

      // Seção 5: Composição Molar (com dados em C e D)
      csvContent += '5. COMPOSIÇÃO MOLAR,,,,\n';
      csvContent += ',COMPONENTE,COMPOSIÇÃO MOLAR (%),INCERTEZA ASSOCIADA (%),\n';
      reportData.components.forEach(comp => {
        csvContent += `,"${comp.name}","${comp.molarPercent || ''}","${comp.incertezaAssociadaPercent || ''}",\n`;
      });
      csvContent += ',,,,\n';

      // Seção 6: Propriedades Padrão (com dados em C e D)
      csvContent += '6. PROPRIEDADES PADRÃO,,,,\n';
      csvContent += ',PROPRIEDADE,VALOR,REFERÊNCIA,\n';
      reportData.standardProperties.forEach(prop => {
        csvContent += `,"${prop.name}","${prop.value || ''}","${prop.referencia || ''}",\n`;
      });
      csvContent += ',,,,\n';

      // Seção 7: Condições de Amostragem (com dados em C e D)
      csvContent += '7. CONDIÇÕES DE AMOSTRAGEM,,,,\n';
      csvContent += ',PROPRIEDADE,VALOR,REFERÊNCIA,\n';
      reportData.samplingConditionsProperties.forEach(prop => {
        csvContent += `,"${prop.name}","${prop.value || ''}","${prop.referencia || ''}",\n`;
      });
      csvContent += ',,,,\n';

      // Seção 8: Contaminação por Ar (com dados em C e D)
      csvContent += '8. CONTAMINAÇÃO POR AR,,,,\n';
      csvContent += ',COMPONENTE,COMPOSIÇÃO MOLAR (%),REFERÊNCIA,\n';
      reportData.airContaminationProperties.forEach(prop => {
        csvContent += `,"${prop.name}","${prop.molPercent || ''}","${prop.referencia || ''}",\n`;
      });
      csvContent += ',,,,\n';

      // Seção 7: Observações (apenas coluna C)
      csvContent += '7. OBSERVAÇÕES,,,,\n';
      csvContent += `,Observações do Boletim,"${reportData.observacoesBoletim || ''}",Observações e comentários sobre o boletim analítico,\n`;
      csvContent += `,Número Único Rastreabilidade,"${reportData.numeroUnicoRastreabilidade || ''}",Código único de rastreabilidade,\n`;
      csvContent += `,Número do Boletim,"${reportData.numeroBoletim || ''}",Número de identificação do boletim,\n`;
      csvContent += `,Plataforma/Instalação,"${reportData.plataforma || ''}",Nome da plataforma ou instalação,\n`;
      csvContent += `,Sistema de Medição,"${reportData.sistemaMedicao || ''}",Descrição do sistema de medição,\n`;

      const fileName = `Dados_Validacao_Cromatografia_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, fileName);
      
      onNotification('success', 'Dados Exportados', `Arquivo "${fileName}" com dados atuais foi gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar dados para CSV:', error);
      onNotification('error', 'Erro', `Erro ao exportar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [reportData, downloadCSV, onNotification]);

  // Função para processar dados CSV simples
  const processSimpleCSVData = useCallback((csvText: string, fileName: string) => {
    const lines = csvText.split('\n');
    const importedData: Partial<ReportData> = {
      components: [...INITIAL_COMPONENTS],
      standardProperties: [...INITIAL_STANDARD_PROPERTIES],
      samplingConditionsProperties: [...INITIAL_SAMPLING_CONDITION_PROPERTIES],
      airContaminationProperties: [...INITIAL_AIR_CONTAMINATION_PROPERTIES]
    };

    // Helper functions to ensure objects exist
    const ensureSampleInfo = () => {
      if (!importedData.sampleInfo) {
        importedData.sampleInfo = {
          numeroAmostra: '', dataHoraColeta: '', localColeta: '', pontoColetaTAG: '',
          pocoApropriacao: '', numeroCilindroAmostra: '', responsavelAmostragem: '',
          pressaoAmostraAbsolutaKpaA: '', pressaoAmostraManometricaKpa: '',
          temperaturaAmostraK: '', temperaturaAmostraC: ''
        };
      }
      return importedData.sampleInfo;
    };

    const ensureBulletinInfo = () => {
      if (!importedData.bulletinInfo) {
        importedData.bulletinInfo = {
          dataRecebimentoAmostra: '', dataAnaliseLaboratorial: '', dataEmissaoBoletim: '',
          dataRecebimentoBoletimSolicitante: '', laboratorioEmissor: '',
          equipamentoCromatografoUtilizado: '', metodoNormativo: '', tipoProcesso: ProcessType.ProcessoNormal
        };
      }
      return importedData.bulletinInfo;
    };
    
    // Processar linhas do CSV simples (formato: CAMPO,VALOR,OBSERVACAO)
    console.log('🔍 DEBUG: Processando', lines.length, 'linhas do CSV simples');
    
    lines.forEach((line) => {
      const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
      if (columns.length >= 2 && columns[0] && columns[1]) {
        const campo = columns[0];
        const valor = columns[1];
        
        // Pular cabeçalho e linhas de seção
        if (campo === 'CAMPO' || campo.startsWith('SECAO_') || !valor || valor === 'VALOR') {
          return;
        }
        
        // Debug apenas para campos com dados
        if (valor && valor.length > 0 && !campo.startsWith('SECAO_')) {
          console.log(`Importando: ${campo} = "${valor}"`);
        }
        
        // Mapear campos para dados - versão simplificada
        switch (campo) {
          case 'Nome do Cliente/Solicitante':
            console.log(`✅ DEBUG: Atribuindo nome cliente: "${valor}"`);
            if (!importedData.solicitantInfo) {
              importedData.solicitantInfo = {
                nomeClienteSolicitante: '',
                enderecoLocalizacaoClienteSolicitante: '',
                contatoResponsavelSolicitacao: ''
              };
            }
            importedData.solicitantInfo.nomeClienteSolicitante = valor;
            console.log(`🔍 DEBUG: solicitantInfo após:`, importedData.solicitantInfo);
            break;
          case 'Endereco/Localizacao':
            if (!importedData.solicitantInfo) {
              importedData.solicitantInfo = {
                nomeClienteSolicitante: '',
                enderecoLocalizacaoClienteSolicitante: '',
                contatoResponsavelSolicitacao: ''
              };
            }
            importedData.solicitantInfo.enderecoLocalizacaoClienteSolicitante = valor;
            break;
          case 'Contato Responsavel':
            if (!importedData.solicitantInfo) {
              importedData.solicitantInfo = {
                nomeClienteSolicitante: '',
                enderecoLocalizacaoClienteSolicitante: '',
                contatoResponsavelSolicitacao: ''
              };
            }
            importedData.solicitantInfo.contatoResponsavelSolicitacao = valor;
            break;
                     case 'Numero da Amostra':
             ensureSampleInfo().numeroAmostra = valor;
             break;
           case 'Data/Hora da Coleta':
             ensureSampleInfo().dataHoraColeta = convertDateTimeFormat(valor);
             break;
           case 'Local da Coleta':
             ensureSampleInfo().localColeta = valor;
             break;
           case 'Ponto de Coleta (TAG)':
             ensureSampleInfo().pontoColetaTAG = valor;
             break;
           case 'Poco de Apropriacao':
             ensureSampleInfo().pocoApropriacao = valor;
             break;
           case 'Numero do Cilindro':
             ensureSampleInfo().numeroCilindroAmostra = valor;
             break;
           case 'Responsavel pela Amostragem':
             ensureSampleInfo().responsavelAmostragem = valor;
             break;
           case 'Pressao Absoluta (kPa.A)':
             ensureSampleInfo().pressaoAmostraAbsolutaKpaA = valor;
             break;
           case 'Pressao Manometrica (kPa)':
             ensureSampleInfo().pressaoAmostraManometricaKpa = valor;
             break;
           case 'Temperatura (K)':
             ensureSampleInfo().temperaturaAmostraK = valor;
             break;
           case 'Temperatura (C)':
             ensureSampleInfo().temperaturaAmostraC = valor;
            break;
                     case 'Data Recebimento Amostra':
             ensureBulletinInfo().dataRecebimentoAmostra = convertDateFormat(valor);
             break;
           case 'Data Analise Laboratorial':
             ensureBulletinInfo().dataAnaliseLaboratorial = convertDateFormat(valor);
             break;
           case 'Data Emissao Boletim':
             ensureBulletinInfo().dataEmissaoBoletim = convertDateFormat(valor);
             break;
           case 'Data Recebimento Solicitante':
             ensureBulletinInfo().dataRecebimentoBoletimSolicitante = convertDateFormat(valor);
             break;
           case 'Laboratorio Emissor':
             ensureBulletinInfo().laboratorioEmissor = valor;
             break;
           case 'Equipamento Utilizado':
             ensureBulletinInfo().equipamentoCromatografoUtilizado = valor;
             break;
           case 'Metodo Normativo':
             ensureBulletinInfo().metodoNormativo = valor;
             break;
           case 'Tipo de Processo':
             ensureBulletinInfo().tipoProcesso = valor === 'ProcessoSemValidacao' 
               ? ProcessType.ProcessoSemValidacao 
               : ProcessType.ProcessoNormal;
            break;
          case 'Observacoes do Boletim':
            importedData.observacoesBoletim = valor;
            break;
          case 'Numero Unico Rastreabilidade':
            importedData.numeroUnicoRastreabilidade = valor;
            break;
          case 'Numero do Boletim':
            importedData.numeroBoletim = valor;
            break;
          case 'Plataforma/Instalacao':
            importedData.plataforma = valor;
            break;
          case 'Sistema de Medicao':
            importedData.sistemaMedicao = valor;
            break;
          default:
            // Verificar componentes com nomes simplificados
            const componentesMap = {
              'Metano_C1': 'Metano (C₁)',
              'Etano_C2': 'Etano (C₂)',
              'Propano_C3': 'Propano (C₃)',
              'i-Butano_iC4': 'i-Butano (iC₄)',
              'n-Butano_nC4': 'n-Butano (nC₄)',
              'i-Pentano_iC5': 'i-Pentano (iC₅)',
              'n-Pentano_nC5': 'n-Pentano (nC₅)',
              'Hexano_C6': 'Hexano (C₆)',
              'Heptano_C7': 'Heptano (C₇)',
              'Octano_C8': 'Octano (C₈)',
              'Nonano_C9': 'Nonano (C₉)',
              'Decano_C10': 'Decano (C₁₀)',
              'Dioxido_de_Carbono_CO2': 'Dióxido de Carbono (CO₂)',
              'Nitrogenio_N2': 'Nitrogênio (N₂)',
              'Hidrogenio_H2': 'Hidrogênio (H₂)',
              'Oxigenio_O2': 'Oxigênio (O₂)',
              'Argonio_Ar': 'Argônio (Ar)',
              'Helio_He': 'Hélio (He)',
              'Monoxido_de_Carbono_CO': 'Monóxido de Carbono (CO)',
              'Agua_H2O': 'Água (H₂O)',
              'Sulfeto_de_Hidrogenio_H2S': 'Sulfeto de Hidrogênio (H₂S)'
            };

            const nomeComponenteReal = componentesMap[campo as keyof typeof componentesMap];
            if (nomeComponenteReal && importedData.components) {
              const compIndex = importedData.components.findIndex(c => c.name === nomeComponenteReal);
              if (compIndex >= 0) {
                importedData.components[compIndex].molarPercent = valor;
              }
            }

            // Verificar incerteza de componentes
            if (campo.endsWith('_Incerteza')) {
              const nomeBase = campo.replace('_Incerteza', '');
              const nomeComponenteReal = componentesMap[nomeBase as keyof typeof componentesMap];
              if (nomeComponenteReal && importedData.components) {
                const compIndex = importedData.components.findIndex(c => c.name === nomeComponenteReal);
                if (compIndex >= 0) {
                  importedData.components[compIndex].incertezaAssociadaPercent = valor;
                }
              }
            }

            // Verificar propriedades padrão
            const propriedadesMap = {
              'Densidade_relativa': 'Densidade relativa',
              'Massa_molar_real': 'Massa molar real',
              'Densidade_real': 'Densidade real',
              'Poder_calorifico_superior': 'Poder calorífico superior (MJ/m³)',
              'Poder_calorifico_inferior': 'Poder calorífico inferior (MJ/m³)',
              'Indice_de_Wobbe': 'Índice de Wobbe (MJ/m³)',
              'Numero_de_metano': 'Número de metano',
              'Fator_de_compressibilidade': 'Fator de compressibilidade'
            };

            const nomePropriedadeReal = propriedadesMap[campo as keyof typeof propriedadesMap];
            if (nomePropriedadeReal && importedData.standardProperties) {
              const propIndex = importedData.standardProperties.findIndex(p => p.name === nomePropriedadeReal);
              if (propIndex >= 0) {
                importedData.standardProperties[propIndex].value = valor;
              }
            }

            // Verificar referência de propriedades padrão
            if (campo.endsWith('_Referencia')) {
              const nomeBase = campo.replace('_Referencia', '');
              const nomePropriedadeReal = propriedadesMap[nomeBase as keyof typeof propriedadesMap];
              if (nomePropriedadeReal && importedData.standardProperties) {
                const propIndex = importedData.standardProperties.findIndex(p => p.name === nomePropriedadeReal);
                if (propIndex >= 0) {
                  importedData.standardProperties[propIndex].referencia = valor;
                }
              }
            }

            // Verificar propriedades de amostragem e suas referências
            const propriedadesAmostragemMap = {
              'Densidade_relativa_nas_condicoes_de_amostragem': 'Densidade relativa nas condições de amostragem',
              'Poder_calorifico_superior_nas_condicoes_de_amostragem': 'Poder calorífico superior nas condições de amostragem',
              'Poder_calorifico_inferior_nas_condicoes_de_amostragem': 'Poder calorífico inferior nas condições de amostragem',
              'Fator_de_compressibilidade_nas_condicoes_de_amostragem': 'Fator de compressibilidade nas condições de amostragem',
              'Indice_de_Wobbe_nas_condicoes_de_amostragem': 'Índice de Wobbe nas condições de amostragem'
            };

            const nomeAmostragemReal = propriedadesAmostragemMap[campo as keyof typeof propriedadesAmostragemMap];
            if (nomeAmostragemReal && importedData.samplingConditionsProperties) {
              const propIndex = importedData.samplingConditionsProperties.findIndex(p => p.name === nomeAmostragemReal);
              if (propIndex >= 0) {
                importedData.samplingConditionsProperties[propIndex].value = valor;
              }
            }

            // Verificar referência de propriedades de amostragem
            if (campo.endsWith('_Referencia')) {
              const nomeBase = campo.replace('_Referencia', '');
              const nomeAmostragemReal = propriedadesAmostragemMap[nomeBase as keyof typeof propriedadesAmostragemMap];
              if (nomeAmostragemReal && importedData.samplingConditionsProperties) {
                const propIndex = importedData.samplingConditionsProperties.findIndex(p => p.name === nomeAmostragemReal);
                if (propIndex >= 0) {
                  importedData.samplingConditionsProperties[propIndex].referencia = valor;
                }
              }
            }

            // Verificar contaminação por ar e suas referências
            const contaminacaoArMap = {
              'Nitrogenio_N2': 'Nitrogênio (N₂)',
              'Oxigenio_O2': 'Oxigênio (O₂)',
              'Argonio_Ar': 'Argônio (Ar)'
            };

            const nomeArReal = contaminacaoArMap[campo as keyof typeof contaminacaoArMap];
            if (nomeArReal && importedData.airContaminationProperties) {
              const propIndex = importedData.airContaminationProperties.findIndex(p => p.name === nomeArReal);
              if (propIndex >= 0) {
                importedData.airContaminationProperties[propIndex].molPercent = valor;
              }
            }

            // Verificar referência de contaminação por ar
            if (campo.endsWith('_Referencia')) {
              const nomeBase = campo.replace('_Referencia', '');
              const nomeArReal = contaminacaoArMap[nomeBase as keyof typeof contaminacaoArMap];
              if (nomeArReal && importedData.airContaminationProperties) {
                const propIndex = importedData.airContaminationProperties.findIndex(p => p.name === nomeArReal);
                if (propIndex >= 0) {
                  importedData.airContaminationProperties[propIndex].referencia = valor;
                }
              }
            }
            break;
        }
      }
    });

    // Debug resumido dos dados importados
    console.log('✅ Importação CSV Simples concluída');
    console.log('📊 DEBUG: Dados finais para importar:', {
      solicitantInfo: importedData.solicitantInfo,
      sampleInfo: importedData.sampleInfo,
      bulletinInfo: importedData.bulletinInfo,
      components: importedData.components?.filter(c => c.molarPercent).length || 0,
      standardProperties: importedData.standardProperties?.filter(p => p.value).length || 0
    });
    
    console.log('🔄 DEBUG: Chamando onDataImport...');
    onDataImport(importedData);
    console.log('✅ DEBUG: onDataImport chamado');
    
    onNotification('success', 'Importação Simples Concluída', 
      `Dados importados com sucesso do arquivo "${fileName}" usando formato simples!`);
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onDataImport, onNotification, convertDateFormat, convertDateTimeFormat]);

  // Importar dados de arquivo CSV/Excel
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const reader = new FileReader();
    
    // Processar arquivo Excel (temporariamente desabilitado)
    if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      onNotification('warning', 'Formato Excel Temporariamente Indisponível', 
        'Processamento de arquivos Excel está temporariamente desabilitado. Por favor, salve o arquivo como CSV e tente novamente.');
      return;
    } else {
      // Processar arquivo CSV/TXT
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          // Detectar formato: simples (CAMPO,VALOR) ou complexo (A,B,C,D,E)
          const firstLine = csvText.split('\n')[0];
          console.log('🔍 DEBUG: Primeira linha do CSV:', firstLine);
          console.log('🔍 DEBUG: Contém CAMPO,VALOR,OBSERVACAO?', firstLine.includes('CAMPO,VALOR,OBSERVACAO'));
          
          if (firstLine.includes('CAMPO,VALOR,OBSERVACAO')) {
            console.log('✅ Usando processamento SIMPLES');
            processSimpleCSVData(csvText, file.name);
          } else {
            console.log('✅ Usando processamento COMPLEXO');
            processCSVData(csvText, file.name);
          }
        } catch (error) {
          console.error('Erro ao processar arquivo CSV:', error);
          onNotification('error', 'Erro de Processamento', 
            `Erro ao processar arquivo CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
  }, [onDataImport, onNotification]);

  // Função para processar dados CSV
  const processCSVData = useCallback((csvText: string, fileName: string) => {
    const lines = csvText.split('\n');
    const importedData: Partial<ReportData> = {
      // Inicializar arrays com dados padrão para garantir merge correto
      components: [...INITIAL_COMPONENTS],
      standardProperties: [...INITIAL_STANDARD_PROPERTIES],
      samplingConditionsProperties: [...INITIAL_SAMPLING_CONDITION_PROPERTIES],
      airContaminationProperties: [...INITIAL_AIR_CONTAMINATION_PROPERTIES]
    };
    
    // Processar linhas do CSV (formato Excel com colunas A,B,C,D,E)
    lines.forEach((line) => {
      const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
      if (columns.length >= 3 && columns[1] && columns[2]) {
        const campo = columns[1];
        const valorC = columns[2]; // Coluna C
        const valorD = columns.length > 3 ? columns[3] : ''; // Coluna D (quando disponível)
        
        // Debug apenas para campos com dados
        if (valorC && valorC.length > 0) {
          console.log(`Importando: ${campo} = "${valorC}"`);
        }
        
        // Mapear campos para dados
        switch (campo) {
          case 'Nome do Cliente/Solicitante':
            importedData.solicitantInfo = {
              ...importedData.solicitantInfo,
              nomeClienteSolicitante: valorC
            } as any;
            break;
          case 'Endereço/Localização':
            if (!importedData.solicitantInfo) {
              importedData.solicitantInfo = {
                nomeClienteSolicitante: '',
                enderecoLocalizacaoClienteSolicitante: '',
                contatoResponsavelSolicitacao: ''
              };
            }
            importedData.solicitantInfo.enderecoLocalizacaoClienteSolicitante = valorC;
            break;
          case 'Contato Responsável':
            if (!importedData.solicitantInfo) {
              importedData.solicitantInfo = {
                nomeClienteSolicitante: '',
                enderecoLocalizacaoClienteSolicitante: '',
                contatoResponsavelSolicitacao: ''
              };
            }
            importedData.solicitantInfo.contatoResponsavelSolicitacao = valorC;
            break;
          case 'Número da Amostra':
            if (!importedData.sampleInfo) {
              importedData.sampleInfo = {
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
                temperaturaAmostraC: ''
              };
            }
            importedData.sampleInfo.numeroAmostra = valorC;
            break;
          case 'Data/Hora da Coleta':
            if (!importedData.sampleInfo) {
              importedData.sampleInfo = {
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
                temperaturaAmostraC: ''
              };
            }
            importedData.sampleInfo.dataHoraColeta = convertDateTimeFormat(valorC);
            break;
          case 'Local da Coleta':
            if (!importedData.sampleInfo) importedData.sampleInfo = {} as any;
            importedData.sampleInfo!.localColeta = valorC;
            break;
          case 'Ponto de Coleta (TAG)':
            if (!importedData.sampleInfo) importedData.sampleInfo = {} as any;
            importedData.sampleInfo!.pontoColetaTAG = valorC;
            break;
          case 'Poço de Apropriação':
            if (!importedData.sampleInfo) importedData.sampleInfo = {} as any;
            importedData.sampleInfo!.pocoApropriacao = valorC;
            break;
          case 'Número do Cilindro':
            if (!importedData.sampleInfo) importedData.sampleInfo = {} as any;
            importedData.sampleInfo!.numeroCilindroAmostra = valorC;
            break;
          case 'Responsável pela Amostragem':
            if (!importedData.sampleInfo) importedData.sampleInfo = {} as any;
            importedData.sampleInfo!.responsavelAmostragem = valorC;
            break;
          case 'Pressão Absoluta (kPa.A)':
            if (!importedData.sampleInfo) importedData.sampleInfo = {} as any;
            importedData.sampleInfo!.pressaoAmostraAbsolutaKpaA = valorC;
            break;
          case 'Pressão Manométrica (kPa)':
            if (!importedData.sampleInfo) importedData.sampleInfo = {} as any;
            importedData.sampleInfo!.pressaoAmostraManometricaKpa = valorC;
            break;
          case 'Temperatura (K)':
            if (!importedData.sampleInfo) importedData.sampleInfo = {} as any;
            importedData.sampleInfo!.temperaturaAmostraK = valorC;
            break;
          case 'Temperatura (°C)':
            if (!importedData.sampleInfo) importedData.sampleInfo = {} as any;
            importedData.sampleInfo!.temperaturaAmostraC = valorC;
            break;
          case 'Data Recebimento Amostra':
            if (!importedData.bulletinInfo) importedData.bulletinInfo = {} as any;
            importedData.bulletinInfo!.dataRecebimentoAmostra = convertDateFormat(valorC);
            break;
          case 'Data Análise Laboratorial':
            if (!importedData.bulletinInfo) importedData.bulletinInfo = {} as any;
            importedData.bulletinInfo!.dataAnaliseLaboratorial = convertDateFormat(valorC);
            break;
          case 'Data Emissão Boletim':
            if (!importedData.bulletinInfo) importedData.bulletinInfo = {} as any;
            importedData.bulletinInfo!.dataEmissaoBoletim = convertDateFormat(valorC);
            break;
          case 'Data Recebimento Solicitante':
            if (!importedData.bulletinInfo) importedData.bulletinInfo = {} as any;
            importedData.bulletinInfo!.dataRecebimentoBoletimSolicitante = convertDateFormat(valorC);
            break;
          case 'Laboratório Emissor':
            if (!importedData.bulletinInfo) importedData.bulletinInfo = {} as any;
            importedData.bulletinInfo!.laboratorioEmissor = valorC;
            break;
          case 'Equipamento Utilizado':
            if (!importedData.bulletinInfo) importedData.bulletinInfo = {} as any;
            importedData.bulletinInfo!.equipamentoCromatografoUtilizado = valorC;
            break;
          case 'Método Normativo':
            if (!importedData.bulletinInfo) importedData.bulletinInfo = {} as any;
            importedData.bulletinInfo!.metodoNormativo = valorC;
            break;
          case 'Tipo de Processo':
            if (!importedData.bulletinInfo) importedData.bulletinInfo = {} as any;
            importedData.bulletinInfo!.tipoProcesso = valorC === 'ProcessoSemValidacao' 
              ? ProcessType.ProcessoSemValidacao 
              : ProcessType.ProcessoNormal;
            break;
          case 'Observações do Boletim':
            importedData.observacoesBoletim = valorC;
            break;
          case 'Número Único Rastreabilidade':
            importedData.numeroUnicoRastreabilidade = valorC;
            break;
          case 'Número do Boletim':
            importedData.numeroBoletim = valorC;
            break;
          case 'Plataforma/Instalação':
            importedData.plataforma = valorC;
            break;
          case 'Sistema de Medição':
            importedData.sistemaMedicao = valorC;
            break;
          default:
            // Verificar se é um componente da seção 5-8 (que usa colunas C e D)
            const componentesAGA8 = INITIAL_COMPONENTS.map(c => c.name);
            const propriedadesPadrao = INITIAL_STANDARD_PROPERTIES.map(p => p.name);
            const propriedadesAmostragem = INITIAL_SAMPLING_CONDITION_PROPERTIES.map(p => p.name);
            const propriedadesAr = INITIAL_AIR_CONTAMINATION_PROPERTIES.map(p => p.name);

            if (componentesAGA8.includes(campo)) {
              // Seção 5: Composição Molar (C=molarPercent, D=incerteza)
              const compIndex = importedData.components!.findIndex(c => c.name === campo);
              if (compIndex >= 0) {
                importedData.components![compIndex].molarPercent = valorC;
                importedData.components![compIndex].incertezaAssociadaPercent = valorD;
              }
            } else if (propriedadesPadrao.includes(campo)) {
              // Seção 6: Propriedades Padrão (C=value, D=referencia)
              const propIndex = importedData.standardProperties!.findIndex(p => p.name === campo);
              if (propIndex >= 0) {
                importedData.standardProperties![propIndex].value = valorC;
                importedData.standardProperties![propIndex].referencia = valorD;
              }
            } else if (propriedadesAmostragem.includes(campo)) {
              // Seção 7: Condições de Amostragem (C=value, D=referencia)
              const propIndex = importedData.samplingConditionsProperties!.findIndex(p => p.name === campo);
              if (propIndex >= 0) {
                importedData.samplingConditionsProperties![propIndex].value = valorC;
                importedData.samplingConditionsProperties![propIndex].referencia = valorD;
              }
            } else if (propriedadesAr.includes(campo)) {
              // Seção 8: Contaminação por Ar (C=molPercent, D=referencia)
              const propIndex = importedData.airContaminationProperties!.findIndex(p => p.name === campo);
              if (propIndex >= 0) {
                importedData.airContaminationProperties![propIndex].molPercent = valorC;
                importedData.airContaminationProperties![propIndex].referencia = valorD;
              }
            }
            break;
        }
      }
    });

    // Debug resumido dos dados importados
    console.log('✅ Importação CSV concluída');
    
    // Contar quantos campos foram preenchidos
    let fieldsImported = 0;
    if (importedData.components) {
      fieldsImported += importedData.components.filter(c => c.molarPercent).length;
    }
    if (importedData.standardProperties) {
      fieldsImported += importedData.standardProperties.filter(p => p.value).length;
    }
    if (importedData.samplingConditionsProperties) {
      fieldsImported += importedData.samplingConditionsProperties.filter(p => p.value).length;
    }
    if (importedData.airContaminationProperties) {
      fieldsImported += importedData.airContaminationProperties.filter(p => p.molPercent).length;
    }
    
    onDataImport(importedData);
    onNotification('success', 'Importação Concluída', 
      `Dados importados com sucesso do arquivo "${fileName}"! ${fieldsImported} campos foram preenchidos.`);
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onDataImport, onNotification]);

  return (
    <div className="mb-6 bg-white rounded-lg border shadow-md">
      {/* Header recolhível */}
      <div 
        className="flex justify-between items-center p-4 border-b border-gray-200 transition-colors cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-semibold text-gray-800">
            Gerenciador de Templates CSV/Excel
          </h3>
          <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
            Opcional
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {isExpanded ? 'Clique para recolher' : 'Clique para expandir'}
          </span>
          <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Conteúdo expansível */}
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-full opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Gerar Template Simples (NOVO) */}
            <div className="p-4 text-center bg-yellow-50 rounded-lg border-2 border-yellow-300 border-dashed transition-colors hover:border-yellow-500">
              <div className="mb-2 text-4xl">⭐</div>
              <h4 className="mb-2 font-medium text-gray-800">Template Simples</h4>
              <p className="mb-3 text-sm text-gray-600">
                Formato SUPER FÁCIL: apenas CAMPO e VALOR
              </p>
              <button
                onClick={generateSimpleCSVTemplate}
                className="px-4 py-2 w-full text-white bg-yellow-600 rounded-md transition-colors hover:bg-yellow-700"
              >
                📋 Gerar Simples
              </button>
            </div>

            {/* Gerar Template Vazio */}
            <div className="p-4 text-center rounded-lg border-2 border-gray-300 border-dashed transition-colors hover:border-green-400">
              <div className="mb-2 text-4xl">📋</div>
              <h4 className="mb-2 font-medium text-gray-800">Template Completo</h4>
              <p className="mb-3 text-sm text-gray-600">
                Formato avançado com múltiplas colunas
              </p>
              <button
                onClick={generateCSVTemplate}
                className="px-4 py-2 w-full text-white bg-green-600 rounded-md transition-colors hover:bg-green-700"
              >
                Gerar Completo
              </button>
            </div>

            {/* Exportar Dados Atuais */}
            <div className="p-4 text-center rounded-lg border-2 border-gray-300 border-dashed transition-colors hover:border-blue-400">
              <div className="mb-2 text-4xl">💾</div>
              <h4 className="mb-2 font-medium text-gray-800">Exportar Dados</h4>
              <p className="mb-3 text-sm text-gray-600">
                Exporta os dados atuais do formulário para CSV
              </p>
              <button
                onClick={exportCurrentDataToCSV}
                className="px-4 py-2 w-full text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
              >
                Exportar CSV
              </button>
            </div>

            {/* Importar Arquivo */}
            <div className="p-4 text-center rounded-lg border-2 border-gray-300 border-dashed transition-colors hover:border-purple-400">
              <div className="mb-2 text-4xl">📤</div>
              <h4 className="mb-2 font-medium text-gray-800">Importar Arquivo</h4>
              <p className="mb-3 text-sm text-gray-600">
                Importa dados de arquivo CSV, XLS ou XLSX preenchido
              </p>
              <label className="inline-block px-4 py-2 w-full text-white bg-purple-600 rounded-md transition-colors cursor-pointer hover:bg-purple-700">
                Selecionar Arquivo
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Informações sobre o formato */}
          <div className="p-4 mt-6 bg-gray-50 rounded-lg">
            <h4 className="mb-2 font-medium text-gray-800">📝 Informações sobre Templates (CSV/Excel)</h4>
            
            {/* Template Simples - RECOMENDADO */}
            <div className="p-3 mb-4 bg-yellow-100 rounded border-l-4 border-yellow-500">
              <h5 className="font-semibold text-yellow-800">⭐ Template Simples (RECOMENDADO)</h5>
              <div className="mt-2 text-sm text-yellow-700">
                <p><strong>Formato:</strong> Apenas 2 colunas - CAMPO e VALOR</p>
                <p><strong>Como usar:</strong></p>
                <ol className="ml-4 list-decimal">
                  <li>Clique em "📋 Gerar Simples"</li>
                  <li>Abra o arquivo no Excel</li>
                  <li>Preencha apenas a coluna B (VALOR)</li>
                  <li>Salve e importe de volta</li>
                </ol>
                <p className="mt-2 font-medium">✅ Muito mais fácil de preencher!</p>
              </div>
            </div>

            {/* Template Completo */}
            <div className="p-3 mb-4 bg-blue-100 rounded border-l-4 border-blue-500">
              <h5 className="font-semibold text-blue-800">📋 Template Completo (Avançado)</h5>
              <div className="mt-2 text-sm text-blue-700">
                <p><strong>Formato:</strong> 5 colunas (A,B,C,D,E) com seções estruturadas</p>
                <p><strong>Seções incluídas:</strong></p>
                <ul className="ml-4 space-y-1 list-disc list-inside">
                  <li><strong>Seção 2-4:</strong> Informações gerais (apenas coluna C)</li>
                  <li><strong>Seção 5-8:</strong> Dados técnicos (colunas C e D)</li>
                  <li><strong>Seção 7:</strong> Observações (apenas coluna C)</li>
                </ul>
              </div>
            </div>

            {/* Informações gerais */}
            <div className="space-y-1 text-sm text-gray-600">
              <p className="p-2 mt-2 text-green-700 bg-green-50 rounded">
                <strong>Formatos suportados:</strong> CSV (.csv), Excel 97-2003 (.xls) e Excel moderno (.xlsx)
              </p>
              <p className="p-2 mt-2 text-orange-700 bg-orange-50 rounded">
                <strong>Dica:</strong> Use o Template Simples para facilitar o preenchimento. O formato completo é apenas para casos especiais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelTemplateManager; 