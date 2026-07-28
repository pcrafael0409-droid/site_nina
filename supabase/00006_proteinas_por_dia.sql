-- Adicionar opções de proteína na tabela cardapios
BEGIN;

ALTER TABLE public.cardapios 
ADD COLUMN IF NOT EXISTS proteina_1 TEXT;

ALTER TABLE public.cardapios 
ADD COLUMN IF NOT EXISTS proteina_2 TEXT;

COMMIT;
