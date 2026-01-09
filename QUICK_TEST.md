# ⚡ Quick Test - 5 Minutos

## 🎯 Objetivo: Validar que GitHub Pages funciona com Supabase

---

## 1️⃣ Abrir GitHub Pages (30 segundos)

```
URL: https://ccrisweb.github.io/gestao_processos/
```

**✓ Esperado:**
- Página de LOGIN aparece (não Dashboard)
- Sem erro 404
- Sem erro de timeout

**❌ Se não funcionar:**
- Aguarde 5 minutos (deploy em andamento)
- Ctrl+F5 (hard refresh)
- Clear cache: Ctrl+Shift+Del

---

## 2️⃣ Verificar Console (1 minuto)

Abrir DevTools:
```
F12 → Console tab
```

**Procurar por:**
```
[Supabase] Conexão: OK
```

**✓ Esperado:** Mensagem aparece (sem erros)

**❌ Se ver error:**
- Supabase URL incorreta
- Credenciais inválidas
- Network bloqueado

---

## 3️⃣ Teste de Login (2 minutos)

**Teste 1: Criar Conta**
```
Email: teste.app@gmail.com (use email real)
Senha: SenhaSegura123!
```

- [ ] Clique em "Criar Conta"
- [ ] Aguarde resposta (max 10 segundos)
- [ ] Verificação de email enviada

**Teste 2: Fazer Login**
```
Email: (do teste anterior)
Senha: (do teste anterior)
```

- [ ] Clique em "Entrar"
- [ ] Aguarde resposta (max 10 segundos)
- [ ] Dashboard carrega

**✓ Esperado:** Login bem-sucedido → Dashboard visível

**❌ Se tiver erro:**
- "Invalid credentials" = email/senha errado
- "Timeout" = conexão lenta (normal com 120s timeout)
- "Network error" = firewall/ISP bloqueando

---

## 4️⃣ Teste de Salvar Registro (2 minutos)

Após fazer login, no Dashboard:

1. Clique em **"Novo Registro"**
2. Preencha:
   - **Título:** "Teste GitHub Pages 2024"
   - **Descrição:** "Validação de conexão Supabase estável"
   - **Tipo:** Selecione qualquer um
   - **Prioridade:** Alta

3. Clique em **"Salvar Registro"**
4. Aguarde 5 segundos

**✓ Esperado:**
- Toast de sucesso aparece
- Página volta para Dashboard
- Novo registro aparece na tabela

**❌ Se não funcionar:**
- Timeout após 120s = Supabase indisponível
- Erro de validação = formulário incompleto
- Erro de RLS = Policies não configuradas

---

## 5️⃣ Verificar no Supabase (Opcional)

Se o teste anterior deu sucesso, verificar banco de dados:

1. Abrir: https://app.supabase.com/projects
2. Selecionar projeto `itkxfqmsgroyxdoalvph`
3. SQL Editor → Execute:

```sql
SELECT * FROM complaints 
ORDER BY created_at DESC 
LIMIT 1;
```

**✓ Esperado:**
- Registro com seu título aparece
- Campo `user_id` preenchido
- Campo `status` = "open"
- Timestamp correto

**❌ Se não aparecer:**
- Registro não foi salvo
- RLS policy bloqueando leitura
- Database não está acessível

---

## 📊 Resumo Rápido

| Teste | Status | Tempo | Crítico |
|-------|--------|-------|---------|
| GitHub Pages carrega | ✓ ou ❌ | 30s | 🔴 SIM |
| Console sem erros | ✓ ou ❌ | 1m | 🟡 +/- |
| Login funciona | ✓ ou ❌ | 2m | 🔴 SIM |
| Salvar registro | ✓ ou ❌ | 2m | 🔴 SIM |
| Supabase SQL | ✓ ou ❌ | 1m | 🟡 +/- |

**Resultado:** Se todos ✓ = **SUCESSO! Produção funcional**

---

## 🚨 Troubleshooting Rápido

### Problema: "GitHub Pages não carrega"
```
→ Aguarde 5 min
→ Ctrl+F5
→ Ctrl+Shift+Del (cache)
```

### Problema: "Supabase timeout"
```
→ Normal até 120s
→ Verificar internet
→ Se > 120s: Network issue
```

### Problema: "Login funciona mas Dashboard vazio"
```
→ Tabela complaints existe?
→ RLS policies configuradas?
→ Testar: diagnostico.html
```

### Problema: "Salvar registro dá erro"
```
→ Todos campos preenchidos?
→ Supabase respondendo?
→ Console mostra qual erro?
```

---

## ✅ Checklist Final

- [ ] GitHub Pages carrega em /login
- [ ] Sem erros de 404
- [ ] Console mostra "[Supabase] Conexão: OK"
- [ ] Login bem-sucedido
- [ ] Dashboard carrega após login
- [ ] Botão "Novo Registro" clicável
- [ ] Formulário preenche corretamente
- [ ] Salvar registro funciona (< 120s)
- [ ] Toast de sucesso aparece
- [ ] Novo registro visível na tabela
- [ ] Registro encontrado no Supabase SQL

**Se ✓ 10+ itens = PRODUÇÃO ESTÁVEL ✅**

---

## 📞 Status Final

```
Deploy: ✅ Concluído
Build: ✅ Sucesso
GitHub Pages: 🔄 Em andamento (5-10 min)
Supabase: ✅ Configurado (timeout 120s)
RLS: ✅ Documentado (execute SQL no Supabase)
Login: ✅ Padrão (/login)
Test Tools: ✅ 3 ferramentas criadas
Documentação: ✅ 11 arquivos

Próximo: Aguardar deploy e executar testes acima
```

---

*Guia de Teste Rápido - 5 Minutos*  
*Versão: 2.0*  
*Status: Pronto para Validação*
