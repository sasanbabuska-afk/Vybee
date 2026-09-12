import { getSupabaseClient } from '../lib/supabase';
import {
  Activity,
  ActivityCategory,
  Community,
  Participant,
  User,
  SkillLevel,
  ActivityStatus,
  ChatMessage
} from '../types';

/**
 * Supabase Data Service
 * Provides typed, error-handled database operations for VYBE.
 */
export const supabaseService = {
  // ==========================================
  // ACTIVITIES
  // ==========================================

  async fetchActivities(): Promise<Activity[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('activities')
        .select(`
          *,
          creator:profiles!activities_creator_id_fkey(id, display_name, profile_photo, city),
          participants:activity_participants(
            user_id,
            status,
            joined_at,
            profile:profiles(id, display_name, profile_photo)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchActivities notice:', error.message);
        return [];
      }

      if (!data) return [];

      return data.map((row: any): Activity => {
        const participantList: Participant[] = (row.participants || []).map((p: any) => ({
          userId: p.user_id,
          displayName: p.profile?.display_name || 'Anonymous Grid Member',
          profilePhoto: p.profile?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          joinedAt: p.joined_at,
          status: p.status === 'waitlisted' ? 'waitlist' : 'confirmed',
          reliabilityScore: 98,
          penaltyStrikes: 0
        }));

        let mappedStatus: ActivityStatus = 'upcoming';
        if (row.status === 'cancelled') mappedStatus = 'cancelled';
        else if (row.status === 'completed') mappedStatus = 'completed';

        const validSkillLevel: SkillLevel =
          row.skill_level === 'Beginner' || row.skill_level === 'Intermediate' || row.skill_level === 'Advanced'
            ? row.skill_level
            : 'Any';

        return {
          id: row.id,
          creatorId: row.creator_id,
          creator: {
            id: row.creator?.id || row.creator_id,
            displayName: row.creator?.display_name || 'Grid Host',
            profilePhoto: row.creator?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            city: row.creator?.city || 'London Metro'
          },
          title: row.title,
          category: (row.category as ActivityCategory) || 'Gaming',
          description: row.description || '',
          date: row.date,
          startTime: row.start_time?.slice(0, 5) || '18:00',
          durationHours: row.duration_minutes ? row.duration_minutes / 60 : 1.5,
          locationName: row.location_name || 'Central Arena',
          approximateLatitude: row.approximate_latitude ?? 51.5074,
          approximateLongitude: row.approximate_longitude ?? -0.1278,
          maxParticipants: row.max_participants,
          skillLevel: validSkillLevel,
          visibility: 'Public',
          participants: participantList,
          status: mappedStatus,
          createdAt: row.created_at
        };
      });
    } catch (err) {
      console.error('Error querying Supabase activities:', err);
      return [];
    }
  },

  async createActivity(
    activityInput: {
      title: string;
      category: ActivityCategory;
      description: string;
      date: string;
      startTime: string;
      durationMinutes: number;
      locationName: string;
      approximateLatitude: number;
      approximateLongitude: number;
      maxParticipants: number;
      skillLevel: SkillLevel;
      creatorId: string;
      creatorName: string;
      creatorPhoto: string;
      status?: 'active' | 'completed' | 'cancelled';
    },
    creatorUser: User
  ): Promise<{ activity: Activity | null; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { activity: null, error: new Error('Supabase client not configured') };
    }

    try {
      // 1. Insert activity row
      const { data: actData, error: actError } = await (client.from('activities') as any)
        .insert({
          creator_id: creatorUser.id,
          title: activityInput.title,
          category: activityInput.category,
          description: activityInput.description,
          date: activityInput.date,
          start_time: activityInput.startTime.length === 5 ? `${activityInput.startTime}:00` : activityInput.startTime,
          duration_minutes: activityInput.durationMinutes,
          location_name: activityInput.locationName,
          approximate_latitude: activityInput.approximateLatitude,
          approximate_longitude: activityInput.approximateLongitude,
          max_participants: activityInput.maxParticipants,
          skill_level: activityInput.skillLevel,
          status: activityInput.status || 'active'
        })
        .select()
        .single();

      if (actError) throw actError;
      if (!actData) throw new Error('Failed to create activity record.');

      // 2. Auto-join creator
      await (client.from('activity_participants') as any)
        .insert({
          activity_id: actData.id,
          user_id: creatorUser.id,
          status: 'joined'
        });

      const newActivity: Activity = {
        id: actData.id,
        creatorId: creatorUser.id,
        creator: {
          id: creatorUser.id,
          displayName: creatorUser.displayName,
          profilePhoto: creatorUser.profilePhoto,
          city: creatorUser.city || 'London Metro'
        },
        title: actData.title,
        category: actData.category as ActivityCategory,
        description: actData.description || '',
        date: actData.date,
        startTime: actData.start_time?.slice(0, 5) || activityInput.startTime,
        durationHours: (actData.duration_minutes || activityInput.durationMinutes) / 60,
        locationName: actData.location_name || activityInput.locationName,
        approximateLatitude: actData.approximate_latitude ?? activityInput.approximateLatitude,
        approximateLongitude: actData.approximate_longitude ?? activityInput.approximateLongitude,
        maxParticipants: actData.max_participants,
        skillLevel: activityInput.skillLevel,
        visibility: 'Public',
        participants: [
          {
            userId: creatorUser.id,
            displayName: creatorUser.displayName,
            profilePhoto: creatorUser.profilePhoto,
            joinedAt: new Date().toISOString(),
            status: 'confirmed',
            reliabilityScore: creatorUser.reliabilityScore || 98,
            penaltyStrikes: creatorUser.penaltyStrikes || 0
          }
        ],
        status: 'upcoming',
        createdAt: actData.created_at || new Date().toISOString()
      };

      return { activity: newActivity, error: null };
    } catch (err: any) {
      return { activity: null, error: err };
    }
  },

  async joinActivity(activityId: string, user: User): Promise<{ success: boolean; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: new Error('Supabase client not configured') };

    try {
      const { error: insertError } = await (client.from('activity_participants') as any)
        .insert({
          activity_id: activityId,
          user_id: user.id,
          status: 'joined'
        });

      if (insertError) {
        if (insertError.code === '23505') {
          return { success: false, error: new Error('You have already joined this squad') };
        }
        throw insertError;
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  async leaveActivity(activityId: string, userId: string): Promise<{ success: boolean; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: new Error('Supabase client not configured') };

    try {
      const { error } = await client
        .from('activity_participants')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  // ==========================================
  // COMMUNITIES
  // ==========================================

  async fetchCommunities(): Promise<Community[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('communities')
        .select(`
          *,
          members:community_members(user_id)
        `)
        .order('member_count', { ascending: false });

      if (error) {
        console.warn('Supabase fetchCommunities notice:', error.message);
        return [];
      }

      if (!data) return [];

      return data.map((row: any): Community => {
        const memberIds = (row.members || []).map((m: any) => m.user_id);
        return {
          id: row.id,
          name: row.name,
          category: (row.category as ActivityCategory) || 'Gaming',
          description: row.description || '',
          coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
          memberCount: row.member_count || memberIds.length,
          members: memberIds,
          location: 'London & Metro Grid',
          activityCount: 12,
          tags: [row.category, 'Squad', 'Live Events']
        };
      });
    } catch (err) {
      console.error('Error fetching communities from Supabase:', err);
      return [];
    }
  },

  async joinCommunity(communityId: string, userId: string): Promise<{ success: boolean; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: new Error('Supabase client not configured') };

    try {
      const { error } = await (client.from('community_members') as any)
        .insert({
          community_id: communityId,
          user_id: userId
        });

      if (error && error.code !== '23505') throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  async leaveCommunity(communityId: string, userId: string): Promise<{ success: boolean; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: new Error('Supabase client not configured') };

    try {
      const { error } = await client
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  // ==========================================
  // USER PROFILES
  // ==========================================

  async fetchProfile(userId: string): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('profiles')
        .select(`
          *,
          user_interests(
            interest:interests(name)
          )
        `)
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      const row: any = data;
      const interestsList = (row.user_interests || [])
        .map((ui: any) => ui.interest?.name)
        .filter(Boolean);

      return {
        id: row.id,
        email: 'user@vybe.network',
        displayName: row.display_name,
        profilePhoto: row.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        ageRange: row.age_range || '22-29',
        city: row.city || 'Central District',
        bio: row.bio || '',
        interests: interestsList.length > 0 ? interestsList : (['Football', 'Gaming'] as ActivityCategory[]),
        createdActivitiesCount: 4,
        joinedActivitiesCount: 12,
        reliabilityScore: 98,
        karmaScore: 98,
        penaltyStrikes: 0,
        penaltyHistory: [],
        notifications: [],
        following: [],
        followers: [],
        locationVisible: row.location_visibility !== 'hidden',
        appearInDiscovery: row.profile_visibility !== 'hidden',
        approximateLocation: {
          lat: 51.5074,
          lng: -0.1278,
          name: row.city || 'Central District'
        },
        createdAt: row.created_at || new Date().toISOString()
      };
    } catch {
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: new Error('Supabase client not configured') };

    try {
      const payload: any = {};
      if (updates.displayName !== undefined) payload.display_name = updates.displayName;
      if (updates.profilePhoto !== undefined) payload.profile_photo = updates.profilePhoto;
      if (updates.ageRange !== undefined) payload.age_range = updates.ageRange;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.city !== undefined) payload.city = updates.city;
      if (updates.locationVisible !== undefined) {
        payload.location_visibility = updates.locationVisible ? 'approximate' : 'hidden';
      }
      if (updates.appearInDiscovery !== undefined) {
        payload.profile_visibility = updates.appearInDiscovery ? 'visible' : 'hidden';
      }
      payload.updated_at = new Date().toISOString();

      const { error } = await (client.from('profiles') as any)
        .update(payload)
        .eq('id', userId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  // ==========================================
  // REPORTS & BLOCKS
  // ==========================================

  async createReport(report: {
    reporterId: string;
    reportedUserId?: string;
    activityId?: string;
    reason: string;
    description?: string;
  }): Promise<{ success: boolean; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: new Error('Supabase client not configured') };

    try {
      const { error } = await (client.from('reports') as any)
        .insert({
          reporter_id: report.reporterId,
          reported_user_id: report.reportedUserId || null,
          activity_id: report.activityId || null,
          reason: report.reason,
          description: report.description || null
        });

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  async createBlock(blockerId: string, blockedUserId: string): Promise<{ success: boolean; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: new Error('Supabase client not configured') };

    try {
      const { error } = await (client.from('blocks') as any)
        .insert({
          blocker_id: blockerId,
          blocked_user_id: blockedUserId
        });

      if (error && error.code !== '23505') throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  async removeBlock(blockerId: string, blockedUserId: string): Promise<{ success: boolean; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: new Error('Supabase client not configured') };

    try {
      const { error } = await client
        .from('blocks')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_user_id', blockedUserId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  async fetchBlocks(blockerId: string): Promise<string[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('blocks')
        .select('blocked_user_id')
        .eq('blocker_id', blockerId);

      if (error || !data) return [];
      return data.map((b: any) => b.blocked_user_id);
    } catch {
      return [];
    }
  },

  // ==========================================
  // SQUAD CHAT (ACTIVITY_MESSAGES)
  // ==========================================

  async fetchActivityMessages(activityId: string): Promise<ChatMessage[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
      const { data, error } = await (client.from('activity_messages') as any)
        .select(`
          id,
          activity_id,
          sender_id,
          message,
          created_at,
          sender:profiles(id, display_name, profile_photo)
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Supabase fetchActivityMessages notice:', error.message);
        return [];
      }

      if (!data) return [];

      return data.map((row: any): ChatMessage => {
        const createdDate = row.created_at ? new Date(row.created_at) : new Date();
        const timeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        return {
          id: row.id,
          activityId: row.activity_id,
          userId: row.sender_id,
          userName: row.sender?.display_name || 'Squad Member',
          userPhoto: row.sender?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          text: row.message,
          timestamp: timeStr,
          createdAt: row.created_at,
          isSystem: false
        };
      });
    } catch (err) {
      console.error('Error fetching activity messages:', err);
      return [];
    }
  },

  async sendActivityMessage(
    activityId: string,
    senderId: string,
    message: string
  ): Promise<{ success: boolean; message?: ChatMessage; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: new Error('Supabase client not configured') };

    const trimmed = message.trim();
    if (!trimmed) {
      return { success: false, error: new Error('Message cannot be empty') };
    }
    if (trimmed.length > 1000) {
      return { success: false, error: new Error('Message exceeds 1,000 character limit') };
    }

    try {
      const { data, error } = await (client.from('activity_messages') as any)
        .insert({
          activity_id: activityId,
          sender_id: senderId,
          message: trimmed
        })
        .select(`
          id,
          activity_id,
          sender_id,
          message,
          created_at,
          sender:profiles(id, display_name, profile_photo)
        `)
        .single();

      if (error) throw error;

      const createdDate = data?.created_at ? new Date(data.created_at) : new Date();
      const timeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      const mappedMsg: ChatMessage = {
        id: data.id,
        activityId: data.activity_id,
        userId: data.sender_id,
        userName: data.sender?.display_name || 'Squad Member',
        userPhoto: data.sender?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        text: data.message,
        timestamp: timeStr,
        createdAt: data.created_at,
        isSystem: false
      };

      return { success: true, message: mappedMsg, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  async deleteActivityMessage(messageId: string): Promise<{ success: boolean; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: new Error('Supabase client not configured') };

    try {
      const { error } = await (client.from('activity_messages') as any)
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  subscribeToActivityMessages(
    activityId: string,
    onMessage: (msg: ChatMessage) => void,
    onDelete?: (messageId: string) => void
  ): () => void {
    const client = getSupabaseClient();
    if (!client) return () => {};

    try {
      const channel = client
        .channel(`activity_messages:${activityId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_messages',
            filter: `activity_id=eq.${activityId}`
          },
          async (payload) => {
            const newRow = payload.new as any;
            if (!newRow) return;

            // Fetch sender profile details for the newly inserted row
            let senderName = 'Squad Member';
            let senderPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

            try {
              const { data: profile } = await client
                .from('profiles')
                .select('display_name, profile_photo')
                .eq('id', newRow.sender_id)
                .single();

              if (profile) {
                senderName = (profile as any).display_name || senderName;
                senderPhoto = (profile as any).profile_photo || senderPhoto;
              }
            } catch {
              // fallback
            }

            const createdDate = newRow.created_at ? new Date(newRow.created_at) : new Date();
            const timeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

            const mapped: ChatMessage = {
              id: newRow.id,
              activityId: newRow.activity_id,
              userId: newRow.sender_id,
              userName: senderName,
              userPhoto: senderPhoto,
              text: newRow.message,
              timestamp: timeStr,
              createdAt: newRow.created_at,
              isSystem: false
            };

            onMessage(mapped);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'activity_messages',
            filter: `activity_id=eq.${activityId}`
          },
          (payload) => {
            const oldRow = payload.old as any;
            if (oldRow?.id && onDelete) {
              onDelete(oldRow.id);
            }
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription error:', err);
      return () => {};
    }
  }
};
