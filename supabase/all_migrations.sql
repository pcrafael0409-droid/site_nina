-- DANGER: Drops everything to start from scratch
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

DROP TABLE IF EXISTS public.pagamentos CASCADE;
DROP TABLE IF EXISTS public.pedidos CASCADE;
DROP TABLE IF EXISTS public.cardapios CASCADE;
DROP TABLE IF EXISTS public.configuracoes CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS pedido_status CASCADE;
DROP TYPE IF EXISTS pagamento_status CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('aluno', 'responsavel', 'funcionario', 'admin');
CREATE TYPE pedido_status AS ENUM ('pendente', 'pago', 'cancelado', 'entregue');
CREATE TYPE pagamento_status AS ENUM ('pendente', 'aprovado', 'recusado');

-- Create tables
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    nome_completo TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'aluno',
    turma TEXT,
    turno TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.cardapios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_inicio_semana DATE NOT NULL UNIQUE,
    prato_principal TEXT NOT NULL,
    acompanhamentos TEXT,
    valor_diario NUMERIC(10, 2) NOT NULL,
    imagem_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    cardapio_id UUID NOT NULL REFERENCES public.cardapios(id) ON DELETE RESTRICT,
    dias_semana INTEGER[] NOT NULL,
    data_pedido TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status pedido_status NOT NULL DEFAULT 'pendente',
    valor_total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL,
    status pagamento_status NOT NULL DEFAULT 'pendente',
    transacao_id TEXT,
    qr_code TEXT,
    qr_code_base64 TEXT,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.configuracoes (
    id SERIAL PRIMARY KEY,
    preco_padrao NUMERIC(10, 2) NOT NULL DEFAULT 15.00,
    horario_limite_pedido TIME NOT NULL DEFAULT '08:00:00',
    dias_antecedencia INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Default config row
INSERT INTO public.configuracoes (preco_padrao, horario_limite_pedido, dias_antecedencia) VALUES (15.00, '08:00:00', 1);



-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome_completo, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'aluno'::public.user_role)
  );
  RETURN new;
END;
$$;

-- Trigger for auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper function to break infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role::text FROM public.usuarios WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardapios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Usuarios
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Funcionários e Admins podem ver todos os usuários" ON public.usuarios
    FOR SELECT USING (public.get_user_role() IN ('funcionario', 'admin'));

CREATE POLICY "Admins podem atualizar usuários" ON public.usuarios
    FOR UPDATE USING (public.get_user_role() = 'admin');

-- Cardapios
CREATE POLICY "Qualquer usuário logado pode ver cardápios" ON public.cardapios
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem gerenciar cardápios" ON public.cardapios
    FOR ALL USING (public.get_user_role() = 'admin');

-- Pedidos
CREATE POLICY "Usuários podem ver seus próprios pedidos" ON public.pedidos
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem criar seus próprios pedidos" ON public.pedidos
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários podem cancelar (update) seus próprios pedidos pendentes" ON public.pedidos
    FOR UPDATE USING (usuario_id = auth.uid() AND status = 'pendente');

CREATE POLICY "Funcionários e Admins podem ver todos os pedidos" ON public.pedidos
    FOR SELECT USING (public.get_user_role() IN ('funcionario', 'admin'));

CREATE POLICY "Funcionários podem atualizar status dos pedidos" ON public.pedidos
    FOR UPDATE USING (public.get_user_role() = 'funcionario');
    
CREATE POLICY "Admins podem gerenciar todos os pedidos" ON public.pedidos
    FOR ALL USING (public.get_user_role() = 'admin');

-- Pagamentos
CREATE POLICY "Usuários podem ver pagamentos de seus pedidos" ON public.pagamentos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pedidos WHERE pedidos.id = pagamentos.pedido_id AND pedidos.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar pagamentos para seus pedidos" ON public.pagamentos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pedidos WHERE pedidos.id = pagamentos.pedido_id AND pedidos.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Admins e Funcionários podem ver todos os pagamentos" ON public.pagamentos
    FOR SELECT USING (public.get_user_role() IN ('funcionario', 'admin'));

-- Configuracoes
CREATE POLICY "Todos podem ler configurações" ON public.configuracoes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem alterar configurações" ON public.configuracoes
    FOR ALL USING (public.get_user_role() = 'admin');
-- Refatoração: Cardápio Fixo por Dia da Semana

BEGIN;

-- 1. Limpar dados existentes pois a estrutura mudou drasticamente
DELETE FROM public.pagamentos;
DELETE FROM public.pedidos;
DELETE FROM public.cardapios;

-- 2. Alterar tabela cardapios
ALTER TABLE public.cardapios DROP COLUMN data_inicio_semana CASCADE;
ALTER TABLE public.cardapios ADD COLUMN dia_semana INTEGER NOT NULL UNIQUE CHECK (dia_semana BETWEEN 1 AND 5);

-- 3. Alterar tabela pedidos
ALTER TABLE public.pedidos DROP COLUMN cardapio_id CASCADE;

-- 4. Inserir os 5 dias padrão na tabela (1 = Segunda, 5 = Sexta)
INSERT INTO public.cardapios (dia_semana, prato_principal, acompanhamentos, valor_diario, ativo)
VALUES 
  (1, 'A definir', '...', 15.00, true),
  (2, 'A definir', '...', 15.00, true),
  (3, 'A definir', '...', 15.00, true),
  (4, 'A definir', '...', 15.00, true),
  (5, 'A definir', '...', 15.00, true);

COMMIT;
BEGIN;

-- Limpar todos os pagamentos e pedidos antigos
DELETE FROM public.pagamentos;
DELETE FROM public.pedidos;

COMMIT;
-- Adiciona coluna de desconto para professores
ALTER TABLE public.configuracoes 
ADD COLUMN IF NOT EXISTS desconto_professor_percentual NUMERIC(5, 2) NOT NULL DEFAULT 0.00;
-- Adiciona a coluna pontos_fidelidade na tabela usuarios
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS pontos_fidelidade integer DEFAULT 0;

-- Adiciona a coluna pontos_usados na tabela pedidos
ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS pontos_usados integer DEFAULT 0;
