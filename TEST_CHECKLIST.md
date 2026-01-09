# ✅ INSTRUÇÕES DE TESTE - PASSO A PASSO

## 🎬 FASE 1: Preparação (10 minutos)

### 1.1 Verificar Supabase

```
1. Abra: https://app.supabase.com/project/itkxfqmsgroyxdoalvph
2. Verifique se está em "Active" (não "Paused")
3. Se pausado, clique "Resume" e aguarde 2-5 minutos
```

### 1.2 Preparar Ambiente Local

```bash
cd d:\Antigravity
npm install
```

Deve terminar sem erros ✓

### 1.3 Verificar .env.local

```bash
# Arquivo d:\Antigravity\.env.local deve existir
# Deve conter:
# VITE_SUPABASE_URL=https://itkxfqmsgroyxdoalvph.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🎬 FASE 2: RLS Setup (15 minutos)

### 2.1 Abrir SQL Editor do Supabase

```
1. app.supabase.com → SQL Editor
2. Crie um novo query
```

### 2.2 Executar SQL em Blocos

Copie cada bloco de `SUPABASE_RLS_SETUP.md` e execute na ordem:

**Bloco 1:** CREATE TABLE complaints

- Deve ver: "Query executed successfully"

**Bloco 2:** CREATE TABLE profiles

- Deve ver: "Query executed successfully"

**Bloco 3:** ALTER TABLE ... ENABLE ROW LEVEL SECURITY

- Deve ver: "Query executed successfully"

**Blocos 4-5:** CREATE POLICY ...

- Execute cada um, 5 políticas total
- Deve ver: "Query executed successfully" para cada

### 2.3 Verificar Tabelas

Execute na SQL Editor:

```sql
SELECT * FROM public.complaints LIMIT 1;
SELECT * FROM public.profiles LIMIT 1;
```

Se retornar erro de RLS = ✓ CORRETO (significa está protegido)

---

## 🎬 FASE 3: Teste Local (20 minutos)

### 3.1 Iniciar Dev Server

```bash
npm run dev
```

Deve ver:

```
  VITE v7.2.4  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 3.2 Abrir no Navegador

```
Acesse: http://localhost:5173
```

Deve ver:

- ✓ Página de login carrega
- ✓ Sem erros vermelhos no console (F12)

### 3.3 Verificar Logs de Conexão

Abra DevTools (F12) → Console

Procure por linhas começando com `[Supabase]`:

```
[Supabase] Inicializando cliente...
[Supabase] URL: https://itkxfqmsgroyxdoalvph.supabase.co
[Supabase] Cliente inicializado com sucesso
[Supabase] Verificando conexão...
[Supabase] Conexão: OK
```

Se vir "Conexão: OK" = ✓ SUCESSO

### 3.4 Usar Ferramenta de Diagnóstico

```
Acesse: http://localhost:5173/diagnostico.html
Clique em "Executar Testes"
Espere terminar
```

Deve ver:

- ✓ Resolução DNS: ✓ OK
- ✓ CORS: ✓ OK
- ✓ Latência: < 1s
- ✓ Tabela complaints: ✓ OK

Se tudo OK = ✓ SUCESSO

---

## 🎬 FASE 4: Teste de Login (5 minutos)

### 4.1 Criar Usuário de Teste

```bash
# No Supabase, vá a: Authentication → Users
# Clique "Add user"
# Email: teste@test.com
# Password: TestPassword123!
```

### 4.2 Fazer Login

```
1. Volte para http://localhost:5173
2. Click "Login" ou acesso direto em /login
3. Email: teste@test.com
4. Senha: TestPassword123!
5. Clique "Entrar"
```

Deve:

- ✓ Aceitar credenciais
- ✓ Redirecionar para Dashboard
- ✓ Mostra "Bem-vindo, teste@test.com"

### 4.3 Verificar Dashboard

Deve ver:

- ✓ Cards de estatísticas carregando
- ✓ Tabela vazia (nenhum registro ainda)
- ✓ Botão "Novo Registro" disponível
- ✓ Botão "Sair" no topo

---

## 🎬 FASE 5: Teste de CRUD (10 minutos)

### 5.1 Criar Novo Registro

**Clique:** "Novo Registro"

**Preencha:**

- Data: 09/01/2026
- Descrição: "Teste de conexão Supabase"
- Logradouro: "Rua das Flores"
- Número: "123"
- Bairro: "Centro"
- Data Final: 15/01/2026

**Clique:** "Próximo" até "Salvar Registro"

Deve:

- ✓ Mostrar "Registro criado com sucesso!"
- ✓ Redirecionar para Dashboard
- ✓ Novo registro aparece na tabela

### 5.2 Ver Registro

**Clique:** ícone "Olho" no registro

Deve:

- ✓ Abrir modal com detalhes
- ✓ Mostrar todos os dados preenchidos

### 5.3 Editar Registro

**Clique:** ícone "Lápis" no registro

**Altere:** Descrição para "Teste editado"

**Clique:** "Atualizar Registro"

Deve:

- ✓ Mostrar "Registro atualizado com sucesso!"
- ✓ Tabela atualiza com novo valor

### 5.4 Deletar Registro

**Clique:** ícone "Lixo" no registro

**Confirme:** No diálogo

Deve:

- ✓ Mostrar "Registro excluído com sucesso!"
- ✓ Registro desaparece da tabela

---

## 🎬 FASE 6: Teste de Build (10 minutos)

### 6.1 Fazer Build

```bash
npm run build
```

Deve terminar com:

```
✓ 123 modules transformed
dist/index.html
dist/assets/...
```

Sem erros = ✓ SUCESSO

### 6.2 Verificar Tamanho

```bash
# Verifique tamanho do dist/
# Deve estar < 500KB total (era 300KB antes)
```

### 6.3 Preview Local

```bash
npm run preview
# Acesse http://localhost:4173
```

Deve funcionar igual ao dev:

- ✓ Login funciona
- ✓ Dashboard carrega
- ✓ Dados aparecem
- ✓ CRUD funciona

---

## 🎬 FASE 7: Deploy (5 minutos)

### 7.1 Commit e Push

```bash
git add .
git commit -m "fix: corrigir conexão Supabase e timeouts

- Aumentado timeout de 30s para 120s
- Melhorado retry logic (2x→3x com backoff)
- Adicionado Content-Type header
- Otimizado build com Terser
- Criado RLS setup guide
- Adicionada ferramenta diagnóstico"

git push origin main
```

### 7.2 Acompanhar Deploy

```
GitHub → Actions → Deploy to GitHub Pages
Aguarde build completar (3-5 minutos)
```

Deve ver:

- ✓ Install dependencies: ✓
- ✓ Build project: ✓
- ✓ Deploy to GitHub Pages: ✓

### 7.3 Acessar em Produção

```
https://ccrisweb.github.io/gestao_processos/
```

Deve funcionar igual ao local:

- ✓ Login funciona
- ✓ Dashboard carrega
- ✓ Dados aparecem
- ✓ CRUD funciona

---

## 🧪 Teste de Resiliência (Opcional)

### Simular Conexão Lenta

1. F12 → Network
2. Dropdown "No throttling" → "Slow 3G"
3. Tente acessar
4. Deve carregar (pode levar 30s, não dá timeout)

### Simular Offline

1. F12 → Network → Offline
2. Tente acessar
3. Deve mostrar erro, não timeout

### Teste de Concorrência

1. Abra 3 abas de http://localhost:5173
2. Login em todas
3. Crie registros simultaneamente
4. Deve sincronizar corretamente

---

## ✅ Resultado Esperado

Se todos os testes passarem:

```
✓ Supabase ativo e conectado
✓ RLS policies configuradas
✓ Dev local funciona 100%
✓ Login funciona
✓ CRUD completo funciona
✓ Build sem erros
✓ GitHub Pages deploy bem-sucedido
✓ Produção funciona igual ao local
✓ Resiliência melhorada
```

---

## 📋 Resultado Final

```
┌─────────────────────────────────────┐
│  🎉 TUDO FUNCIONANDO PERFEITAMENTE  │
│                                     │
│  ✓ Localhost: http://localhost:5173  │
│  ✓ GitHub Pages: https://...         │
│  ✓ Console limpo (sem erros)        │
│  ✓ Registros salvos com sucesso     │
│  ✓ Performance otimizada            │
│  ✓ Confiabilidade 99%+              │
└─────────────────────────────────────┘
```

---

## 🆘 Problemas Durante Testes?

1. **Erro "Timeout"**
   → Verifique se Supabase está ativo
   → Abra diagnostico.html e teste

2. **Erro "RLS denied"**
   → Re-execute SUPABASE_RLS_SETUP.md
   → Verifique policies na SQL Editor

3. **Build falha**
   → Rode `npm install` novamente
   → Verifique .env.local existe

4. **GitHub Pages não atualiza**
   → Aguarde 2-5 minutos
   → Abra em incógnito (sem cache)
   → Verifique Actions no GitHub

---

**Tempo total estimado:** 75 minutos
**Dificuldade:** Fácil (apenas clicar e seguir)
**Resultado:** ✅ App 100% funcional
