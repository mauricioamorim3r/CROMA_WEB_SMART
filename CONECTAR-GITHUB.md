# 🔗 Conectar ao GitHub - Validador Cromatografia

## 📋 Instruções Passo a Passo

### 1. **Criar Repositório no GitHub**
- Acesse [github.com](https://github.com)
- Clique em "New repository"
- Nome: `validador-cromatografia-web`
- Descrição: `Sistema de Validação Cromatográfica - Versão Web Otimizada`
- ✅ Público ou Privado (sua escolha)
- ❌ **NÃO** inicialize com README, .gitignore ou license

### 2. **Conectar Repositório Local**
```bash
# Adicionar repositório remoto
git remote add origin https://github.com/SEU_USUARIO/validador-cromatografia-web.git

# Definir branch principal
git branch -M main

# Enviar código pela primeira vez
git push -u origin main
```

### 3. **Para Atualizações Futuras**
```bash
# Usar o script automatizado
./git-update.bat

# OU manualmente:
git add .
git commit -m "Sua mensagem"
git push origin main
```

### 4. **Deploy no Vercel**
- Acesse [vercel.com](https://vercel.com)
- Import from GitHub
- Selecione o repositório `validador-cromatografia-web`
- Configure:
  - Framework: **Vite**
  - Build Command: **npm run build**
  - Output Directory: **dist**

## 🎯 Status Atual
✅ Repositório Git inicializado
✅ Commit inicial criado (42 arquivos)
✅ Scripts de automação prontos
✅ Configuração Vercel incluída

## 📦 Conteúdo do Repositório
- **42 arquivos** commitados
- **12.114 linhas** de código
- **Build otimizado** testado
- **Documentação** completa
