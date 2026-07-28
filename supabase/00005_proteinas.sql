-- Adicionar opções de proteína na tabela configuracoes e nas opções de pedidos
BEGIN;

ALTER TABLE public.configuracoes 
ADD COLUMN IF NOT EXISTS opcoes_proteina TEXT[] DEFAULT ARRAY['Tradicional', 'Vegetariano']::TEXT[];

ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS proteinas JSONB DEFAULT '{}'::jsonb;

COMMIT;
