# 🧪 Validador de Cromatografia - Análise Crítica de Resultados Analíticos

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
