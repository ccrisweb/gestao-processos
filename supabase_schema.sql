-- Create a table for public profiles (optional, for role management)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);

-- Toggle RLS on profiles
alter table profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create the main complaints table
create table complaints (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Grupo 1 - DADOS DA DENÚNCIA
  data_denuncia date not null,
  diligencia text, -- e.g. "1ª", "2ª"
  descricao text,
  atendimento text, -- Enum-like string
  numero_atendimento text, -- "0000/aaaa"
  
  -- Grupo 2 - ENDEREÇO
  rua_tipo text, -- "Rua", "Avenida", etc.
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  
  -- Grupo 3 - AÇÃO DA FISCALIZAÇÃO
  no_local text, -- "Atendido", "Constatado", etc.
  acao_tomada text, -- "ACI-Multa", "Embargado", etc.
  numero_autuacao text,
  autuado text,
  cpf_cnpj text,
  recebido_por text,
  
  -- Grupo 4 - PRAZOS
  prazo_inicial int default 0, -- dias corridos
  data_inicial date,
  data_final date, -- Calculated in app, stored for querying
  prorrogacao int default 0, -- dias corridos
  prorrogado_ate date, -- Calculated in app, stored for querying
  -- Situacao is derived from dates
  
  -- Grupo 5 - IDENTIFICAÇÃO
  categoria text,
  fiscais_atuantes text,
  observacao text,
  
  -- Grupo 6 - MULTA
  numero_aci text,
  data_aci date
);

-- Enable RLS
alter table complaints enable row level security;

-- Policies for Complaints
-- Everyone can read (or restrict to authenticated?)
create policy "Complaints are viewable by authenticated users." on complaints
  for select using (auth.role() = 'authenticated');

-- Only Admins (or maybe all auth users?) can insert/update. 
-- For now, let's allow all authenticated users to edit, as per "Multiusuários" requirement not strictly separating write access yet, 
-- but usually "Admin" controls sensitive actions. The user said "PERFIS de ADMIN / USUÁRIO". 
-- Let's assume Users can View/Edit, Admin can Delete/Manage everything?
-- Or maybe Users can only View? 
-- "Multiusuários (PERFIS de ADMIN / USUÁRIO)" usually implies access control.
-- Assumption: Admin = Full Access, User = View Only (or View + limited Edit?).
-- Let's start with: Authenticated can Insert/Update.
create policy "Authenticated users can insert complaints." on complaints
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update complaints." on complaints
  for update using (auth.role() = 'authenticated');

create policy "Only Admins can delete complaints." on complaints
  for delete using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
