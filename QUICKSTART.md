# ⚡ QUICK START - 5 MINUTOS

## 🎯 Execute Agora

### Passo 1: Verificar Supabase (1 min)

```
✓ Abra https://app.supabase.com/project/itkxfqmsgroyxdoalvph
✓ Verifique se está "Active" (não "Paused")
✓ Se pausado: Dashboard → Resume
```

### Passo 2: RLS Setup (2 min)

```
✓ Abra SUPABASE_RLS_SETUP.md
✓ Copie primeiro bloco SQL (CREATE TABLE)
✓ Supabase → SQL Editor → Cole e Execute
✓ Repita com outros blocos
✓ 5 blocos no total
```

### Passo 3: Local Dev (1 min)

```bash
npm install
npm run dev
# Deve ver: "Local: http://localhost:5173"
```

### Passo 4: Validar (1 min)

```
✓ Abra http://localhost:5173/diagnostico.html
✓ Clique "Executar Testes"
✓ Todos devem ter ✓ verde
```

---

## 🚀 Resultado

Se tudo passou:

```
npm run build
git add .
git commit -m "fix: Supabase connection and timeouts"
git push origin main
```

Deploy automático via GitHub Actions → GitHub Pages

---

## ❌ Problema?

1. Leia `TROUBLESHOOTING.md`
2. Use `diagnostico.html` para testar
3. Verifique console (F12)
4. Confirme Supabase está ativo

---

**Total: 5 minutos para estar funcional! ✅**
