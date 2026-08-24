export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      appointment_events: {
        Row: {
          actor_id: string | null;
          appointment_id: string;
          created_at: string;
          event_type: string;
          id: string;
          payload: Json;
          tenant_id: string;
        };
        Insert: {
          actor_id?: string | null;
          appointment_id: string;
          created_at?: string;
          event_type: string;
          id?: string;
          payload?: Json;
          tenant_id: string;
        };
        Update: {
          actor_id?: string | null;
          appointment_id?: string;
          created_at?: string;
          event_type?: string;
          id?: string;
          payload?: Json;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointment_events_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_events_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          booking_ref: string;
          branch_id: string;
          created_at: string;
          customer_id: string;
          deposit_cents: number;
          deposit_paid_cents: number;
          ends_at: string;
          id: string;
          note: string;
          price_cents: number;
          recurrence: string | null;
          resource_id: string;
          service_id: string;
          staff_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          booking_ref?: string;
          branch_id: string;
          created_at?: string;
          customer_id: string;
          deposit_cents?: number;
          deposit_paid_cents?: number;
          ends_at: string;
          id?: string;
          note?: string;
          price_cents?: number;
          recurrence?: string | null;
          resource_id: string;
          service_id: string;
          staff_id: string;
          starts_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          booking_ref?: string;
          branch_id?: string;
          created_at?: string;
          customer_id?: string;
          deposit_cents?: number;
          deposit_paid_cents?: number;
          ends_at?: string;
          id?: string;
          note?: string;
          price_cents?: number;
          recurrence?: string | null;
          resource_id?: string;
          service_id?: string;
          staff_id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      availability_rules: {
        Row: {
          created_at: string;
          end_minute: number;
          id: string;
          is_active: boolean;
          staff_id: string;
          start_minute: number;
          tenant_id: string;
          weekday: number;
        };
        Insert: {
          created_at?: string;
          end_minute: number;
          id?: string;
          is_active?: boolean;
          staff_id: string;
          start_minute: number;
          tenant_id: string;
          weekday: number;
        };
        Update: {
          created_at?: string;
          end_minute?: number;
          id?: string;
          is_active?: boolean;
          staff_id?: string;
          start_minute?: number;
          tenant_id?: string;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: "availability_rules_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "availability_rules_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      blackout_dates: {
        Row: {
          branch_id: string | null;
          created_at: string;
          ends_at: string;
          id: string;
          reason: string;
          staff_id: string | null;
          starts_at: string;
          tenant_id: string;
        };
        Insert: {
          branch_id?: string | null;
          created_at?: string;
          ends_at: string;
          id?: string;
          reason?: string;
          staff_id?: string | null;
          starts_at: string;
          tenant_id: string;
        };
        Update: {
          branch_id?: string | null;
          created_at?: string;
          ends_at?: string;
          id?: string;
          reason?: string;
          staff_id?: string | null;
          starts_at?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blackout_dates_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blackout_dates_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blackout_dates_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      branches: {
        Row: {
          address: string;
          created_at: string;
          deposit_percent: number;
          free_cancellation_hours: number;
          id: string;
          is_active: boolean;
          name: string;
          phone: string | null;
          tenant_id: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          address?: string;
          created_at?: string;
          deposit_percent?: number;
          free_cancellation_hours?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          phone?: string | null;
          tenant_id: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          created_at?: string;
          deposit_percent?: number;
          free_cancellation_hours?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          phone?: string | null;
          tenant_id?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "branches_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          notes: string;
          phone: string;
          tenant_id: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          notes?: string;
          phone: string;
          tenant_id: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          notes?: string;
          phone?: string;
          tenant_id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      memberships: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          tenant_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          tenant_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          tenant_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memberships_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_settings: {
        Row: {
          created_at: string;
          id: string;
          quiet_end_minute: number;
          quiet_start_minute: number;
          reminder_offsets_hours: number[];
          sender_name: string;
          sms_enabled: boolean;
          template_cancellation: string;
          template_confirmation: string;
          template_deposit: string;
          template_reminder: string;
          tenant_id: string;
          updated_at: string;
          whatsapp_enabled: boolean;
        };
        Insert: {
          created_at?: string;
          id?: string;
          quiet_end_minute?: number;
          quiet_start_minute?: number;
          reminder_offsets_hours?: number[];
          sender_name?: string;
          sms_enabled?: boolean;
          template_cancellation?: string;
          template_confirmation?: string;
          template_deposit?: string;
          template_reminder?: string;
          tenant_id: string;
          updated_at?: string;
          whatsapp_enabled?: boolean;
        };
        Update: {
          created_at?: string;
          id?: string;
          quiet_end_minute?: number;
          quiet_start_minute?: number;
          reminder_offsets_hours?: number[];
          sender_name?: string;
          sms_enabled?: boolean;
          template_cancellation?: string;
          template_confirmation?: string;
          template_deposit?: string;
          template_reminder?: string;
          tenant_id?: string;
          updated_at?: string;
          whatsapp_enabled?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notification_settings_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: true;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications_queue: {
        Row: {
          appointment_id: string | null;
          attempts: number;
          body: string;
          channel: string;
          created_at: string;
          id: string;
          scheduled_at: string;
          sent_at: string | null;
          status: Database["public"]["Enums"]["notification_status"];
          template_key: string;
          tenant_id: string;
          to_phone: string;
        };
        Insert: {
          appointment_id?: string | null;
          attempts?: number;
          body?: string;
          channel?: string;
          created_at?: string;
          id?: string;
          scheduled_at?: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["notification_status"];
          template_key: string;
          tenant_id: string;
          to_phone: string;
        };
        Update: {
          appointment_id?: string | null;
          attempts?: number;
          body?: string;
          channel?: string;
          created_at?: string;
          id?: string;
          scheduled_at?: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["notification_status"];
          template_key?: string;
          tenant_id?: string;
          to_phone?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_queue_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_queue_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount_cents: number;
          appointment_id: string | null;
          created_at: string;
          currency: string;
          id: string;
          idempotency_key: string | null;
          provider: string;
          provider_ref: string | null;
          raw_payload: Json;
          status: Database["public"]["Enums"]["payment_status"];
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          amount_cents?: number;
          appointment_id?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          idempotency_key?: string | null;
          provider?: string;
          provider_ref?: string | null;
          raw_payload?: Json;
          status?: Database["public"]["Enums"]["payment_status"];
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          appointment_id?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          idempotency_key?: string | null;
          provider?: string;
          provider_ref?: string | null;
          raw_payload?: Json;
          status?: Database["public"]["Enums"]["payment_status"];
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          max_appointments_month: number;
          max_staff: number;
          name: string;
          price_cents: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          max_appointments_month?: number;
          max_staff?: number;
          name: string;
          price_cents?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          max_appointments_month?: number;
          max_staff?: number;
          name?: string;
          price_cents?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          branch_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          kind: string;
          name: string;
          tenant_id: string;
        };
        Insert: {
          branch_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          kind?: string;
          name: string;
          tenant_id: string;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          kind?: string;
          name?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resources_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resources_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          branch_id: string;
          buffer_minutes: number;
          created_at: string;
          deposit_cents: number;
          description: string;
          duration_minutes: number;
          id: string;
          is_active: boolean;
          name: string;
          price_cents: number;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          buffer_minutes?: number;
          created_at?: string;
          deposit_cents?: number;
          description?: string;
          duration_minutes?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          price_cents?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          buffer_minutes?: number;
          created_at?: string;
          deposit_cents?: number;
          description?: string;
          duration_minutes?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          price_cents?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "services_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      staff: {
        Row: {
          branch_id: string;
          created_at: string;
          full_name: string;
          id: string;
          is_active: boolean;
          specialty: string;
          tenant_id: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          branch_id: string;
          created_at?: string;
          full_name: string;
          id?: string;
          is_active?: boolean;
          specialty?: string;
          tenant_id: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          specialty?: string;
          tenant_id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_services: {
        Row: {
          id: string;
          service_id: string;
          staff_id: string;
          tenant_id: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          staff_id: string;
          tenant_id: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          staff_id?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_services_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_services_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_services_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          created_at: string;
          id: string;
          plan_id: string;
          renews_at: string | null;
          started_at: string;
          status: Database["public"]["Enums"]["subscription_status"];
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          plan_id: string;
          renews_at?: string | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          plan_id?: string;
          renews_at?: string | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenants: {
        Row: {
          created_at: string;
          currency: string;
          id: string;
          is_active: boolean;
          logo_url: string | null;
          name: string;
          slug: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name: string;
          slug: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name?: string;
          slug?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_tenant_member: {
        Args: {
          _email: string;
          _role: Database["public"]["Enums"]["app_role"];
          _tenant_id: string;
        };
        Returns: string;
      };
      book_appointment: {
        Args: {
          _customer_id: string;
          _note?: string;
          _service_id: string;
          _staff_id: string;
          _starts_at: string;
          _tenant_id: string;
        };
        Returns: string;
      };
      check_slot_conflict: {
        Args: {
          _ends_at: string;
          _exclude_appointment_id?: string;
          _staff_id: string;
          _starts_at: string;
        };
        Returns: {
          conflict_start: string;
          conflicts: boolean;
          staff_name: string;
        }[];
      };
      claim_demo_membership: {
        Args: { _role?: Database["public"]["Enums"]["app_role"] };
        Returns: string;
      };
      has_tenant_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][];
          _tenant_id: string;
        };
        Returns: boolean;
      };
      is_super_admin: { Args: never; Returns: boolean };
      is_tenant_manager: { Args: { _tenant_id: string }; Returns: boolean };
      is_tenant_member: { Args: { _tenant_id: string }; Returns: boolean };
      list_tenant_members: {
        Args: { _tenant_id: string };
        Returns: {
          created_at: string;
          email: string;
          full_name: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        }[];
      };
      remove_tenant_member: {
        Args: { _tenant_id: string; _user_id: string };
        Returns: string;
      };
      reschedule_appointment: {
        Args: { _appointment_id: string; _staff_id: string; _starts_at: string };
        Returns: string;
      };
      set_appointment_status: {
        Args: {
          _appointment_id: string;
          _status: Database["public"]["Enums"]["appointment_status"];
        };
        Returns: string;
      };
      set_member_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _tenant_id: string;
          _user_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      app_role:
        "customer" | "receptionist" | "provider" | "branch_manager" | "owner" | "super_admin";
      appointment_status: "confirmed" | "pending_deposit" | "completed" | "cancelled" | "no_show";
      notification_status: "queued" | "sent" | "failed";
      payment_status: "pending" | "paid" | "failed" | "refunded";
      subscription_status: "trialing" | "active" | "past_due" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "receptionist", "provider", "branch_manager", "owner", "super_admin"],
      appointment_status: ["confirmed", "pending_deposit", "completed", "cancelled", "no_show"],
      notification_status: ["queued", "sent", "failed"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      subscription_status: ["trialing", "active", "past_due", "cancelled"],
    },
  },
} as const;
