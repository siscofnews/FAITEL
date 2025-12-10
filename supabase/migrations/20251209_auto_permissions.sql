-- Migration: Auto Schema for Permissions
-- Date: 2025-12-09

-- 1. Ensure the function exists with correct Enums
CREATE OR REPLACE FUNCTION public.assign_initial_pastor_role(
    _user_id uuid,
    _church_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_church_level text;
    v_role public.app_role; -- Use the Enum type directly
BEGIN
    -- Get church level
    SELECT nivel INTO v_church_level FROM public.churches WHERE id = _church_id;

    -- Determine role based on church level
    -- Mapped to valid 'app_role' ENUM: ('super_admin', 'pastor_presidente', 'pastor', 'lider', 'membro')
    IF v_church_level = 'matriz' THEN
        v_role := 'pastor_presidente';
    ELSIF v_church_level IN ('sede', 'subsede', 'congregacao') THEN
        v_role := 'pastor'; -- All these levels are managed by a 'pastor'
    ELSIF v_church_level = 'celula' THEN
        v_role := 'lider';
    ELSE
        v_role := 'membro'; -- Fallback
    END IF;

    -- Insert or Update user role
    INSERT INTO public.user_roles (user_id, church_id, role)
    VALUES (_user_id, _church_id, v_role)
    ON CONFLICT (user_id, church_id) 
    DO UPDATE SET role = EXCLUDED.role;
    
    -- Also ensure they are a member with the correct role text (members table checks constraints, not enum type usually, but let's be safe)
    UPDATE public.members 
    SET role = CASE 
        WHEN v_role = 'pastor_presidente' THEN 'Pastor Presidente'
        WHEN v_role = 'pastor' THEN 'Pastor'
        WHEN v_role = 'lider' THEN 'Líder'
        ELSE 'Membro'
    END,
    cargo_eclesiastico = CASE 
        WHEN v_role = 'pastor_presidente' THEN 'pastor'
        WHEN v_role = 'pastor' THEN 'pastor'
        ELSE 'membro'
    END
    WHERE user_id = _user_id AND church_id = _church_id;

    RETURN true;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.assign_initial_pastor_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_initial_pastor_role TO service_role;
