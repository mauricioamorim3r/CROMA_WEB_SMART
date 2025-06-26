# 🧪 Validador de Cromatografia - Análise Crítica de Boletins Analíticos

## 📋 Descrição
Aplicação web completa para análise crítica e validação de resultados analíticos de cromatografia gasosa, desenvolvida com React 19, Vite 6 e TypeScript.

## 🚀 Funcionalidades
- ✅ Validação de critérios AGA8 
- 📊 Análise de componentes e propriedades
- 🔍 Verificação de contaminantes do ar
- 📝 Geração de relatórios em PDF
- 💾 Gerenciamento de templates Excel
- 📈 Dashboard de analytics
- ✅ Seção de aprovação técnica

## 🛠️ Tecnologias
- **Frontend**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: TailwindCSS
- **Charts**: Chart.js
- **PDF**: jsPDF
- **Excel**: SheetJS

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm

### Comandos
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Testes
npm test
```

## 🌐 Deploy
- **Vercel**: Configurado com `vercel.json`
- **GitHub Actions**: Deploy automático
- **Build**: Otimizado para produção

## 📁 Estrutura do Projeto
```
GEMINI_CROMA_WEB/
├── src/
│   ├── main.tsx          # Entry point
│   ├── index.css         # Estilos globais
│   └── vite-env.d.ts     # Tipos do Vite
├── components/           # Componentes React
├── App.tsx              # Componente principal
├── types.ts             # Definições de tipos
├── constants.ts         # Constantes da aplicação
├── vercel.json          # Configuração Vercel
└── package.json         # Dependências

```

## 🔍 Componentes Principais
- `AGA8CriteriaIndicator` - Indicadores de critérios AGA8
- `ComponentTable` - Tabela de componentes
- `PropertiesTable` - Propriedades calculadas
- `PDFGenerator` - Geração de relatórios
- `ExcelTemplateManager` - Gerenciamento de templates

## 📊 Validações Implementadas
- Critérios AGA8 para gás natural
- Limites de contaminantes
- Propriedades físico-químicas
- Condições de amostragem

## 🎯 Uso
1. Carregue um template Excel ou insira dados manualmente
2. A aplicação valida automaticamente os critérios AGA8
3. Visualize análises e propriedades calculadas
4. Gere relatório PDF com conclusões técnicas
5. Aprove ou rejeite o laudo analítico

## 📝 Licença
Este projeto é proprietário e destinado ao uso interno.

---
**Desenvolvido para análise crítica e validação de resultados analíticos de cromatografia gasosa**

## 🚀 Nova Funcionalidade: Importação de Base Histórica

### 📊 Como Criar sua Base Histórica Completa

#### 1. **Gerar Template Excel**
- Clique no botão **"📊 Gerar Template"** na seção de ações
- Será baixado um arquivo Excel com:
  - **Aba 1:** Dados Históricos CEP (com exemplos)
  - **Aba 2:** Instruções detalhadas de preenchimento
  - **23 colunas:** Datas, boletim, componentes e propriedades

#### 2. **Preencher o Template**
```excel
DATA_COLETA    | DATA_EMISSAO_RELATORIO | DATA_VALIDACAO | BOLETIM      | Metano (%) | Etano (%) | ...
20/03/2019     | 27/03/2019             | 27/03/2019     | 328.19REV.00 | 99.063     | 0.098     | ...
13/04/2019     | 17/04/2019             | 17/04/2019     | 414.19REV.00 | 99.046     | 0.086     | ...
```

**⚠️ Importante:**
- Use formato **DD/MM/AAAA** para datas
- Use **ponto (.)** como separador decimal
- **Remova as linhas de exemplo** antes de importar
- **Boletins duplicados** serão ignorados

#### 3. **Importar seus Dados**
- Clique no botão **"📁 Importar CSV"**
- Selecione seu arquivo Excel (.xlsx) ou CSV preenchido
- A aplicação processará automaticamente e validará os dados
- Verificará duplicatas e adicionará apenas dados novos

#### 4. **Verificar a Importação**
- Use **"🔍 Debug CEP"** para verificar os cálculos
- Verifique o console do navegador (F12) para detalhes
- Confirme se os limites de controle estão corretos

### 📈 Estrutura dos Dados Importados

**Componentes (% molar):**
- Metano (C₁), Etano (C₂), Propano (C₃)
- i-Butano (iC₄), n-Butano (nC₄)
- Isopentano, N-Pentano, Hexano, Heptano
- Octano, Nonano, Decano
- Oxigênio, Nitrogênio (N₂), Dióxido de Carbono (CO₂)

**Propriedades Físicas:**
- Fator de Compressibilidade (Z)
- Massa Específica (kg/m³)
- Massa Molecular (g/mol)

### 🎯 Resultado Final

Após importar sua base histórica:
- ✅ **Sistema CEP funcional** com dados reais
- ✅ **Limites de controle precisos** baseados no histórico
- ✅ **Validação automática** de novas amostras
- ✅ **Interface única** para todas as análises
- ✅ **Não precisará mais** de sistemas externos

### 💡 Dicas de Uso

1. **Primeira vez:** Importe toda sua base histórica
2. **Uso diário:** Adicione novas amostras manualmente ou via CEP
3. **Backup:** Use "Ver Histórico CEP" → Exportar para backup
4. **Debug:** Use sempre após importações para verificar cálculos

### 🔧 Funcionalidades Integradas

- **Validação AGA8:** Limites normativos automáticos
- **Controle CEP:** Estatísticas baseadas no histórico real
- **Geração PDF:** Relatórios completos com todos os dados
- **Entrada Manual:** Para análises pontuais
- **Export/Import:** Para backup e migração de dados

---

## Como Executar

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## Build para Produção

```bash
npm run build
```

---

### 📞 Suporte

Para dúvidas sobre o sistema de importação ou cálculos CEP, verifique sempre:
1. Console do navegador após importação
2. Função "Debug CEP" para análise detalhada
3. Notificações do sistema para status das operações
