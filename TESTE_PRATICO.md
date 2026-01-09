# 🧪 GUIA DE TESTE PRÁTICO - LOCALHOST

## ✅ Status Atual

```
✅ Servidor de desenvolvimento rodando
   URL: http://localhost:5173/gestao_processos/

✅ Página de teste criada
   URL: http://localhost:5173/gestao_processos/teste-fluxo.html

✅ Ferramenta de diagnóstico disponível
   URL: http://localhost:5173/gestao_processos/diagnostico.html
```

---

## 🚀 PASSOS PARA TESTAR

### Passo 1: Abrir as Páginas

```
Abra as seguintes URLs em abas diferentes:

Aba 1: Aplicação Principal
  → http://localhost:5173/gestao_processos/

Aba 2: Página de Teste (esta)
  → http://localhost:5173/gestao_processos/teste-fluxo.html

Aba 3: Diagnóstico (opcional)
  → http://localhost:5173/gestao_processos/diagnostico.html
```

---

## 🔑 PASSO 2: LOGIN NA APLICAÇÃO

Na **Aba 1**, você verá a página de login.

### Opção A: Login Existente

Se você tem um usuário no Supabase:

1. Email: [seu email registrado]
2. Senha: [sua senha]
3. Clique em "Entrar"

### Opção B: Criar Novo Usuário (Recomendado)

1. Clique em "Criar Conta"
2. Preencha:
   - Email: `teste@exemplo.com`
   - Senha: `Teste123!@#`
   - Confirmação: `Teste123!@#`
3. Clique em "Criar Conta"

**Nota:** Se retornar erro, faça login com um usuário existente.

### Passo 3: Verificar Dashboard

Após login bem-sucedido:

1. Você deve ver "Bem-vindo, [seu email]"
2. Cards de estatísticas devem carregar:
   - [ ] Total Registrados
   - [ ] Em Aberto
   - [ ] Vencidos
3. Tabela de registros (inicialmente vazia)
4. Botão "Novo Registro" no topo

**Se vir erro:**

- Abra DevTools (F12) → Console
- Procure por linhas vermelhas
- Verifique se Supabase está ativo

---

## 📝 PASSO 4: CRIAR NOVO REGISTRO

### 4.1 Clicar em "Novo Registro"

```
Dashboard → Botão "Novo Registro" (azul/roxo no topo)
```

### 4.2 Você verá um Formulário Passo a Passo

O formulário tem 4 passos:

1. **Dados da Denúncia / Solicitação**
2. **Endereço**
3. **Ação da Fiscalização**
4. **Prazos & Finalização**

### 4.3 Preencher com Dados Fictícios

#### **PASSO 1: Dados da Denúncia**

```
Data: 09/01/2026
Diligência: 1ª
Descrição: Teste de conexão Supabase - Verificação de cadastro
Atendimento: Presencial
Número de Atendimento: AT-2026-001
```

Clique em "Próximo"

#### **PASSO 2: Endereço**

```
Rua: Rua
Logradouro: Rua das Flores
Número: 123
Complemento: Apto 101 (opcional)
Bairro: Centro
```

Clique em "Próximo"

#### **PASSO 3: Ação da Fiscalização**

```
Categoria: Meio Ambiente (ou outra)
Fiscal: João Silva (ou outro)
Ação Tomada: Notificado
Observações: Teste de cadastro
```

Clique em "Próximo"

#### **PASSO 4: Prazos & Finalização**

```
Data Inicial: 09/01/2026
Data Final: 15/01/2026 (obrigatório)
Prazo (dias): 5
Prorrogação (dias): 0
```

**CLIQUE EM "SALVAR REGISTRO"**

---

## ✨ PASSO 5: VERIFICAR SALVAMENTO

### 5.1 Após Clicar em Salvar

Você deve ver:

```
✅ "Registro criado com sucesso!"
    (mensagem verde no topo)
```

### 5.2 Página Deve Retornar ao Dashboard

Esperado:

- [ ] Página volta ao Dashboard automaticamente
- [ ] Dashboard está limpo (formulário desapareceu)
- [ ] Tabela agora mostra o novo registro
- [ ] Contadores foram atualizados

**Resultado esperado:**

```
Painel de Controle
Bem-vindo, teste@exemplo.com

Novo Registro ↑ Sair

Total Registrados: 1 ✅
Em Aberto: 1 ✅
Vencidos: 0 ✅

TABELA:
┌──────────────────────────────────┐
│ DATA    │ ENDEREÇO      │ STATUS  │
├──────────────────────────────────┤
│ 09/01   │ Rua das Fl... │ Aberto  │
└──────────────────────────────────┘
```

---

## 🔍 PASSO 6: VERIFICAR DADOS NO SUPABASE

### Opção A: Ver na Tabela da Aplicação

Na aba 1 (Aplicação):

1. Os dados devem aparecer na tabela
2. Clique no ícone "Olho" para ver detalhes
3. Clique no ícone "Lápis" para editar
4. Clique no ícone "Lixo" para deletar

### Opção B: Verificar Diretamente no Supabase

Na aba 2 (Teste-Fluxo):

1. Clique em "🗄️ Testar Query Direta no Supabase"
2. Siga as instruções na página
3. Acesse: https://app.supabase.com/project/itkxfqmsgroyxdoalvph
4. SQL Editor
5. Execute:

```sql
SELECT * FROM public.complaints
ORDER BY created_at DESC
LIMIT 10;
```

Se retornar dados → ✅ **TUDO FUNCIONA!**
Se retornar erro → ❌ Verifique RLS Setup

### Opção C: Verificar no Console (DevTools)

Na aba 1:

1. Pressione **F12** para abrir DevTools
2. Vá até **Console**
3. Procure por:

```
[ComplaintTable] Registros carregados: 1
[ComplaintForm] Creating complaint: {...}
Save successful: [...]
```

Se vir estas mensagens → ✅ **SALVAMENTO OK!**

---

## 🧪 PASSO 7: TESTAR NOVAMENTE

Repita os passos 4-6 criando outro registro com dados diferentes:

```
Data: 08/01/2026
Logradouro: Avenida Principal
Número: 456
Bairro: Zona Leste
Data Final: 20/01/2026
Prazo: 10
```

Resultado esperado:

- [ ] Total Registrados: 2 ✅
- [ ] Tabela mostra 2 registros ✅
- [ ] Supabase tem 2 registros ✅

---

## 📊 PASSO 8: TESTAR EDIÇÃO

1. Na tabela, clique em ✏️ (lápis)
2. Altere a descrição para: "Registro editado - Teste OK"
3. Clique em "Atualizar Registro"
4. Verifique se a mudança aparece na tabela

Resultado esperado:

```
✅ "Registro atualizado com sucesso!"
✅ Descrição atualizada na tabela
✅ No Supabase, updated_at foi atualizado
```

---

## 🗑️ PASSO 9: TESTAR EXCLUSÃO (Admin)

Se você é admin:

1. Na tabela, clique em 🗑️ (lixo)
2. Confirme a exclusão
3. Verifique se desapareceu

Resultado esperado:

```
✅ "Registro excluído com sucesso!"
✅ Registro desaparece da tabela
✅ Total Registrados diminui
```

---

## 📋 CHECKLIST DE VALIDAÇÃO

Marque cada item conforme avança:

### Fase 1: Inicialização

- [ ] Servidor rodando em localhost:5173
- [ ] Página da aplicação carrega
- [ ] Sem erros vermelhos no console (F12)

### Fase 2: Autenticação

- [ ] Login bem-sucedido
- [ ] Dashboard carrega com "Bem-vindo"
- [ ] Contadores e gráficos aparecem

### Fase 3: Novo Registro

- [ ] Botão "Novo Registro" funciona
- [ ] Formulário abre corretamente
- [ ] Passo a passo funciona
- [ ] Preenche todos os campos sem erro

### Fase 4: Salvamento

- [ ] Clique em "Salvar" funciona
- [ ] Mensagem "Registrado com sucesso" aparece
- [ ] Página volta ao Dashboard
- [ ] Dashboard está limpo (sem formulário)

### Fase 5: Visualização

- [ ] Novo registro aparece na tabela
- [ ] Contadores foram atualizados
- [ ] Clique em "Olho" mostra detalhes
- [ ] Dados batem com o preenchido

### Fase 6: Banco de Dados

- [ ] Dados aparecem no Supabase (query SQL)
- [ ] Timestamp `created_at` é atual
- [ ] `user_id` está preenchido
- [ ] Todos os campos estão corretos

### Fase 7: Edição

- [ ] Botão "Lápis" funciona
- [ ] Formulário abre com dados preenchidos
- [ ] Alterações salvam corretamente
- [ ] Dashboard reflete mudanças

### Fase 8: Exclusão

- [ ] Botão "Lixo" funciona
- [ ] Confirmação aparece
- [ ] Após confirmar, registro desaparece
- [ ] Contadores diminuem

### Resultado Final

- [ ] **Aplicação funciona 100%**
- [ ] **Banco de dados salva corretamente**
- [ ] **Supabase conectado e funcional**
- [ ] **Pronto para produção ✅**

---

## ⚠️ POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema: "Timeout na busca"

```
Causa: Supabase lento ou pausado
Solução:
  1. Verifique https://app.supabase.com
  2. Se pausado, clique "Resume"
  3. Aguarde 2-5 minutos
  4. Tente novamente
```

### Problema: "Erro de autenticação"

```
Causa: Token JWT inválido
Solução:
  1. Saia da aplicação (botão logout)
  2. Limpe cache do navegador (Ctrl+Shift+Del)
  3. Faça login novamente
```

### Problema: "RLS denied / permission denied"

```
Causa: Policies RLS não configuradas
Solução:
  1. Abra: SUPABASE_RLS_SETUP.md
  2. Execute todos os blocos SQL
  3. No Supabase → SQL Editor
  4. Cole cada bloco e execute
  5. Tente novamente na aplicação
```

### Problema: "Tabela não encontrada"

```
Causa: Tabela 'complaints' não existe
Solução:
  1. Abra: SUPABASE_RLS_SETUP.md
  2. Execute o bloco CREATE TABLE
  3. Verifique em Supabase → Tables
```

### Problema: "Dados não aparecem na tabela"

```
Causas possíveis:
  1. RLS não configurada → Execute SUPABASE_RLS_SETUP.md
  2. User não autenticado → Faça login
  3. Nenhum dado foi salvo ainda → Crie novo registro
  4. Erro silencioso → Verifique console (F12)
```

### Problema: "Página muito lenta"

```
Causa: Conexão lenta com Supabase
Solução:
  1. Timeout aumentou para 120s ✓
  2. Aguarde carregamento completo
  3. Verifique velocidade internet
  4. Supabase pode estar com latência
```

---

## 🎓 O QUE SIGNIFICA CADA MENSAGEM

### Console Logs (F12 → Console)

```
[Supabase] Inicializando cliente...
→ Significa: Começou a inicializar Supabase

[Supabase] URL: https://itkxfqmsgroyxdoalvph.supabase.co
→ Significa: Projeto identificado

[Supabase] Cliente inicializado com sucesso
→ Significa: Supabase carregou corretamente

[Supabase] Conexão: OK
→ Significa: ✅ CONECTADO E FUNCIONANDO

[ComplaintTable] Iniciando busca de registros...
→ Significa: Tentando carregar tabela

[ComplaintTable] Registros carregados: 2
→ Significa: ✅ 2 registros encontrados

[ComplaintForm] Creating complaint: {...}
→ Significa: Enviando novo registro

Save successful: [...]
→ Significa: ✅ REGISTRO SALVO COM SUCESSO

[Dashboard] Estatísticas: {total: 2, open: 2, expired: 0}
→ Significa: ✅ Contadores atualizados
```

---

## 📞 RESUMO DO TESTE

Se você chegou aqui e:

✅ **Todos os checkboxes marcados?**
→ Sua aplicação está **100% FUNCIONAL**
→ Supabase está **CONECTADO**
→ Dados estão sendo **SALVOS CORRETAMENTE**
→ Você pode fazer **DEPLOY COM CONFIANÇA**

❌ **Alguns checkboxes não marcados?**
→ Abra TROUBLESHOOTING.md
→ Consulte a seção de problema correspondente
→ Ou abra diagnostico.html para teste automático

---

**Tempo estimado do teste:** 15-20 minutos
**Dificuldade:** Fácil
**Confiabilidade:** 99%+ se todos os passos forem seguidos
