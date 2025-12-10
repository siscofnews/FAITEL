import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ServiceType {
  id: string;
  church_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ScheduleAssignmentType {
  id: string;
  church_id: string;
  name: string;
  description: string | null;
  requires_youtube_link: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface WorshipSchedule {
  id: string;
  church_id: string;
  service_type_id: string | null;
  scheduled_date: string;
  start_time: string | null;
  status: "open" | "closed";
  offering_amount: number | null;
  tithe_amount: number | null;
  conferente_name: string | null;
  closed_at: string | null;
  closed_by: string | null;
  notes: string | null;
  created_at: string;
  service_type?: ServiceType;
}

export interface WorshipScheduleAssignment {
  id: string;
  worship_schedule_id: string;
  assignment_type_id: string;
  member_id: string | null;
  member_role: string | null;
  youtube_link: string | null;
  attended: boolean | null;
  absence_reason: string | null;
  absence_notified: boolean;
  notes: string | null;
  created_at: string;
  assignment_type?: ScheduleAssignmentType;
  member?: { id: string; full_name: string; role: string | null };
}

// Service Types hooks
export function useServiceTypes(churchId?: string) {
  return useQuery({
    queryKey: ["service-types", churchId],
    queryFn: async () => {
      if (!churchId) return [];
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("church_id", churchId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as ServiceType[];
    },
    enabled: !!churchId,
  });
}

export function useCreateServiceType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { church_id: string; name: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from("service_types")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      toast.success("Tipo de culto criado!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}

export function useDeleteServiceType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      toast.success("Tipo de culto excluído!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}

// Assignment Types hooks
export function useAssignmentTypes(churchId?: string) {
  return useQuery({
    queryKey: ["assignment-types", churchId],
    queryFn: async () => {
      if (!churchId) return [];
      const { data, error } = await supabase
        .from("schedule_assignment_types")
        .select("*")
        .eq("church_id", churchId)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as ScheduleAssignmentType[];
    },
    enabled: !!churchId,
  });
}

export function useCreateAssignmentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { church_id: string; name: string; description?: string; requires_youtube_link?: boolean; sort_order?: number }) => {
      const { data: result, error } = await supabase
        .from("schedule_assignment_types")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-types"] });
      toast.success("Tipo de função criado!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}

export function useDeleteAssignmentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_assignment_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-types"] });
      toast.success("Tipo de função excluído!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}

// Worship Schedules hooks
export function useWorshipSchedules(churchId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["worship-schedules", churchId, startDate, endDate],
    queryFn: async () => {
      if (!churchId) return [];
      let query = supabase
        .from("worship_schedules")
        .select(`*, service_type:service_types(*)`)
        .eq("church_id", churchId)
        .order("scheduled_date", { ascending: false });

      if (startDate) query = query.gte("scheduled_date", startDate);
      if (endDate) query = query.lte("scheduled_date", endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data as WorshipSchedule[];
    },
    enabled: !!churchId,
  });
}

export function useCreateWorshipSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { church_id: string; service_type_id?: string; scheduled_date: string; start_time?: string; notes?: string }) => {
      const { data: result, error } = await supabase
        .from("worship_schedules")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-schedules"] });
      toast.success("Escala de culto criada!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}

export function useUpdateWorshipSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<WorshipSchedule> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("worship_schedules")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-schedules"] });
      toast.success("Escala atualizada!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}

export function useDeleteWorshipSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("worship_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-schedules"] });
      toast.success("Escala excluída!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}

// Schedule Assignments hooks
export function useScheduleAssignments(worshipScheduleId?: string) {
  return useQuery({
    queryKey: ["schedule-assignments", worshipScheduleId],
    queryFn: async () => {
      if (!worshipScheduleId) return [];
      const { data, error } = await supabase
        .from("worship_schedule_assignments")
        .select(`*, assignment_type:schedule_assignment_types(*), member:members(id, full_name, role)`)
        .eq("worship_schedule_id", worshipScheduleId)
        .order("created_at");
      if (error) throw error;
      return data as WorshipScheduleAssignment[];
    },
    enabled: !!worshipScheduleId,
  });
}

export function useCreateScheduleAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { worship_schedule_id: string; assignment_type_id: string; member_id?: string; member_role?: string; youtube_link?: string; notes?: string }) => {
      const { data: result, error } = await supabase
        .from("worship_schedule_assignments")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-assignments"] });
      toast.success("Atribuição adicionada!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}

export function useUpdateScheduleAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<WorshipScheduleAssignment> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("worship_schedule_assignments")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-assignments"] });
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}

export function useDeleteScheduleAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("worship_schedule_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-assignments"] });
      toast.success("Atribuição removida!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}

// Close worship schedule
export function useCloseWorshipSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; offering_amount: number; tithe_amount: number; conferente_name: string; closed_by: string }) => {
      const { data: result, error } = await supabase
        .from("worship_schedules")
        .update({
          status: "closed",
          offering_amount: data.offering_amount,
          tithe_amount: data.tithe_amount,
          conferente_name: data.conferente_name,
          closed_by: data.closed_by,
          closed_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-schedules"] });
      toast.success("Culto encerrado com sucesso!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });
}
