/**
 * Script detalhado de diagnóstico de autenticação Supabase
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://itkxfqmsgroyxdoalvph.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0a3hmcW1zZ3JveXhkb2FsdnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzgxMzcsImV4cCI6MjA4MzExNDEzN30.XTkvG9MP-XZzsaH4D9FUbpa91TLOMDKsD3FP-SFLCE0";

console.log("\n╔════════════════════════════════════════════╗");
console.log("║    DIAGNÓSTICO DETALHADO DE AUTENTICAÇÃO   ║");
console.log("╚════════════════════════════════════════════╝\n");

const supabase = createClient(supabaseUrl, supabaseKey);

// Teste 1: Verificar se Auth está habilitado
console.log("📋 TESTE 1: Verificar configurações de Auth\n");

try {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.log("❌ ERRO:", error.message);
    console.log("\n🔍 Análise:");
    console.log("   - Auth pode estar desabilitado no projeto");
    console.log(
      "   - Verifique em: https://app.supabase.com -> Settings -> Auth"
    );
    console.log("   - Email/Password deve estar ATIVADO\n");
  } else {
    console.log("✅ Auth está respondendo");
    console.log(
      "   Sessão atual:",
      data.session ? "Existe sessão" : "Sem sessão\n"
    );
  }
} catch (error) {
  console.log("❌ Erro ao conectar com Auth:", error.message, "\n");
}

// Teste 2: Tentar SignUp com teste
console.log("📋 TESTE 2: Testar SignUp (com email de teste)\n");

const testEmail = `test-${Date.now()}@example.com`;
const testPassword = "TempPassword123!";

console.log("   Tentando registrar:", testEmail);

try {
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (error) {
    console.log("❌ SignUp falhou:", error.message);
    console.log("\n   Possíveis causas:");
    console.log("   - Auth desabilitado");
    console.log("   - Verificação de email obrigatória");
    console.log("   - Restrições de segurança\n");
  } else {
    console.log("✅ SignUp bem-sucedido!");
    console.log("   User ID:", data.user?.id);
    console.log(
      "   Confirmado?",
      data.user?.email_confirmed_at ? "Sim" : "Não\n"
    );
  }
} catch (error) {
  console.log("❌ Erro no SignUp:", error.message, "\n");
}

// Teste 3: Tentar SignIn
console.log("📋 TESTE 3: Testar SignIn\n");

console.log("   Tentando fazer login com email de teste...");

try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (error) {
    console.log("❌ SignIn falhou:", error.message);
  } else {
    console.log("✅ SignIn bem-sucedido!");
    console.log("   Session token recebido\n");
  }
} catch (error) {
  console.log("❌ Erro no SignIn:", error.message, "\n");
}

// Teste 4: Verificar tabela de usuários
console.log("📋 TESTE 4: Verificar dados no banco\n");

try {
  const { data, error, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.log("❌ Erro ao acessar profiles:", error.message);
  } else {
    console.log("✅ Tabela profiles acessível");
    console.log("   Total de registros:", count, "\n");
  }
} catch (error) {
  console.log("❌ Erro:", error.message, "\n");
}

console.log("════════════════════════════════════════════\n");
console.log("PRÓXIMOS PASSOS:");
console.log("1. Acesse: https://app.supabase.com");
console.log("2. Vá para: Settings → Authentication");
console.log("3. Verifique se Email/Password está ATIVADO");
console.log('4. Desabilite "Require email confirmation" se necessário');
console.log("5. Verifique as políticas de segurança (RLS)");
console.log("\n");
