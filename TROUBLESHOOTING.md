# Guia Completo de Troubleshooting

## 🔴 PROBLEMAS ENCONTRADOS E SOLUÇÕES

### 1. Timeout na Busca de Registros

**Sintoma:** Erro "Timeout na busca" ou "Request timeout"

**Causas:**

- Conexão de internet lenta
- Projeto Supabase pausado
- Banco de dados grandes (sem índices)
- Limite de 30 segundos era muito curto

**Solução:** ✅ CORRIGIDA

- Aumentado para 120 segundos
- Implementado retry automático com backoff exponencial
- Adicionado teste de conectividade

---

### 2. Variáveis de Ambiente Não Configuradas

**Sintoma:** Erro "Variáveis Supabase não configuradas"

**Causas:**

- Arquivo `.env.local` não existia
- Variáveis não estavam no `.env`

**Solução:** ✅ CORRIGIDA

- Criado `.env.local` com as credenciais
- Implementado fallback com keys hardcoded
- Verificação ao inicializar o cliente

---

### 3. CORS ou Erro de Políticas RLS

**Sintoma:** Erro 403 ou "permission denied"

**Causas:**

- Políticas RLS não configuradas
- Usuário não autenticado
- Headers de requisição incorretos

**Solução:** ✅ CORRIGIDA

- Adicionado `Content-Type: application/json`
- Criado guia de RLS setup (`SUPABASE_RLS_SETUP.md`)
- Melhorado tratamento de erros JWT

---

### 4. Projeto Supabase Pausado

**Sintoma:** Todos os erros de conexão, página não carrega

**Solução:**

1. Acesse: https://app.supabase.com/project/itkxfqmsgroyxdoalvph
2. Dashboard → Paused Projects
3. Clique em "Resume"
4. Aguarde ativação (2-5 minutos)

---

### 5. Página do GitHub Pages Lenta

**Sintoma:** https://ccrisweb.github.io/gestao_processos/ carrega lentamente

**Causas:**

- Assets não otimizados
- Sem compressão gzip
- Chunks grandes demais

**Solução:** ✅ CORRIGIDA

- Otimizado `vite.config.ts`
- Code splitting melhorado
- Terser minification adicionado

---

## 🔧 PASSOS PARA CORRIGIR TUDO

### Passo 1: Verificar o Supabase

```bash
# Acesse e verifique:
# 1. Se o projeto está ativo (não pausado)
# 2. Se existem erros no Dashboard
# 3. Se as tabelas existem

# Use o diagnóstico:
http://localhost:5173/diagnostico.html
```

### Passo 2: Configurar RLS Policies

Execute os comandos em `SUPABASE_RLS_SETUP.md` no SQL Editor do Supabase

### Passo 3: Rodar o App Local

```bash
npm install
npm run dev
# Acesse http://localhost:5173
```

### Passo 4: Testar Conexão

1. Abra DevTools (F12)
2. Vá ao Console
3. Deve ver log "[Supabase] Conexão: OK"
4. Faça login
5. Verifique se os registros carregam

### Passo 5: Build e Deploy

```bash
npm run build
# Commit e push para GitHub
# GitHub Actions vai fazer deploy automático
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Projeto Supabase está ativo (não pausado)
- [ ] Tabelas `complaints` e `profiles` existem
- [ ] RLS policies estão configuradas
- [ ] `.env.local` contém as credenciais
- [ ] App roda em localhost sem erros
- [ ] Registros carregam no Dashboard
- [ ] Novo registro é salvo com sucesso
- [ ] Página GitHub Pages carrega em <5s
- [ ] Console não mostra erros vermelhos

---

## 🔍 FERRAMENTAS DE DEBUG

### 1. Diagnóstico Web

```
http://localhost:5173/diagnostico.html
```

Testa conectividade, CORS, latência, DB access

### 2. Console do Navegador

```javascript
// Ver logs Supabase
console.log("Procure por linhas iniciadas com [Supabase]");
console.log("Procure por linhas iniciadas com [ComplaintTable]");
```

### 3. DevTools Network

- Abra F12 → Network
- Filtro: "api.supabase"
- Verifique status HTTP e tempo de resposta

### 4. Verificar Session

```javascript
// No console do navegador
const { data } = await supabase.auth.getSession();
console.log(data.session); // Deve mostrar usuário logado
```

---

## 🚨 ERROS COMUNS

### Erro: "Tabela não encontrada"

```
Solução: Execute SQL em SUPABASE_RLS_SETUP.md
```

### Erro: "Não autorizado"

```
Solução: Verifique RLS policies e JWT token
```

### Erro: "Timeout"

```
Solução: Verifi que internet e se Supabase está ativo
```

### Erro: "PGRST116"

```
Solução: Tabela não existe - crie em SUPABASE_RLS_SETUP.md
```

---

## 📞 VERIFICAÇÃO MANUAL

### Testar API REST do Supabase

```bash
# Terminal
curl -X GET "https://itkxfqmsgroyxdoalvph.supabase.co/rest/v1/complaints?limit=1" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0a3hmcW1zZ3JveXhkb2FsdnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzgxMzcsImV4cCI6MjA4MzExNDEzN30.XTkvG9MP-XZzsaH4D9FUbpa91TLOMDKsD3FP-SFLCE0"
```

Se retornar dados ou erro 401, a conexão está OK.

---

## 🎯 RESUMO DAS CORREÇÕES

| Problema    | Antes           | Depois                  |
| ----------- | --------------- | ----------------------- |
| Timeout     | 30s             | 120s                    |
| Retry       | 2x              | 3x com backoff          |
| Backoff     | linear          | exponencial             |
| Headers     | mínimo          | Content-Type adicionado |
| RLS         | não configurada | guia criado             |
| Build       | não otimizado   | terser + minify         |
| Diagnóstico | não havia       | ferramenta web criada   |

---

## 📱 TESTES NO NAVEGADOR

### Firefox DevTools

1. F12 → Console
2. F12 → Network → XHR
3. Verifique requisições para `.supabase.co`

### Chrome DevTools

1. F12 → Console
2. F12 → Network → Fetch/XHR
3. Verifique status 200 OK

### Microsoft Edge

1. F12 → Console
2. F12 → Network
3. Similar ao Chrome

---

## 🆘 SE AINDA TIVER PROBLEMAS

1. Abra `diagnostico.html` e execute os testes
2. Copie os logs (botão "Baixar Logs")
3. Verifique a coluna "Console" no DevTools
4. Procure por mensagens vermelhas
5. Verifique se projeto está ativo em app.supabase.com
6. Execute RLS setup novamente
7. Faça deploy novamente

**Timestamp das correções:** 2026-01-09
