import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PermissionsHook {
    userLevel: string | null;
    isAdmin: boolean;
    isManipulator: boolean;
    canDelegate: boolean;
    isSuperAdmin: boolean;
    churchId: string | null;
    accessibleChurches: string[];
    isLoading: boolean;
    reload: () => Promise<void>;
}

export function usePermissions(): PermissionsHook {
    const [userLevel, setUserLevel] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isManipulator, setIsManipulator] = useState(false);
    const [canDelegate, setCanDelegate] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [churchId, setChurchId] = useState<string | null>(null);
    const [accessibleChurches, setAccessibleChurches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadPermissions = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Pega roles do usuário
            const { data: rolesData } = await supabase
                .from('user_roles')
                .select('role, is_manipulator, church_id')
                .eq('user_id', user.id);

            // Cast to any to avoid TS errors with potentially missing generated types
            const roles = rolesData as any[];

            if (roles && roles.length > 0) {
                // Verifica roles
                const hasAdminRole = roles.some(r =>
                    ['pastor_presidente', 'super_admin'].includes(r.role)
                );
                // is_super_admin column doesn't exist, rely on role
                const hasSuperAdmin = roles.some(r => r.role === 'super_admin');
                const hasManipulator = roles.some(r => r.is_manipulator);
                const canDelegateRole = roles.some(r =>
                    ['pastor_presidente', 'super_admin'].includes(r.role)
                );

                setIsAdmin(hasAdminRole);
                setIsSuperAdmin(hasSuperAdmin);
                setIsManipulator(hasManipulator);
                setCanDelegate(canDelegateRole);

                // Pega primeira igreja encontrada
                const mainRole = roles.find(r => r.church_id) || roles[0];
                if (mainRole?.church_id) {
                    setChurchId(mainRole.church_id);

                    // Pega nível da igreja

                    const { data: church } = await supabase
                        .from('churches')
                        .select('nivel')
                        .eq('id', mainRole.church_id)
                        .single();

                    if (church) {
                        setUserLevel(church.nivel);
                    }

                    // Pega igrejas acessíveis (hierarquia)
                    // @ts-ignore
                    const { data: accessibleIds } = await supabase
                        .rpc('get_user_accessible_churches', {
                            p_user_id: user.id
                        });

                    if (accessibleIds) {
                        setAccessibleChurches(accessibleIds as unknown as string[]);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading permissions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPermissions();
    }, []);

    return {
        userLevel,
        isAdmin,
        isManipulator,
        canDelegate,
        isSuperAdmin,
        churchId,
        accessibleChurches,
        isLoading,
        reload: loadPermissions,
    };
}
