import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { WorshipScheduleService } from "@/services/WorshipScheduleService";
import { supabase } from "@/integrations/supabase/client";

export interface SchedulePermissions {
    can_view_scale: boolean;
    can_edit_scale: boolean;
    can_delete_scale: boolean;

    can_edit_worship: boolean;
    can_edit_ministry: boolean;
    can_edit_departments: boolean;

    can_edit_financial: boolean;
    can_view_financial: boolean;
    can_view_reports: boolean;

    can_manage_permissions: boolean;
    can_view_subunits: boolean;
}

const NO_PERMISSIONS: SchedulePermissions = {
    can_view_scale: false,
    can_edit_scale: false,
    can_delete_scale: false,
    can_edit_worship: false,
    can_edit_ministry: false,
    can_edit_departments: false,
    can_edit_financial: false,
    can_view_financial: false,
    can_view_reports: false,
    can_manage_permissions: false,
    can_view_subunits: false,
};

const FULL_ACCESS: SchedulePermissions = {
    can_view_scale: true,
    can_edit_scale: true,
    can_delete_scale: true,
    can_edit_worship: true,
    can_edit_ministry: true,
    can_edit_departments: true,
    can_edit_financial: true,
    can_view_financial: true,
    can_view_reports: true,
    can_manage_permissions: true,
    can_view_subunits: true,
};

export function useSchedulePermissions(churchId: string | null) {
    const { user, isSuperAdmin } = useAuth();
    // Assuming 'isAdmin' from context implies local admin who might have full access or specific permissions.
    // Ideally user roles logic should be robust.

    return useQuery({
        queryKey: ["schedule-permissions", user?.id, churchId],
        queryFn: async (): Promise<SchedulePermissions> => {
            if (!user) return NO_PERMISSIONS;
            if (isSuperAdmin) return FULL_ACCESS;
            if (!churchId) return NO_PERMISSIONS;

            try {
                const perms = await WorshipScheduleService.getUserPermissions(user.id, churchId);
                if (perms) {
                    return perms as SchedulePermissions;
                }
            } catch (error) {
                console.error("Error fetching permissions:", error);
                // Fail safe
            }

            // Fallback: If no explicit permission row exists, 
            // check if user is an ADMIN or PASTOR (implied permission)
            // We can check if the current churchId is in the user's accessibleChurches list 
            // (which implies hierarchy access) or if they have a role.

            // Note: We need to pass the 'accessibleChurches' checking logic or roles here.
            // Since this is inside a queryFn, we can't easily access the hook state directly unless we pass it.
            // But we can fetch the user roles directly here as a fallback.

            const { data: userRoles } = await supabase
                .from('user_roles')
                .select('role, church_id')
                .eq('user_id', user.id);

            if (userRoles) {
                // If user has a high-level role for THIS church, grant access
                const hasLocalRole = userRoles.some(r =>
                    r.church_id === churchId &&
                    ['pastor_presidente', 'pastor_sede', 'pastor_regional', 'pastor_local', 'admin', 'secretario'].includes(r.role)
                );

                // Or if they are a 'pastor_presidente' (global-ish) and this church is in their hierarchy
                // (Complex to check hierarchy inside this function efficiently without the RPC cache, 
                // but usually if they are viewing it, they likely have access. 
                // Let's rely on the explicit role matching the church_id OR if they are 'pastor_presidente' of a parent).

                // For now, let's trust that if they have ONE of these roles linked to THIS church, they are good.
                if (hasLocalRole) {
                    return FULL_ACCESS;
                }
            }

            return NO_PERMISSIONS;
        },
        staleTime: 1000 * 60 * 5, // 5 mins
        // Keep previous data while fetching new data to prevent flickering
        placeholderData: (previousData: any) => previousData,
    });
}
