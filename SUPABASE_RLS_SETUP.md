# Supabase RLS Policies Setup

## ⚠️ CRÍTICO - Execute estas configurações no seu Projeto Supabase

### 1. Acessar o Supabase

1. Vá para: https://app.supabase.com/project/itkxfqmsgroyxdoalvph
2. Navegue até **Authentication → Policies** (ou **SQL Editor**)

### 2. Criar Tabela 'complaints' (se não existir)

```sql
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_denuncia DATE NOT NULL,
  diligencia TEXT,
  descricao TEXT NOT NULL,
  atendimento TEXT,
  numero_atendimento TEXT,
  rua_tipo TEXT,
  logradouro TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  bairro TEXT NOT NULL,
  categoria TEXT,
  fiscal TEXT,
  acao_tomada TEXT,
  data_inicial DATE,
  data_final DATE NOT NULL,
  prorrogacao_dias INTEGER DEFAULT 0,
  prorrogado_ate DATE,
  prazo_dias INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Aberto',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_bairro ON public.complaints(bairro);
```

### 3. Criar Tabela 'profiles'

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
```

### 4. Habilitar RLS (Row Level Security)

```sql
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 5. Criar Políticas RLS para 'complaints'

#### Política 1: Usuários podem ver seus próprios registros

```sql
CREATE POLICY "Users can view own complaints"
ON public.complaints FOR SELECT
USING (auth.uid() = user_id);
```

#### Política 2: Usuários podem criar registros

```sql
CREATE POLICY "Users can create complaints"
ON public.complaints FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### Política 3: Usuários podem atualizar seus próprios registros

```sql
CREATE POLICY "Users can update own complaints"
ON public.complaints FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### Política 4: Admins podem ver todos os registros

```sql
CREATE POLICY "Admins can view all complaints"
ON public.complaints FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

#### Política 5: Admins podem deletar registros

```sql
CREATE POLICY "Admins can delete complaints"
ON public.complaints FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### 6. Criar Políticas RLS para 'profiles'

#### Política 1: Usuários podem ver seu próprio perfil

```sql
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);
```

#### Política 2: Admins podem ver todos os perfis

```sql
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### 7. Criar Trigger para 'profiles'

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF NOT EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 8. Teste a Configuração

1. No Supabase, vá ao **SQL Editor**
2. Execute a query para verificar:

```sql
SELECT * FROM public.complaints LIMIT 1;
SELECT * FROM public.profiles LIMIT 1;
```

3. Se retornar erro de RLS, as políticas estão funcionando ✅

## ⚠️ ATIVAÇÃO DO PROJETO

Certifique-se que seu projeto Supabase está **ativo**:

1. Dashboard → Settings → Paused Projects
2. Se o projeto estiver pausado, clique em "Resume"

## Verificação de Conexão

Após configurar, execute no console do navegador:

```javascript
const { supabase } = await import(
  "https://itkxfqmsgroyxdoalvph.supabase.co/..."
);
const { data, error } = await supabase.from("complaints").select("*").limit(1);
console.log(error || data);
```
