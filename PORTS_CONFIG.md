# Configuração de Portas - CROMA SMART

## Scripts Disponíveis

### Desenvolvimento (Dev)
- `npm run dev` - Porta padrão 8080
- `npm run dev:3000` - Porta 3000
- `npm run dev:4000` - Porta 4000
- `npm run dev:5000` - Porta 5000
- `npm run dev:8000` - Porta 8000
- `npm run dev:9000` - Porta 9000

### Preview (Produção Local)
- `npm run preview` - Porta padrão (vite preview)
- `npm run preview:3000` - Preview na porta 3000
- `npm run preview:4000` - Preview na porta 4000
- `npm run preview:5000` - Preview na porta 5000

## Configuração via Variável de Ambiente

Você também pode definir uma porta personalizada usando a variável de ambiente `PORT`:

```bash
# Windows (PowerShell)
$env:PORT=7000; npm run dev

# Windows (CMD)
set PORT=7000 && npm run dev

# Linux/Mac
PORT=7000 npm run dev
```

## Exemplos de Uso

```bash
# Executar na porta 3000
npm run dev:3000

# Executar na porta 5000
npm run dev:5000

# Executar preview na porta 4000
npm run preview:4000

# Executar com porta personalizada
$env:PORT=6789; npm run dev
```

## URLs de Acesso

Após iniciar a aplicação, ela estará disponível em:
- `http://localhost:[PORTA]`
- `http://[SEU_IP]:[PORTA]` (devido ao `host: true`)

## Notas

- A aplicação evita as portas 5173 e 5174 conforme solicitado
- Todas as configurações incluem `--host` para acesso externo
- A porta padrão permanece 8080 se nenhuma for especificada 