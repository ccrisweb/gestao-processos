# Configuração de GitHub Secrets

Para que o deploy automático para GitHub Pages funcione corretamente com Supabase, você precisa configurar dois secrets no repositório:

## Passos:

1. Acesse seu repositório no GitHub: https://github.com/ccrisweb/gestao_processos
2. Vá para **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret** e adicione:

### Secret 1: VITE_SUPABASE_URL

- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://itkxfqmsgroyxdoalvph.supabase.co`

### Secret 2: VITE_SUPABASE_ANON_KEY

- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** (Cole sua chave anonima do Supabase de `.env`)

## Encontrar suas credenciais Supabase:

- **URL:** Vá para https://supabase.com > seu projeto > **Settings** > **API** > **Project URL**
- **Anon Key:** Mesmo local > **Project API keys** > **anon**

Após configurar, o próximo push para `main` acionará o workflow de deploy automaticamente e a aplicação estará disponível em: https://ccrisweb.github.io/gestao_processos/

## Nota de Segurança:

Essas credenciais são públicas por natureza (é a anon key), mas **nunca** commite seu arquivo `.env` no Git. Certifique-se de que `.env` está no `.gitignore`.
