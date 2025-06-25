# 🧪 Validador de Cromatografia Web

Aplicação web moderna para validação de relatórios de cromatografia, desenvolvida com React 19, Vite 6 e TypeScript.

## 🚀 Funcionalidades

- ✅ Validação completa de relatórios de cromatografia
- 📊 Análise de dados AGA8 e critérios de validação
- 🎨 Interface moderna e responsiva com TailwindCSS
- 📱 Suporte completo a dispositivos móveis
- ⚡ Performance otimizada com Vite
- 🔧 TypeScript para tipagem segura

## 🛠️ Tecnologias

- **React 19** - Framework frontend
- **Vite 6** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **Vercel** - Deploy e hospedagem

## 🏃‍♂️ Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/mauricioamorim3r/GEMINI_CROMA_WEB.git

# Entre no diretório
cd GEMINI_CROMA_WEB

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📦 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run build:vercel # Build otimizado para Vercel
npm run preview      # Preview do build de produção
npm run lint         # Verificação de código
```

## 🌐 Deploy

Esta aplicação está configurada para deploy automático no Vercel. Qualquer push para a branch `main` disparará um novo deploy.

## 📁 Estrutura do Projeto

```
GEMINI_CROMA_WEB/
├── components/          # Componentes React
├── src/                # Código fonte adicional
├── dist/               # Build de produção
├── App.tsx             # Componente principal
├── types.ts            # Definições TypeScript
├── constants.ts        # Constantes da aplicação
├── vercel.json         # Configuração Vercel
└── vite.config.ts      # Configuração Vite
```

## 🧪 Validação de Cromatografia

A aplicação realiza validação completa de:
- Dados de cromatografia
- Critérios AGA8
- Parâmetros de qualidade
- Relatórios técnicos

## 📄 Licença

Este projeto está sob licença MIT.
