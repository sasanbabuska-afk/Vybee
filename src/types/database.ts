export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          profile_photo: string | null;
          age_range: string | null;
          city: string | null;
          bio: string | null;
          location_visibility: 'exact' | 'approximate' | 'hidden';
          profile_visibility: 'visible' | 'private' | 'hidden';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          profile_photo?: string | null;
          age_range?: string | null;
          city?: string | null;
          bio?: string | null;
          location_visibility?: 'exact' | 'approximate' | 'hidden';
          profile_visibility?: 'visible' | 'private' | 'hidden';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          profile_photo?: string | null;
          age_range?: string | null;
          city?: string | null;
          bio?: string | null;
          location_visibility?: 'exact' | 'approximate' | 'hidden';
          profile_visibility?: 'visible' | 'private' | 'hidden';
          created_at?: string;
          updated_at?: string;
        };
      };
      interests: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      user_interests: {
        Row: {
          user_id: string;
          interest_id: string;
        };
        Insert: {
          user_id: string;
          interest_id: string;
        };
        Update: {
          user_id?: string;
          interest_id?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          category: string;
          description: string | null;
          date: string;
          start_time: string;
          duration_minutes: number;
          approximate_latitude: number | null;
          approximate_longitude: number | null;
          location_name: string | null;
          max_participants: number;
          skill_level: string | null;
          status: 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          category: string;
          description?: string | null;
          date: string;
          start_time: string;
          duration_minutes?: number;
          approximate_latitude?: number | null;
          approximate_longitude?: number | null;
          location_name?: string | null;
          max_participants: number;
          skill_level?: string | null;
          status?: 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          category?: string;
          description?: string | null;
          date?: string;
          start_time?: string;
          duration_minutes?: number;
          approximate_latitude?: number | null;
          approximate_longitude?: number | null;
          location_name?: string | null;
          max_participants?: number;
          skill_level?: string | null;
          status?: 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_participants: {
        Row: {
          id: string;
          activity_id: string;
          user_id: string;
          status: 'joined' | 'waitlisted' | 'cancelled' | 'attended';
          joined_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          user_id: string;
          status?: 'joined' | 'waitlisted' | 'cancelled' | 'attended';
          joined_at?: string;
        };
        Update: {
          id?: string;
          activity_id?: string;
          user_id?: string;
          status?: 'joined' | 'waitlisted' | 'cancelled' | 'attended';
          joined_at?: string;
        };
      };
      communities: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          member_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description?: string | null;
          member_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          member_count?: number;
          created_at?: string;
        };
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          activity_id: string | null;
          reason: string;
          description: string | null;
          status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          activity_id?: string | null;
          reason: string;
          description?: string | null;
          status?: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_user_id?: string | null;
          activity_id?: string | null;
          reason?: string;
          description?: string | null;
          status?: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
          created_at?: string;
        };
      };
      blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          blocker_id?: string;
          blocked_user_id?: string;
          created_at?: string;
        };
      };
      activity_messages: {
        Row: {
          id: string;
          activity_id: string;
          sender_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          sender_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          activity_id?: string;
          sender_id?: string;
          message?: string;
          created_at?: string;
        };
      };
    };
  };
}
