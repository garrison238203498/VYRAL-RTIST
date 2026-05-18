export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      ai_insights: {
        Row: {
          acted_on: boolean | null;
          body: string | null;
          created_at: string | null;
          cta_label: string | null;
          cta_secondary: string | null;
          dismissed: boolean | null;
          id: string;
          title: string;
          tone: Database["public"]["Enums"]["insight_tone"];
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ai_insights"]["Row"]> & {
          title: string;
          tone: Database["public"]["Enums"]["insight_tone"];
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_insights"]["Row"]>;
        Relationships: [];
      };
      goals: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          current_value: number | null;
          deadline: string | null;
          id: string;
          kind: Database["public"]["Enums"]["goal_kind"];
          space_id: string | null;
          status: Database["public"]["Enums"]["goal_status"];
          target_value: number;
          title: string;
          unit: string | null;
          user_id: string;
          why: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["goals"]["Row"]> & {
          title: string;
          target_value: number;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Row"]>;
        Relationships: [];
      };
      life_legacy: {
        Row: {
          accent: Database["public"]["Enums"]["space_accent"] | null;
          body: string | null;
          created_at: string | null;
          id: string;
          kind: Database["public"]["Enums"]["legacy_kind"];
          occurred_at: string | null;
          space_id: string | null;
          title: string;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["life_legacy"]["Row"]> & {
          title: string;
          kind: Database["public"]["Enums"]["legacy_kind"];
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["life_legacy"]["Row"]>;
        Relationships: [];
      };
      notes: {
        Row: {
          captured_at: string | null;
          created_at: string | null;
          handwritten: boolean | null;
          id: string;
          source: Database["public"]["Enums"]["note_source"];
          space_id: string | null;
          text: string;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notes"]["Row"]> & {
          text: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["notes"]["Row"]>;
        Relationships: [];
      };
      pen_state: {
        Row: {
          battery: number | null;
          cap_orientation: string | null;
          echo_grip_auth: string | null;
          haptic: number | null;
          ink_predicted_days: number | null;
          ink_remaining_percent: number | null;
          knock_shortcuts: Json | null;
          pressure_signature_lock: string | null;
          refill_id: string | null;
          serial: string | null;
          thermal_avg_c: number | null;
          tip_glow: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pen_state"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["pen_state"]["Row"]>;
        Relationships: [];
      };
      preferences: {
        Row: {
          ai_naming_control: string | null;
          dyslexia_font: boolean | null;
          guided_layout: boolean | null;
          haptic_intensity: number | null;
          insight_sensitivity: number | null;
          privacy_share_insights: boolean | null;
          reduced_motion: boolean | null;
          slow_read_pacing: number | null;
          space_automation_level: number | null;
          store_mood_signals: boolean | null;
          text_spacing: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["preferences"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["preferences"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          display_name: string | null;
          energy: string | null;
          id: string;
          pattern: string | null;
          rotist_serial: string | null;
          streak_days: number | null;
          tagline: string | null;
          updated_at: string | null;
          weekly_focus_blocks: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      sessions: {
        Row: {
          confidence_drop: string | null;
          created_at: string | null;
          duration_min: number | null;
          ended_at: string | null;
          fatigue_score: number | null;
          grip_pressure_change: number | null;
          hesitation_clusters: number | null;
          id: string;
          mood_delta: number | null;
          review_cards_suggested: number | null;
          space_id: string | null;
          started_at: string | null;
          strokes: number | null;
          summary: Json | null;
          summary_lifts: number | null;
          tasks_extracted: number | null;
          title: string;
          transcript: string[] | null;
          user_id: string;
          word_count: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["sessions"]["Row"]> & {
          title: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Row"]>;
        Relationships: [];
      };
      spaces: {
        Row: {
          accent: Database["public"]["Enums"]["space_accent"];
          created_at: string | null;
          evolution: Json | null;
          id: string;
          kind: Database["public"]["Enums"]["space_kind"];
          last_activity_at: string | null;
          name: string;
          next_action: string | null;
          pinned: boolean | null;
          reason: string | null;
          signals: string[] | null;
          status: Database["public"]["Enums"]["space_status"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["spaces"]["Row"]> & {
          name: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["spaces"]["Row"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          created_at: string | null;
          done: boolean | null;
          done_at: string | null;
          due_at: string | null;
          id: string;
          space_id: string | null;
          text: string;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & {
          text: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      goal_kind: "draft_words" | "study_minutes" | "session_count" | "task_count" | "custom";
      goal_status: "active" | "completed" | "archived";
      insight_tone: "supportive" | "creative" | "study" | "system";
      legacy_kind: "milestone" | "summary" | "pattern" | "session" | "evolution";
      note_source: "rotist" | "quick" | "voice";
      space_accent: "violet" | "cyan" | "pink" | "lime";
      space_kind:
        | "creative"
        | "school"
        | "writing"
        | "social"
        | "reset"
        | "legacy"
        | "build"
        | "memory"
        | "reflection";
      space_status: "active" | "suggested" | "archived";
    };
    CompositeTypes: Record<string, never>;
  };
};

// Convenience aliases used by app code
export type SpaceRow = Database["public"]["Tables"]["spaces"]["Row"];
export type SpaceInsert = Database["public"]["Tables"]["spaces"]["Insert"];
export type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
export type GoalRow = Database["public"]["Tables"]["goals"]["Row"];
export type LegacyRow = Database["public"]["Tables"]["life_legacy"]["Row"];
export type InsightRow = Database["public"]["Tables"]["ai_insights"]["Row"];
export type PreferencesRow = Database["public"]["Tables"]["preferences"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type PenStateRow = Database["public"]["Tables"]["pen_state"]["Row"];

export type SpaceAccent = Database["public"]["Enums"]["space_accent"];
export type SpaceKind = Database["public"]["Enums"]["space_kind"];
export type GoalKind = Database["public"]["Enums"]["goal_kind"];
