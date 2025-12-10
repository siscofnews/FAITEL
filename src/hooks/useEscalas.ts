import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface LiturgicalFunction {
  id: string;
  church_id: string;
  name: string;
  description: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  church_id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_day_of_week: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Schedule {
  id: string;
  event_id: string;
  member_id: string;
  function_id: string;
  scheduled_date: string;
  notes: string | null;
  status: "pending" | "confirmed" | "declined";
  created_at: string;
  event?: Event;
  member?: { id: string; full_name: string };
  function?: LiturgicalFunction;
}

export function useLiturgicalFunctions(churchId?: string) {
  return useQuery({
    queryKey: ["liturgical-functions", churchId],
    queryFn: async () => {
      let query = supabase
        .from("liturgical_functions")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (churchId) {
        query = query.eq("church_id", churchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LiturgicalFunction[];
    },
  });
}

export function useEvents(churchId?: string) {
  return useQuery({
    queryKey: ["events", churchId],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (churchId) {
        query = query.eq("church_id", churchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useSchedules(churchId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["schedules", churchId, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("schedules")
        .select(`
          *,
          event:events(*),
          member:members(id, full_name),
          function:liturgical_functions(*)
        `)
        .order("scheduled_date", { ascending: true });

      if (startDate) {
        query = query.gte("scheduled_date", startDate);
      }
      if (endDate) {
        query = query.lte("scheduled_date", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Schedule[];
    },
  });
}

export function useCreateLiturgicalFunction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<LiturgicalFunction, "id" | "created_at">) => {
      const { data: result, error } = await supabase
        .from("liturgical_functions")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liturgical-functions"] });
      toast.success("Função criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar função: " + error.message);
    },
  });
}

export function useUpdateLiturgicalFunction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<LiturgicalFunction> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("liturgical_functions")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liturgical-functions"] });
      toast.success("Função atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar função: " + error.message);
    },
  });
}

export function useDeleteLiturgicalFunction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("liturgical_functions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liturgical-functions"] });
      toast.success("Função excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir função: " + error.message);
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Event, "id" | "created_at">) => {
      const { data: result, error } = await supabase
        .from("events")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar evento: " + error.message);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Event> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("events")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar evento: " + error.message);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir evento: " + error.message);
    },
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Schedule, "id" | "created_at" | "event" | "member" | "function">) => {
      const { data: result, error } = await supabase
        .from("schedules")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Escala criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar escala: " + error.message);
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Schedule> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("schedules")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Escala atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar escala: " + error.message);
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Escala excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir escala: " + error.message);
    },
  });
}
