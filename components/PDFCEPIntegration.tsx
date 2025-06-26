/**
 * Extensão de Integração CEP para PDF
 * Adiciona seção CEP ao relatório PDF gerado
 */

import { ValidationStatus } from '../types';

interface CEPHistoricalSample {
  id: string;
  boletimNumber: string;
  date: string;
  components: Record<string, number>;
  properties: Record<string, number>;
}

interface CEPValidationResult {
  componentName: string;
  currentValue: number;
  statistics: {
    mean: number;
    lowerControlLimit: number;
    upperControlLimit: number;
    sampleCount: number;
  };
  status: ValidationStatus;
}

const CEP_STORAGE_KEY = 'cep_historical_samples';

export const generateCEPSection = (): string => {
  try {
    // Carregar dados históricos do localStorage
    const historicalDataStr = localStorage.getItem(CEP_STORAGE_KEY);
    const historicalData: CEPHistoricalSample[] = historicalDataStr ? JSON.parse(historicalDataStr) : [];

    if (historicalData.length === 0) {
      return `
        <div style="margin-bottom: 25px;">
          <h3 style="background: #7c3aed; color: white; padding: 8px 12px; margin: 0 0 15px 0; border-radius: 4px; font-size: 14px;">
            📊 CONTROLE ESTATÍSTICO DE PROCESSO (CEP)
          </h3>
          <div style="padding: 15px; border: 2px solid #f59e0b; border-radius: 8px; background: #fffbeb;">
            <p style="margin: 0; font-weight: bold; color: #f59e0b; text-align: center;">
              ⚠️ Nenhum histórico CEP disponível para análise
            </p>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #92400e; text-align: center;">
              Execute validações CEP para gerar dados históricos e limites de controle
            </p>
          </div>
        </div>
      `;
    }

    // Calcular estatísticas CEP para componentes principais
    const mainComponents = [
      'Metano (C₁)', 'Etano (C₂)', 'Propano (C₃)', 'i-Butano (iC₄)', 'n-Butano (nC₄)',
      'Dióxido de Carbono (CO₂)', 'Nitrogênio (N₂)'
    ];

    const mainProperties = ['compressibilityFactor', 'specificMass', 'molarMass'];

    const cepResults: CEPValidationResult[] = [];

    // Calcular para componentes
    mainComponents.forEach(componentName => {
      const values = historicalData
        .map(sample => sample.components[componentName])
        .filter(val => val !== undefined && val > 0)
        .slice(0, 8);

      if (values.length >= 2) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        const mobileRanges: number[] = [];
        for (let i = 1; i < values.length; i++) {
          mobileRanges.push(Math.abs(values[i] - values[i - 1]));
        }

        const mobileRangeMean = mobileRanges.length > 0 
          ? mobileRanges.reduce((sum, range) => sum + range, 0) / mobileRanges.length 
          : 0;

        const controlFactor = 3 * (mobileRangeMean / 1.128);
        const upperControlLimit = mean + controlFactor;
        const lowerControlLimit = Math.max(0, mean - controlFactor);

        const currentValue = values[0]; // Valor mais recente
        const withinLimits = currentValue >= lowerControlLimit && currentValue <= upperControlLimit;

        cepResults.push({
          componentName,
          currentValue,
          statistics: {
            mean,
            lowerControlLimit,
            upperControlLimit,
            sampleCount: values.length
          },
          status: withinLimits ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa
        });
      }
    });

    // Calcular para propriedades
    mainProperties.forEach(propertyId => {
      const values = historicalData
        .map(sample => sample.properties[propertyId])
        .filter(val => val !== undefined && val > 0)
        .slice(0, 8);

      if (values.length >= 2) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        const mobileRanges: number[] = [];
        for (let i = 1; i < values.length; i++) {
          mobileRanges.push(Math.abs(values[i] - values[i - 1]));
        }

        const mobileRangeMean = mobileRanges.length > 0 
          ? mobileRanges.reduce((sum, range) => sum + range, 0) / mobileRanges.length 
          : 0;

        const controlFactor = 3 * (mobileRangeMean / 1.128);
        const upperControlLimit = mean + controlFactor;
        const lowerControlLimit = Math.max(0, mean - controlFactor);

        const currentValue = values[0]; // Valor mais recente
        const withinLimits = currentValue >= lowerControlLimit && currentValue <= upperControlLimit;

        const propertyName = propertyId === 'compressibilityFactor' ? 'Fator de Compressibilidade' :
                             propertyId === 'specificMass' ? 'Massa Específica' :
                             propertyId === 'molarMass' ? 'Massa Molar' : propertyId;

        cepResults.push({
          componentName: propertyName,
          currentValue,
          statistics: {
            mean,
            lowerControlLimit,
            upperControlLimit,
            sampleCount: values.length
          },
          status: withinLimits ? ValidationStatus.OK : ValidationStatus.ForaDaFaixa
        });
      }
    });

    const okCount = cepResults.filter(r => r.status === ValidationStatus.OK).length;
    const outOfLimitsCount = cepResults.filter(r => r.status === ValidationStatus.ForaDaFaixa).length;
    const overallStatus = outOfLimitsCount > 0 ? ValidationStatus.ForaDaFaixa : ValidationStatus.OK;

    return `
      <div style="margin-bottom: 25px;">
        <h3 style="background: #7c3aed; color: white; padding: 8px 12px; margin: 0 0 15px 0; border-radius: 4px; font-size: 14px;">
          📊 CONTROLE ESTATÍSTICO DE PROCESSO (CEP)
        </h3>
        
        <!-- Resumo CEP -->
        <div style="padding: 15px; border: 2px solid ${overallStatus === ValidationStatus.OK ? '#059669' : '#dc2626'}; border-radius: 8px; background: ${overallStatus === ValidationStatus.OK ? '#f0fdf4' : '#fef2f2'}; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0; color: ${overallStatus === ValidationStatus.OK ? '#059669' : '#dc2626'}; font-size: 14px;">
              Status Geral CEP: ${overallStatus === ValidationStatus.OK ? '✅ DENTRO DOS LIMITES' : '❌ FORA DOS LIMITES'}
            </h4>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; font-size: 11px;">
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #1e40af;">${historicalData.length}</div>
              <div style="color: #64748b;">Amostras Históricas</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #059669;">${okCount}</div>
              <div style="color: #64748b;">Dentro dos Limites</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #dc2626;">${outOfLimitsCount}</div>
              <div style="color: #64748b;">Fora dos Limites</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #7c3aed;">${cepResults.length}</div>
              <div style="color: #64748b;">Total Validados</div>
            </div>
          </div>
        </div>

        <!-- Tabela de Resultados CEP -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 11px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Parâmetro</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Valor Atual</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Média (x̄)</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">LCI</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">LCS</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Amostras</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Status CEP</th>
            </tr>
          </thead>
          <tbody>
            ${cepResults.map(result => `
              <tr style="background: ${result.status === ValidationStatus.ForaDaFaixa ? '#fef2f2' : 'white'};">
                <td style="border: 1px solid #ddd; padding: 8px; font-weight: ${result.status === ValidationStatus.ForaDaFaixa ? 'bold' : 'normal'};">${result.componentName}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-family: monospace; color: ${result.status === ValidationStatus.ForaDaFaixa ? '#dc2626' : '#374151'};">${result.currentValue.toFixed(4)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-family: monospace;">${result.statistics.mean.toFixed(4)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-family: monospace; color: #059669;">${result.statistics.lowerControlLimit.toFixed(4)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-family: monospace; color: #dc2626;">${result.statistics.upperControlLimit.toFixed(4)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${result.statistics.sampleCount}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; color: ${
                  result.status === ValidationStatus.OK ? '#059669' : '#dc2626'
                };">
                  ${result.status === ValidationStatus.OK ? '✅ OK' : '❌ Fora dos Limites'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Metodologia CEP -->
        <div style="margin-top: 15px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;">
          <h5 style="margin: 0 0 8px 0; color: #475569; font-size: 12px; font-weight: bold;">📚 Metodologia CEP Aplicada:</h5>
          <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 10px; line-height: 1.4;">
            <li><strong>Amplitude móvel:</strong> MRi = |xi - xi-1|</li>
            <li><strong>Limites de controle:</strong> LCS = x̄ + 3(MR̄/1.128), LCI = x̄ - 3(MR̄/1.128)</li>
            <li><strong>Fator d₂:</strong> 1.128 para n=2 observações consecutivas</li>
            <li><strong>Base histórica:</strong> Últimas 8 amostras válidas para cálculo dos limites</li>
            <li><strong>Componentes monitorados:</strong> C₁, C₂, C₃, iC₄, nC₄, CO₂, N₂ + Propriedades principais</li>
          </ul>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Erro ao gerar seção CEP para PDF:', error);
    return `
      <div style="margin-bottom: 25px;">
        <h3 style="background: #7c3aed; color: white; padding: 8px 12px; margin: 0 0 15px 0; border-radius: 4px; font-size: 14px;">
          📊 CONTROLE ESTATÍSTICO DE PROCESSO (CEP)
        </h3>
        <div style="padding: 15px; border: 2px solid #dc2626; border-radius: 8px; background: #fef2f2;">
          <p style="margin: 0; font-weight: bold; color: #dc2626; text-align: center;">
            ❌ Erro ao carregar dados CEP
          </p>
          <p style="margin: 10px 0 0 0; font-size: 11px; color: #7f1d1d; text-align: center;">
            Verifique o console para mais detalhes
          </p>
        </div>
      </div>
    `;
  }
}; 