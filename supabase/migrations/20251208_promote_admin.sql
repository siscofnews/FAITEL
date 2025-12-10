-- 1. GARANTIR QUE AS COLUNAS DE ENDEREÇO EXISTAM (Caso ainda não tenha rodado)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'churches' AND column_name = 'numero') THEN
        ALTER TABLE public.churches ADD COLUMN numero text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'churches' AND column_name = 'bairro') THEN
        ALTER TABLE public.churches ADD COLUMN bairro text;
    END IF;
END $$;

-- 2. PROMOVER USUÁRIO PARA SUPER ADMIN
-- Substitua 'SEU_EMAIL_AQUI' pelo email que você usou no cadastro da Matriz
-- Exemplo: 'pastor@igreja.com'

UPDATE public.user_roles
SET role = 'super_admin'
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'SEU_EMAIL_AQUI'
);

-- Se o update acima não afetar nenhuma linha (caso o usuário não tenha role ainda), insira:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users 
WHERE email = 'SEU_EMAIL_AQUI'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id
);
