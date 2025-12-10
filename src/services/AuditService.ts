import { supabase } from "@/integrations/supabase/client";

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'GRANT_PERMISSION' | 'REVOKE_PERMISSION' | 'EXPORT_DATA';
export type AuditEntity = 'MEMBER' | 'SCHEDULE' | 'FINANCIAL' | 'USER' | 'SYSTEM' | 'CHURCH';

interface LogEntry {
    action: AuditAction;
    entity: AuditEntity;
    entity_id?: string;
    details?: any;
    church_id?: string;
}

export const AuditService = {
    /**
     * Logs a system action to the database.
     * This is a "fire and forget" operation usually, but we return the promise if needed.
     */
    logAction: async ({ action, entity, entity_id, details, church_id }: LogEntry) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // Anonymous actions might not be logged or handled differently

            const { error } = await supabase
                .from("system_logs" as any)
                .insert({
                    user_id: user.id,
                    church_id: church_id, // Can be null for system-wide actions
                    action,
                    entity,
                    entity_id,
                    details,
                });

            if (error) {
                console.error("Failed to log action:", error);
            }
        } catch (err) {
            console.error("Error in audit logging:", err);
        }
    },

    /**
     * Fetches audit logs for admins.
     */
    getLogs: async (churchId?: string, limit = 50) => {
        let query = supabase
            .from("system_logs" as any)
            .select(`
        *,
        user:user_id(email),
        church:church_id(nome_fantasia)
      `)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (churchId) {
            query = query.eq("church_id", churchId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }
};
