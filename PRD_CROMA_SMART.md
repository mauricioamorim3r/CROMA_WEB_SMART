# 📋 PRD - CROMA_SMART
## Product Requirements Document - Sistema de Validação Cromatográfica

---

### 📌 **Informações Gerais**

| **Campo** | **Valor** |
|-----------|-----------|
| **Produto** | CROMA_SMART - Validador de Cromatografia |
| **Versão** | 2.0 |
| **Data** | Dezembro 2024 |
| **Tipo** | Aplicação Web para Análise Crítica de Boletins Analíticos |
| **Tecnologia** | React 19 + TypeScript + Vite 6 |

---

## 🎯 **Visão Geral do Produto**

### **Objetivo Principal**
O CROMA_SMART é uma aplicação web especializada para **análise crítica e validação técnica de resultados analíticos de cromatografia gasosa** de gás natural, assegurando conformidade com:

- **AGA Report Nº8** (American Gas Association)
- **Resolução ANP nº 52/2013** (Agência Nacional do Petróleo)
- **ISO/IEC 17025** (Requisitos gerais para competência de laboratórios)
- **Controle Estatístico de Processo (CEP)**

### **Público-Alvo**
- Engenheiros de petróleo e gás
- Técnicos em análises químicas
- Responsáveis por transferência de custódia
- Analistas de controle de qualidade
- Laboratórios credenciados

---

## 🏗️ **Arquitetura e Estrutura**

### **Stack Tecnológico**
```
Frontend: React 19 + TypeScript
Build Tool: Vite 6
Styling: TailwindCSS
Charts: Chart.js
PDF Generation: jsPDF
Excel Processing: SheetJS (XLSX)
Testing: Vitest
Deployment: Vercel
```

### **Estrutura Modular**
A aplicação é organizada em três partes principais:

1. **PARTE 1** - Coleta e Organização de Dados
2. **PARTE 2** - Validação Técnica e Metrológica  
3. **PARTE 3** - Conclusão e Decisão Final

---

## 📊 **Funcionalidades Principais**

### **1. Gerenciamento de Dados de Entrada**

#### **1.1 Informações do Solicitante**
- Nome completo do cliente/empresa
- Endereço e localização da instalação
- Dados de contato do responsável

#### **1.2 Informações da Amostra**
- Número único de identificação
- Data/hora de coleta (formato ISO)
- Local e ponto de coleta (TAG)
- Dados do poço de apropriação
- Número do cilindro
- Responsável pela amostragem
- Condições de processo:
  - Pressão absoluta (kPa.A)
  - Pressão manométrica (kPa)  
  - Temperatura (K e °C)

#### **1.3 Dados do Boletim Analítico**
- Datas críticas do processo:
  - Recebimento da amostra
  - Análise laboratorial
  - Emissão do boletim
  - Recebimento pelo solicitante
- Laboratório emissor
- Equipamento utilizado
- Métodos normativos aplicados
- Tipo de processo (Normal/Sem Validação)

### **2. Composição Molar e Validação**

#### **2.1 Componentes Monitorados**
A aplicação analisa **21 componentes** conforme padrões internacionais:

**Hidrocarbonetos:**
- Metano (C₁) - *Componente principal*
- Etano (C₂), Propano (C₃)
- Butanos (iC₄, nC₄)
- Pentanos (iC₅, nC₅) 
- Hexano+ (C₆ a C₁₀)

**Não-Hidrocarbonetos:**
- Nitrogênio (N₂)
- Dióxido de Carbono (CO₂)
- Sulfeto de Hidrogênio (H₂S)
- Oxigênio (O₂)
- Água (H₂O)
- Monóxido de Carbono (CO)

#### **2.2 Validação de Balanço Molar**
```typescript
// Algoritmo de validação
const validação = {
  tolerância: ±0.1%, // Tolerância aceitável
  somatória: Σ(componentes) = 100.0%,
  status: somatória ∈ [99.9%, 100.1%] ? "OK" : "Fora da Faixa"
}
```

### **3. Propriedades Físico-Químicas**

#### **3.1 Condições Padrão (20°C, 1 atm)**
- **PCS** - Poder Calorífico Superior (kJ/m³)
- **PCI** - Poder Calorífico Inferior (kJ/m³) 
- **Fator de Compressibilidade (Z)**
- **Peso Molecular** (g/mol)
- **Densidade Real** (kg/m³)
- **Densidade Relativa** (ar = 1,0)
- **Viscosidade** (cP)
- **Coeficientes Adiabático e Isentrópico**

#### **3.2 Condições de Amostragem**
- Densidade nas condições reais
- Índice de Wobbe (kJ/m³)
- Propriedades termodinâmicas ajustadas

#### **3.3 Cálculos Automáticos**
```typescript
// Exemplos de cálculos implementados
peso_molecular = Σ(xi × MWi)  // Média ponderada
densidade_relativa = peso_molecular / 28.9625
PCI = PCS - (9 × H2O_formada × entalpia_vaporizacao)
indice_wobbe = PCS / √densidade_relativa
```

---

## 🔬 **Sistema de Validação Técnica**

### **1. Validação AGA-8 (American Gas Association)**

#### **1.1 Critérios Automatizados**
A aplicação implementa **três modelos** de validação AGA-8:

##### **DETAIL Method (Mais Rigoroso)**
```
Limites de Pressão: 0 - 10.342 kPa (~1.500 psia)
Limites de Temperatura: -4°C a 62°C
Componentes Críticos:
- Metano: ≥ 60,0% mol
- CO₂: ≤ 30,0% mol  
- N₂: ≤ 50,0% mol
- H₂S: ≤ 0,1% mol
- Etano: ≤ 10,0% mol
```

##### **GROSS Method (Intermediário)**
```
Limites de Pressão: 0 - 20.684 kPa (~3.000 psia)
Limites de Temperatura: -4°C a 62°C
Critérios relaxados para componentes menores
```

##### **GERG-2008 (Flexível)**
```
Limites de Pressão: 0 - 70.000 kPa (70 MPa)
Limites de Temperatura: -160°C a 200°C
Aceita composições fora dos padrões AGA-8
```

#### **1.2 Lógica de Seleção Automática**
```typescript
function escolherCriterioAGA8(components, temperatura, pressao) {
  if (metano < 60%) return "GERG-2008";
  
  if (verificarCriterio("DETAIL")) return "AGA-8 DETAIL";
  if (verificarCriterio("GROSS")) return "AGA-8 GROSS";
  
  return "GERG-2008"; // Fallback
}
```

### **2. Controle Estatístico de Processo (CEP)**

#### **2.1 Metodologia Aplicada**
O sistema CEP implementa **cartas de controle individuais** baseadas em:

```
Base Histórica: Últimas 8 amostras válidas
Amplitude Móvel: MRᵢ = |xᵢ - xᵢ₋₁|
Limites de Controle:
- LCS = x̄ + 3(MR̄/1.128)
- LCI = x̄ - 3(MR̄/1.128)  
Fator d₂ = 1.128 (para n=2 observações)
```

#### **2.2 Componentes Monitorados**
- **Principais:** C₁, C₂, C₃, iC₄, nC₄, CO₂, N₂
- **Propriedades:** Fator Z, Massa Específica, Peso Molecular

#### **2.3 Gerenciamento de Histórico**
```typescript
interface CEPHistoricalSample {
  id: string;
  boletimNumber: string;
  date: string; // ISO format
  components: Record<string, number>;
  properties: Record<string, number>;
}

// Armazenamento local persistente
localStorage.setItem('cep_historical_samples', JSON.stringify(samples));
```

### **3. Conformidade Regulatória ANP 52/2013**

#### **3.1 Validação de Prazos**
```typescript
// Prazos estabelecidos pela Resolução ANP 52/2013
const PRAZOS_ANP52 = {
  coleta_emissao: 25, // dias corridos
  processo_normal: 28, // dias corridos  
  processo_sem_validacao: 26, // dias corridos
  nova_amostragem: 3 // dias úteis
};
```

#### **3.2 Tipos de Processo**
- **Processo Normal:** Validação completa (28 dias)
- **Processo Sem Validação:** Expedito (26 dias)

### **4. Checklist Documental ISO/IEC 17025**

#### **4.1 Itens Verificados (15 itens)**
1. Identificação do boletim analítico
2. Identificação da amostra
3. Datas críticas do processo
4. Identificação de campo/instalação
5. Identificação do agente regulado
6. Ponto de medição/poço
7. Resultados e métodos utilizados
8. Condições de processo
9. Responsável pela amostragem
10. Incertezas de medição
11. Responsáveis técnicos
12. Elaboração e aprovação

#### **4.2 Estados de Conformidade**
- ✅ **SIM** - Conforme
- ❌ **NÃO** - Não conforme  
- ➖ **NÃO APLICÁVEL** - Item não aplicável

---

## 📈 **Análise e Processamento de Dados**

### **1. Fluxo de Validação**

O sistema segue um fluxo sequencial de validação:

1. **Entrada de Dados** → Coleta de informações básicas
2. **Validação de Balanço Molar** → Verificação da soma = 100%
3. **Cálculo de Propriedades** → Propriedades físico-químicas automáticas
4. **Validação AGA-8** → Conformidade com padrões internacionais
5. **Análise CEP** → Controle estatístico baseado em histórico
6. **Checklist Documental** → Verificação ISO/IEC 17025
7. **Validação de Prazos ANP 52** → Conformidade regulatória
8. **Síntese de Status** → Consolidação dos resultados
9. **Decisão Final** → Aprovação, restrição ou reprovação

### **2. Estados de Validação**

A aplicação utiliza um sistema unificado de status:

```typescript
enum ValidationStatus {
  OK = 'OK',                    // ✅ Dentro dos limites
  ForaDaFaixa = 'Fora da Faixa', // ❌ Fora dos limites  
  Pendente = 'Pendente',        // ⏳ Aguardando dados
  NA = 'N/A'                    // ➖ Não aplicável
}
```

### **3. Algoritmos de Cálculo**

#### **3.1 Peso Molecular**
```typescript
function calculateMolarMass(components: ComponentData[]): number {
  return components.reduce((sum, comp) => {
    const molarFraction = parseFloat(comp.molarPercent) / 100;
    const molarMass = getComponentMolarMass(comp.name);
    return sum + (molarFraction * molarMass);
  }, 0);
}
```

#### **3.2 Densidade Relativa**
```typescript
function calculateRelativeDensity(molarMass: number): number {
  const AIR_MOLAR_MASS = 28.9625; // g/mol
  return molarMass / AIR_MOLAR_MASS;
}
```

#### **3.3 Contaminação por Ar**
```typescript
function calculateAirContamination(oxygen: string, nitrogen: string) {
  const O2 = parseFloat(oxygen) || 0;
  
  // Proporção atmosférica: N₂/O₂ = 79.05/20.95 ≈ 3.774
  const N2_from_air = O2 * 3.774;
  const total_air = O2 + N2_from_air;
  
  return { nitrogenFromAir: N2_from_air, totalAir: total_air };
}
```

### **4. Detecção Automática de Inconsistências**

#### **4.1 Validação de Datas**
```typescript
// Sequência cronológica obrigatória
const sequencias = [
  'coleta → recebimento_lab',
  'recebimento_lab → análise_lab', 
  'análise_lab → emissão_boletim',
  'emissão_boletim → recebimento_solicitante',
  'recebimento_solicitante → análise_crítica'
];
```

#### **4.2 Consistência de Valores Z**
A aplicação verifica consistência entre:
- Z calculado em condições padrão
- Z nas condições de amostragem  
- Métodos AGA-8 aplicados

---

## 📋 **Resultados e Relatórios**

### **1. Dashboard de Status**

A interface apresenta **indicadores visuais** em tempo real:

```typescript
// Sistema de badges coloridos
const StatusBadge = {
  OK: "✅ Verde",
  ForaDaFaixa: "❌ Vermelho", 
  Pendente: "⏳ Amarelo",
  NA: "➖ Cinza"
};
```

### **2. Síntese de Validação**

#### **2.1 Status Consolidados**
- **A.G.A #8:** Conformidade com padrões internacionais
- **CEP:** Controle estatístico de processo
- **Checklist:** Conformidade documental ISO 17025

#### **2.2 Decisão Final**
```typescript
enum FinalDecisionStatus {
  Validado = 'VALIDADO',
  ValidadoComRestricoes = 'VALIDADO COM RESTRIÇÕES', 
  NaoValidadoReprovado = 'NÃO VALIDADO - REPROVADO'
}
```

### **3. Ações Recomendadas**

Baseado nos resultados, o sistema sugere:

- 🔄 **Implementar computador de vazão**
- 🔬 **Nova amostragem**  
- 🔍 **Investigação de causa raiz**
- 📞 **Contato com laboratório**
- ⚙️ **Outras ações customizadas**

### **4. Geração de Relatórios**

#### **4.1 Relatório PDF**
- Cabeçalho com dados da análise
- Tabelas de composição e propriedades
- Seção de validação AGA-8
- **Seção CEP integrada** com:
  - Estatísticas históricas
  - Limites de controle
  - Status de conformidade
  - Metodologia aplicada

#### **4.2 Templates Excel**
- **Importação:** Templates para entrada de dados
- **Exportação:** Dados estruturados para backup
- **Histórico CEP:** Base de dados para análise

---

## 🔧 **Funcionalidades Avançadas**

### **1. Sistema de Templates**

#### **1.1 Templates Pré-Configurados**
- 🛢️ **Offshore Standard** - Plataformas marítimas
- 🏭 **Onshore Standard** - Campos terrestres  
- 🧪 **Laboratory QC** - Controle de qualidade
- 🏗️ **Industrial Application** - Uso industrial

#### **1.2 Valores Típicos por Categoria**
```typescript
// Exemplo: Template Offshore
const offshore_template = {
  metano: { typical: 89.5, cep_range: [87.0, 92.0] },
  etano: { typical: 6.2, cep_range: [5.0, 8.0] },
  propano: { typical: 2.8, cep_range: [2.0, 4.0] }
};
```

### **2. Importação/Exportação de Dados**

#### **2.1 Formatos Suportados**
- **Excel (.xlsx)** - Import/Export completo
- **CSV** - Dados tabulares  
- **JSON** - Estruturas complexas

#### **2.2 Mapeamento Automático**
```typescript
// Mapeamento de colunas Excel → Sistema
const column_mapping = {
  'DATA_COLETA': 'sampleInfo.dataHoraColeta',
  'BOLETIM': 'numeroBoletim', 
  'Metano (%)': 'components[0].molarPercent'
};
```

### **3. Histórico e Rastreabilidade**

#### **3.1 Gerenciamento de Amostras**
- Armazenamento local persistente
- Identificação única por boletim
- Detecção automática de duplicatas
- Backup/restauração de dados

#### **3.2 Auditoria de Alterações**
- Log de modificações
- Timestamps de validação
- Responsáveis pela análise e aprovação

---

## 🎨 **Interface do Usuário**

### **1. Design System**

#### **1.1 Paleta de Cores**
```css
:root {
  --lime-custom: #d5fb00;    /* Destaque principal */
  --purple-custom: #1b0571;  /* Cor primária */
  --status-ok: #059669;      /* Verde - OK */
  --status-error: #dc2626;   /* Vermelho - Erro */
  --status-warning: #d97706; /* Amarelo - Aviso */
}
```

#### **1.2 Componentes Padronizados**
- **StatusBadge:** Indicadores visuais de status
- **InputClass:** Campos de entrada uniformes
- **TableStyles:** Tabelas com relevo e gradientes
- **ProgressBar:** Indicadores de progresso

### **2. Responsividade**

#### **2.1 Breakpoints**
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px  
- **Desktop:** > 1024px

#### **2.2 Layouts Adaptativos**
- Grids flexíveis com TailwindCSS
- Tabelas com scroll horizontal
- Modais responsivos

### **3. Atalhos de Teclado**

```typescript
const shortcuts = {
  'Ctrl+1': 'Ir para Informações do Solicitante',
  'Ctrl+2': 'Ir para Informações da Amostra', 
  'Ctrl+3': 'Ir para Dados do Boletim',
  'Ctrl+4': 'Ir para Composição Molar',
  'Ctrl+5': 'Ir para Propriedades Padrão',
  'Ctrl+6': 'Ir para Condições de Amostragem',
  'Ctrl+7': 'Ir para Observações',
  'Ctrl+8': 'Ir para Validação - Componentes', 
  'Ctrl+9': 'Ir para Validação - Propriedades'
};
```

---

## ⚙️ **Configurações e Administração**

### **1. Configurações de Validação**

#### **1.1 Tolerâncias Ajustáveis**
```typescript
const validation_settings = {
  molar_balance_tolerance: 0.1,  // ±0.1%
  cep_control_factor: 3,         // 3-sigma
  d2_factor: 1.128,             // Fator para n=2
  max_historical_samples: 8      // Base CEP
};
```

#### **1.2 Limites Customizáveis**
- Faixas AGA-8 por componente
- Limites CEP históricos
- Critérios de aprovação

### **2. Backup e Recuperação**

#### **2.1 Auto-Save**
```typescript
// Salvamento automático a cada 30 segundos
const autoSave = setInterval(() => {
  localStorage.setItem('croma_autosave', JSON.stringify(reportData));
}, 30000);
```

#### **2.2 Exportação de Backup**
- Dados completos em JSON
- Base histórica CEP
- Configurações personalizadas

---

## 📊 **Métricas e Análise**

### **1. Indicadores de Performance**

#### **1.1 Análise Estatística**
- Taxa de aprovação por período
- Componentes críticos mais frequentes
- Tendências históricas
- Eficiência do processo

#### **1.2 Dashboard Analytics**
```typescript
const analytics = {
  samples_analyzed: number,
  approval_rate: percentage,
  most_critical_components: string[],
  average_processing_time: minutes
};
```

### **2. Relatórios Gerenciais**

#### **2.1 Consolidação Mensal**
- Volume de análises realizadas
- Status de conformidade
- Principais não-conformidades
- Ações corretivas implementadas

#### **2.2 Trends e Insights**
- Evolução da qualidade do gás
- Sazonalidade nas propriedades
- Performance por laboratório
- Eficácia do CEP

---

## 🔒 **Segurança e Conformidade**

### **1. Proteção de Dados**

#### **1.1 Armazenamento Local**
- Dados sensíveis apenas no browser
- Sem transmissão para servidores externos
- Controle total pelo usuário

#### **1.2 Validação de Entrada**
```typescript
// Sanitização de dados
const sanitize = (input: string) => {
  return input.replace(/[<>\"'&]/g, '');
};
```

### **2. Auditoria e Compliance**

#### **2.1 Normas Atendidas**
- **ISO/IEC 17025** - Competência de laboratórios
- **AGA Report #8** - Padrões internacionais
- **ANP 52/2013** - Regulamentação brasileira
- **ABNT NBR** - Normas técnicas nacionais

#### **2.2 Rastreabilidade**
- Número único de rastreabilidade
- Timestamps de todas as operações
- Identificação de responsáveis
- Versionamento de dados

---

## 🚀 **Roadmap e Evolução**

### **1. Funcionalidades Planejadas**

#### **1.1 Versão 2.1**
- [ ] Integração com LIMS (Laboratory Information Management System)
- [ ] API REST para integração externa
- [ ] Relatórios avançados com gráficos
- [ ] Sistema de usuários e permissões

#### **1.2 Versão 2.2**  
- [ ] Módulo de calibração de equipamentos
- [ ] Análise de incertezas expandidas
- [ ] Previsão de tendências com IA
- [ ] Dashboard em tempo real

### **2. Integrações Futuras**

#### **2.1 Sistemas Externos**
- **SCADA** - Dados em tempo real
- **ERP** - Integração corporativa  
- **PIMS** - Process Information Management
- **Laboratórios** - API direto com LIMS

#### **2.2 Padrões Adicionais**
- **ISO 6976** - Cálculo de propriedades
- **ASTM D1945** - Análise cromatográfica
- **API MPMS** - Manual of Petroleum Measurement

---

## 📚 **Documentação Técnica**

### **1. Arquivos de Configuração**

#### **1.1 Principais Constantes**
```typescript
// constants.ts
export const ANP52_PRAZO_COLETA_EMISSAO_DIAS = 25;
export const INITIAL_COMPONENTS: ComponentData[];
export const VALIDATION_TOLERANCES = { /* ... */ };
```

#### **1.2 Tipos TypeScript**
```typescript  
// types.ts
export interface ReportData { /* ... */ }
export interface ComponentData { /* ... */ }
export enum ValidationStatus { /* ... */ }
```

### **2. Componentes Principais**

#### **2.1 Estrutura Modular**
```
components/
├── ComponentTable.tsx         # Tabela de composição
├── PropertiesTable.tsx       # Propriedades calculadas
├── ChecklistTable.tsx        # Verificação documental
├── CEPValidationComponent.tsx # Controle estatístico
├── PDFGenerator.tsx          # Geração de relatórios
└── ui/                       # Componentes base
    ├── StatusBadge.tsx
    ├── ProgressBar.tsx
    └── NotificationSystem.tsx
```

#### **2.2 Hooks Customizados**
```typescript
// src/hooks/useCEPValidation.ts
export const useCEPValidation = (
  components: ComponentData[],
  properties: SampleProperty[], 
  boletimNumber: string
) => {
  // Lógica de validação CEP
};
```

### **3. Algoritmos Especializados**

#### **3.1 Validação AGA-8**
```typescript
// aga8-criteria-validator.ts
export function escolherCriterioAGA8(
  components: ComponentData[],
  temperatura_C: number,
  pressao_kPa: number
): AGA8CriteriaResult;
```

#### **3.2 Parâmetros Físicos**
```typescript
// aga8-parameters.ts
export function getComponentMolarMass(componentName: string): number;
export const AGA8_COMPONENT_LIMITS: Record<string, LimitRange>;
```

---

## 📋 **Conclusão**

O **CROMA_SMART** representa uma solução completa e integrada para validação de análises cromatográficas de gás natural, combinando:

### **Pontos Fortes**
- ✅ **Conformidade Regulatória** - AGA-8, ANP 52/2013, ISO 17025
- ✅ **Automatização Inteligente** - Cálculos e validações automáticas  
- ✅ **CEP Integrado** - Controle estatístico baseado em histórico real
- ✅ **Interface Intuitiva** - Design responsivo e atalhos de produtividade
- ✅ **Flexibilidade** - Templates configuráveis e importação/exportação
- ✅ **Auditoria Completa** - Rastreabilidade total do processo

### **Diferenciais Técnicos**
- 🔬 **Validação Técnica Automatizada** - Seleção automática de critérios AGA-8
- 📊 **CEP em Tempo Real** - Limites de controle baseados no histórico
- 📋 **Relatórios Profissionais** - PDFs com seções técnicas detalhadas
- 🔄 **Integração de Dados** - Excel, CSV, JSON para máxima flexibilidade

### **Aplicação Prática**
O sistema atende plenamente às necessidades de:
- **Laboratórios de análise** - Validação de boletins emitidos
- **Empresas de O&G** - Controle de qualidade na recepção  
- **Órgãos reguladores** - Verificação de conformidade
- **Transferência de custódia** - Validação para faturamento

O **CROMA_SMART** consolida-se como ferramenta essencial para profissionais que necessitam de análise crítica precisa, confiável e em conformidade com os mais rigorosos padrões internacionais da indústria de petróleo e gás natural.

---

*Documento gerado automaticamente pelo sistema CROMA_SMART em Dezembro 2024* 