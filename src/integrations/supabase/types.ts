export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assignment_roles: {
        Row: {
          category: string
          created_at: string
          id: string
          is_multiple: boolean | null
          is_system_default: boolean | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_multiple?: boolean | null
          is_system_default?: boolean | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_multiple?: boolean | null
          is_system_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      schedule_permissions: {
        Row: {
          can_delete_scale: boolean | null
          can_edit_departments: boolean | null
          can_edit_financial: boolean | null
          can_edit_ministry: boolean | null
          can_edit_scale: boolean | null
          can_edit_worship: boolean | null
          can_manage_permissions: boolean | null
          can_view_financial: boolean | null
          can_view_reports: boolean | null
          can_view_scale: boolean | null
          can_view_subunits: boolean | null
          church_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_delete_scale?: boolean | null
          can_edit_departments?: boolean | null
          can_edit_financial?: boolean | null
          can_edit_ministry?: boolean | null
          can_edit_scale?: boolean | null
          can_edit_worship?: boolean | null
          can_manage_permissions?: boolean | null
          can_view_financial?: boolean | null
          can_view_reports?: boolean | null
          can_view_scale?: boolean | null
          can_view_subunits?: boolean | null
          church_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_delete_scale?: boolean | null
          can_edit_departments?: boolean | null
          can_edit_financial?: boolean | null
          can_edit_ministry?: boolean | null
          can_edit_scale?: boolean | null
          can_edit_worship?: boolean | null
          can_manage_permissions?: boolean | null
          can_view_financial?: boolean | null
          can_view_reports?: boolean | null
          can_view_scale?: boolean | null
          can_view_subunits?: boolean | null
          church_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_permissions_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users" // auth.users usually not exposed here directly but logic works
            referencedColumns: ["id"]
          }
        ]
      }
      cells: {
        Row: {
          church_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          church_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cells_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cells_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          }
        ]
      }
      church_movement_history: {
        Row: {
          church_id: string
          church_name: string
          created_at: string
          id: string
          moved_by: string
          moved_by_name: string | null
          new_parent_id: string
          new_parent_name: string
          previous_parent_id: string | null
          previous_parent_name: string | null
        }
        Insert: {
          church_id: string
          church_name: string
          created_at?: string
          id?: string
          moved_by: string
          moved_by_name?: string | null
          new_parent_id: string
          new_parent_name: string
          previous_parent_id?: string | null
          previous_parent_name?: string | null
        }
        Update: {
          church_id?: string
          church_name?: string
          created_at?: string
          id?: string
          moved_by?: string
          moved_by_name?: string | null
          new_parent_id?: string
          new_parent_name?: string
          previous_parent_id?: string | null
          previous_parent_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "church_movement_history_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_movement_history_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_movement_history_new_parent_id_fkey"
            columns: ["new_parent_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_movement_history_new_parent_id_fkey"
            columns: ["new_parent_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_movement_history_previous_parent_id_fkey"
            columns: ["previous_parent_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_movement_history_previous_parent_id_fkey"
            columns: ["previous_parent_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          cep: string | null
          cidade: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          last_payment_date: string | null
          logo_url: string | null
          nivel: Database["public"]["Enums"]["church_level"]
          nome_fantasia: string
          parent_church_id: string | null
          pastor_presidente_id: string | null
          pastor_presidente_nome: string | null
          telefone: string | null
          updated_at: string
          valor_sistema: number | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          last_payment_date?: string | null
          logo_url?: string | null
          nivel: Database["public"]["Enums"]["church_level"]
          nome_fantasia: string
          parent_church_id?: string | null
          pastor_presidente_id?: string | null
          pastor_presidente_nome?: string | null
          telefone?: string | null
          updated_at?: string
          valor_sistema?: number | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          last_payment_date?: string | null
          logo_url?: string | null
          nivel?: Database["public"]["Enums"]["church_level"]
          nome_fantasia?: string
          parent_church_id?: string | null
          pastor_presidente_id?: string | null
          pastor_presidente_nome?: string | null
          telefone?: string | null
          updated_at?: string
          valor_sistema?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "churches_parent_church_id_fkey"
            columns: ["parent_church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "churches_parent_church_id_fkey"
            columns: ["parent_church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          church_id: string
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string | null
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          location: string | null
          name: string
          recurrence_day_of_week: number | null
          recurrence_pattern: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          church_id: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          name: string
          recurrence_day_of_week?: number | null
          recurrence_pattern?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          name?: string
          recurrence_day_of_week?: number | null
          recurrence_pattern?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          church_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used_at: string | null
        }
        Insert: {
          church_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used_at?: string | null
        }
        Update: {
          church_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      liturgical_functions: {
        Row: {
          church_id: string
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          church_id: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          church_id?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "liturgical_functions_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liturgical_functions_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          avatar_url: string | null
          baptism_date: string | null
          baptized: boolean | null
          birth_date: string | null
          cep: string | null
          church_id: string
          city: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          marital_status: string | null
          membership_date: string | null
          notes: string | null
          phone: string | null
          role: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          baptism_date?: string | null
          baptized?: boolean | null
          birth_date?: string | null
          cep?: string | null
          church_id: string
          city?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          marital_status?: string | null
          membership_date?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          baptism_date?: string | null
          baptized?: boolean | null
          birth_date?: string | null
          cep?: string | null
          church_id?: string
          city?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          marital_status?: string | null
          membership_date?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          church_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          payment_date: string
          payment_method: string | null
          pix_transaction_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          church_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          pix_transaction_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          church_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          pix_transaction_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_assignment_types: {
        Row: {
          church_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          requires_youtube_link: boolean | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          church_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_youtube_link?: boolean | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_youtube_link?: boolean | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_assignment_types_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignment_types_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          event_id: string
          function_id: string
          id: string
          member_id: string
          notes: string | null
          scheduled_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          function_id: string
          id?: string
          member_id: string
          notes?: string | null
          scheduled_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          function_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "liturgical_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          church_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          church_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_types_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          church_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_hourly_stats: {
        Row: {
          created_at: string
          id: string
          page_path: string
          updated_at: string
          visit_count: number
          visit_date: string
          visit_hour: number
        }
        Insert: {
          created_at?: string
          id?: string
          page_path?: string
          updated_at?: string
          visit_count?: number
          visit_date?: string
          visit_hour: number
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          updated_at?: string
          visit_count?: number
          visit_date?: string
          visit_hour?: number
        }
        Relationships: []
      }
      visitor_stats: {
        Row: {
          created_at: string
          id: string
          page_path: string
          updated_at: string
          visit_count: number
          visit_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_path?: string
          updated_at?: string
          visit_count?: number
          visit_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          updated_at?: string
          visit_count?: number
          visit_date?: string
        }
        Relationships: []
      }
      worship_schedule_assignments: {
        Row: {
          absence_notified: boolean | null
          absence_reason: string | null
          assignment_type_id: string
          attended: boolean | null
          created_at: string
          id: string
          member_id: string | null
          member_role: string | null
          notes: string | null
          updated_at: string
          worship_schedule_id: string
          youtube_link: string | null
        }
        Insert: {
          absence_notified?: boolean | null
          absence_reason?: string | null
          assignment_type_id: string
          attended?: boolean | null
          created_at?: string
          id?: string
          member_id?: string | null
          member_role?: string | null
          notes?: string | null
          updated_at?: string
          worship_schedule_id: string
          youtube_link?: string | null
        }
        Update: {
          absence_notified?: boolean | null
          absence_reason?: string | null
          assignment_type_id?: string
          attended?: boolean | null
          created_at?: string
          id?: string
          member_id?: string | null
          member_role?: string | null
          notes?: string | null
          updated_at?: string
          worship_schedule_id?: string
          youtube_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worship_schedule_assignments_assignment_type_id_fkey"
            columns: ["assignment_type_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worship_schedule_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worship_schedule_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worship_schedule_assignments_worship_schedule_id_fkey"
            columns: ["worship_schedule_id"]
            isOneToOne: false
            referencedRelation: "worship_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      worship_assignments: {
        Row: {
          assignment_role_id: string
          created_at: string
          custom_name: string | null
          id: string
          is_present: boolean | null
          member_id: string | null
          observation: string | null
          worship_schedule_id: string
        }
        Insert: {
          assignment_role_id: string
          created_at?: string
          custom_name?: string | null
          id?: string
          is_present?: boolean | null
          member_id?: string | null
          observation?: string | null
          worship_schedule_id: string
        }
        Update: {
          assignment_role_id?: string
          created_at?: string
          custom_name?: string | null
          id?: string
          is_present?: boolean | null
          member_id?: string | null
          observation?: string | null
          worship_schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worship_assignments_assignment_role_id_fkey"
            columns: ["assignment_role_id"]
            isOneToOne: false
            referencedRelation: "assignment_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worship_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worship_assignments_worship_schedule_id_fkey"
            columns: ["worship_schedule_id"]
            isOneToOne: false
            referencedRelation: "worship_schedules"
            referencedColumns: ["id"]
          }
        ]
      }
      worship_schedules: {
        Row: {
          attendance_count: number | null
          cell_id: string | null
          church_id: string | null
          created_at: string
          created_by: string | null
          date: string
          id: string
          notes: string | null
          offerings_value: number | null
          service_type_id: string | null
          status: Database["public"]["Enums"]["schedule_status"] | null
          time: string | null
          tithes_value: number | null
          updated_at: string
          youtube_links: Json | null
        }
        Insert: {
          attendance_count?: number | null
          cell_id?: string | null
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          id?: string
          notes?: string | null
          offerings_value?: number | null
          service_type_id?: string | null
          status?: Database["public"]["Enums"]["schedule_status"] | null
          time?: string | null
          tithes_value?: number | null
          updated_at?: string
          youtube_links?: Json | null
        }
        Update: {
          attendance_count?: number | null
          cell_id?: string | null
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          offerings_value?: number | null
          service_type_id?: string | null
          status?: Database["public"]["Enums"]["schedule_status"] | null
          time?: string | null
          tithes_value?: number | null
          updated_at?: string
          youtube_links?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "worship_schedules_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worship_schedules_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      churches_public: {
        Row: {
          cidade: string | null
          estado: string | null
          id: string | null
          logo_url: string | null
          nivel: Database["public"]["Enums"]["church_level"] | null
          nome_fantasia: string | null
        }
        Insert: {
          cidade?: string | null
          estado?: string | null
          id?: string | null
          logo_url?: string | null
          nivel?: Database["public"]["Enums"]["church_level"] | null
          nome_fantasia?: string | null
        }
        Update: {
          cidade?: string | null
          estado?: string | null
          id?: string | null
          logo_url?: string | null
          nivel?: Database["public"]["Enums"]["church_level"] | null
          nome_fantasia?: string | null
        }
        Relationships: []
      }
      members_public: {
        Row: {
          avatar_url: string | null
          church_id: string | null
          full_name: string | null
          id: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          church_id?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          church_id?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_initial_pastor_role: {
        Args: { _church_id: string; _user_id: string }
        Returns: boolean
      }
      get_accessible_church_ids: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_auth_user_email: { Args: never; Returns: string }
      get_total_visitors: { Args: { p_page_path?: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_hourly_visitor_count: {
        Args: { p_page_path?: string }
        Returns: number
      }
      increment_visitor_count: {
        Args: { p_page_path?: string }
        Returns: number
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      use_invitation: {
        Args: { _token: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
      | "super_admin"
      | "pastor_presidente"
      | "pastor"
      | "lider"
      | "membro"
      church_level: "matriz" | "sede" | "subsede" | "congregacao" | "celula"
      schedule_status: "draft" | "published" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "pastor_presidente",
        "pastor",
        "lider",
        "membro",
      ],
      church_level: ["matriz", "sede", "subsede", "congregacao", "celula"],
      schedule_status: ["draft", "published", "completed"],
    },
  },
} as const
