// Auto-generated from Supabase project yneqeanggdcqftckqzjl on 2026-05-17.
// To regenerate: `supabase gen types typescript --project-id yneqeanggdcqftckqzjl`
// or run the Supabase MCP `generate_typescript_types` tool.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blocks: {
        Row: { blocked_id: string; blocker_id: string; created_at: string }
        Insert: { blocked_id: string; blocker_id: string; created_at?: string }
        Update: { blocked_id?: string; blocker_id?: string; created_at?: string }
        Relationships: []
      }
      challenges: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          ends_at: string
          id: string
          prompt: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["challenge_status"]
          submission_count: number
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          prompt?: string | null
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["challenge_status"]
          submission_count?: number
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          prompt?: string | null
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          submission_count?: number
          title?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          like_count: number
          parent_id: string | null
          post_id: string
          removed_at: string | null
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          like_count?: number
          parent_id?: string | null
          post_id: string
          removed_at?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          like_count?: number
          parent_id?: string | null
          post_id?: string
          removed_at?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
          status: Database["public"]["Enums"]["follow_status"]
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
          status?: Database["public"]["Enums"]["follow_status"]
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
          status?: Database["public"]["Enums"]["follow_status"]
        }
        Relationships: []
      }
      hashtags: {
        Row: { created_at: string; id: string; post_count: number; tag: string }
        Insert: { created_at?: string; id?: string; post_count?: number; tag: string }
        Update: { created_at?: string; id?: string; post_count?: number; tag?: string }
        Relationships: []
      }
      likes: {
        Row: { created_at: string; post_id: string; user_id: string }
        Insert: { created_at?: string; post_id: string; user_id: string }
        Update: { created_at?: string; post_id?: string; user_id?: string }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          comment_id: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          message: string | null
          post_id: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          message?: string | null
          post_id?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          message?: string | null
          post_id?: string | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      post_hashtags: {
        Row: { created_at: string; hashtag_id: string; post_id: string }
        Insert: { created_at?: string; hashtag_id: string; post_id: string }
        Update: { created_at?: string; hashtag_id?: string; post_id?: string }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string
          caption: string | null
          challenge_id: string | null
          comment_count: number
          created_at: string
          duration_ms: number | null
          height: number | null
          id: string
          kind: Database["public"]["Enums"]["post_kind"]
          like_count: number
          media_thumbnail_url: string | null
          media_url: string | null
          removed_at: string | null
          removed_reason: string | null
          updated_at: string
          view_count: number
          visibility: Database["public"]["Enums"]["post_visibility"]
          width: number | null
        }
        Insert: {
          author_id: string
          caption?: string | null
          challenge_id?: string | null
          comment_count?: number
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          kind: Database["public"]["Enums"]["post_kind"]
          like_count?: number
          media_thumbnail_url?: string | null
          media_url?: string | null
          removed_at?: string | null
          removed_reason?: string | null
          updated_at?: string
          view_count?: number
          visibility?: Database["public"]["Enums"]["post_visibility"]
          width?: number | null
        }
        Update: {
          author_id?: string
          caption?: string | null
          challenge_id?: string | null
          comment_count?: number
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["post_kind"]
          like_count?: number
          media_thumbnail_url?: string | null
          media_url?: string | null
          removed_at?: string | null
          removed_reason?: string | null
          updated_at?: string
          view_count?: number
          visibility?: Database["public"]["Enums"]["post_visibility"]
          width?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_verified_at: string | null
          avatar_url: string | null
          bio: string | null
          comments_filter: number
          created_at: string | null
          date_of_birth: string | null
          deleted_at: string | null
          display_name: string | null
          dms_from: Database["public"]["Enums"]["dm_audience"]
          id: string
          suspended_at: string | null
          tagline: string | null
          updated_at: string | null
          username: string | null
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          age_verified_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          comments_filter?: number
          created_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          display_name?: string | null
          dms_from?: Database["public"]["Enums"]["dm_audience"]
          id: string
          suspended_at?: string | null
          tagline?: string | null
          updated_at?: string | null
          username?: string | null
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          age_verified_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          comments_filter?: number
          created_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          display_name?: string | null
          dms_from?: Database["public"]["Enums"]["dm_audience"]
          id?: string
          suspended_at?: string | null
          tagline?: string | null
          updated_at?: string | null
          username?: string | null
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string | null
          reviewed_at: string | null
          reviewer_note: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target_type"]
        }
        Relationships: []
      }
    }
    Functions: {
      can_view_post: {
        Args: { author: string; viewer: string; vis: Database["public"]["Enums"]["post_visibility"] }
        Returns: boolean
      }
      is_blocked_between: { Args: { a: string; b: string }; Returns: boolean }
      is_follower: { Args: { author: string; viewer: string }; Returns: boolean }
      profile_is_minor: { Args: { p_dob: string }; Returns: boolean }
    }
    Enums: {
      challenge_status: "draft" | "active" | "ended"
      dm_audience: "everyone" | "followers" | "none"
      follow_status: "accepted" | "pending"
      notification_kind: "like" | "comment" | "mention" | "follow" | "follow_request" | "system"
      post_kind: "video" | "photo" | "text" | "voice"
      post_visibility: "public" | "followers" | "mutuals" | "private"
      report_status: "pending" | "reviewing" | "actioned" | "dismissed"
      report_target_type: "post" | "comment" | "profile"
    }
  }
}

// Convenience aliases for the social tables — import these in app code.
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Post = Database["public"]["Tables"]["posts"]["Row"]
export type Comment = Database["public"]["Tables"]["comments"]["Row"]
export type Hashtag = Database["public"]["Tables"]["hashtags"]["Row"]
export type Follow = Database["public"]["Tables"]["follows"]["Row"]
export type Block = Database["public"]["Tables"]["blocks"]["Row"]
export type Like = Database["public"]["Tables"]["likes"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]
export type Report = Database["public"]["Tables"]["reports"]["Row"]
export type Challenge = Database["public"]["Tables"]["challenges"]["Row"]

export type PostKind = Database["public"]["Enums"]["post_kind"]
export type PostVisibility = Database["public"]["Enums"]["post_visibility"]
export type FollowStatus = Database["public"]["Enums"]["follow_status"]
export type NotificationKind = Database["public"]["Enums"]["notification_kind"]
export type DmAudience = Database["public"]["Enums"]["dm_audience"]
export type ReportTargetType = Database["public"]["Enums"]["report_target_type"]
export type ReportStatus = Database["public"]["Enums"]["report_status"]
export type ChallengeStatus = Database["public"]["Enums"]["challenge_status"]
