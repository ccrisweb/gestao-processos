/**
 * Script de teste de conexão com o Supabase
 * Execute com: node test-supabase-connection.js
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://itkxfqmsgroyxdoalvph.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0a3hmcW1zZ3JveXhkb2FsdnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzgxMzcsImV4cCI6MjA4MzExNDEzN30.XTkvG9MP-XZzsaH4D9FUbpa91TLOMDKsD3FP-SFLCE0";

console.log("=".repeat(60));
console.log("TESTE DE CONEXÃO SUPABASE");
console.log("=".repeat(60));

console.log("\n1. Verificando URL e Chave...");
console.log("   URL:", supabaseUrl);
console.log(
  "   Chave (primeiros 50 chars):",
  supabaseKey.substring(0, 50) + "..."
);

// Test basic connectivity
console.log("\n2. Testando conectividade básica com fetch...");

try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
    },
    signal: controller.signal,
  })
    .then((response) => {
      clearTimeout(timeoutId);
      console.log("   ✅ Resposta recebida!");
      console.log("   Status:", response.status);
      console.log("   OK");
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      console.log("   ❌ Erro ao conectar!");
      console.log("   Erro:", error.message);
      console.log("");
      console.log("   Possíveis causas:");
      console.log("   - Firewall bloqueando conexões ao Supabase");
      console.log("   - VPN/Proxy alterando requisições");
      console.log("   - Credenciais inválidas");
      console.log("   - Projeto Supabase desativado");
    });
} catch (error) {
  console.log("   ❌ Erro crítico:", error.message);
}

// Test with supabase client
console.log("\n3. Testando com cliente Supabase...");

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

console.log("   Aguarde...");

const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Timeout após 10 segundos")), 10000)
);

Promise.race([
  supabase.from("complaints").select("count").limit(1),
  timeoutPromise,
])
  .then(({ data, error }) => {
    if (error) {
      console.log("   ❌ Erro na query:", error.message);
    } else {
      console.log("   ✅ Query bem-sucedida!");
      console.log("   Dados:", data);
    }
  })
  .catch((error) => {
    console.log("   ❌ Erro:", error.message);
    console.log("");
    console.log("   Ações recomendadas:");
    console.log(
      "   1. Verifique se o Supabase está acessível em https://app.supabase.com"
    );
    console.log("   2. Confirme que as credenciais no .env estão corretas");
    console.log(
      "   3. Verifique o status do Supabase em https://status.supabase.com"
    );
    console.log("   4. Tente reiniciar o servidor de desenvolvimento");
    console.log(
      "   5. Verifique se há um firewall/antivírus bloqueando a conexão"
    );
  });
