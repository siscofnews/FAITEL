import { supabase } from "@/integrations/supabase/client";

export interface WorshipSchedule {
    id: string;
    church_id: string;
    cell_id?: string | null;
    date: string;
    time?: string | null;
    service_type_id: string;
    youtube_links?: string[] | null;
    tithes_value?: number;
    offerings_value?: number;
    status: "draft" | "published" | "completed";
    attendance_count?: number;
    notes?: string | null;
}

export interface AssignmentRole {
    id: string;
    name: string;
    category: string;
    is_multiple: boolean;
}

export const WorshipScheduleService = {
    // 1. Fetch Service Types
    getServiceTypes: async () => {
        const { data, error } = await supabase
            .from("service_types")
            .select("*")
            .order("name");
        if (error) throw error;
        return data;
    },

    // 2. Fetch Assignment Roles
    getAssignmentRoles: async () => {
        const { data, error } = await supabase
            .from("assignment_roles")
            .select("*")
            .order("category")
            .order("name");
        if (error) throw error;
        return data;
    },

    // 3. Create Schedule
    createSchedule: async (schedule: Partial<WorshipSchedule>) => {
        const { data, error } = await supabase
            .from("worship_schedules")
            .insert(schedule)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 4. Update Schedule
    updateSchedule: async (id: string, updates: Partial<WorshipSchedule>) => {
        const { data, error } = await supabase
            .from("worship_schedules")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 5. Create Assignments
    createAssignment: async (assignment: {
        worship_schedule_id: string;
        assignment_role_id: string;
        member_id?: string | null;
        custom_name?: string | null;
        observation?: string;
    }) => {
        const { data, error } = await supabase
            .from("worship_assignments")
            .insert(assignment)
            .select();
        if (error) throw error;
        return data;
    },

    // 6. Bulk Create Assignments
    createAssignments: async (assignments: any[]) => {
        const { data, error } = await supabase
            .from("worship_assignments")
            .insert(assignments)
            .select();
        if (error) throw error;
        return data;
    },

    // 7. Get Schedule Details (with assignments)
    getScheduleById: async (id: string) => {
        const { data, error } = await supabase
            .from("worship_schedules")
            .select(`
        *,
        service_type:service_types(name),
        assignments:worship_assignments(
          id,
          assignment_role_id,
          member_id,
          custom_name,
          observation,
          role:assignment_roles(name, category),
          member:members(full_name, role)
        )
      `)
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    },

    // 8. Get User Permissions for a Church
    getUserPermissions: async (userId: string, churchId: string) => {
        const { data, error } = await supabase
            .from("schedule_permissions")
            .select("*")
            .eq("user_id", userId)
            .eq("church_id", churchId)
            .single();

        // If no row found, return null (meaning no specific permissions)
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }
};
