-- ==========================================================
-- NOVA / VYBE — PRODUCTION SUPABASE POSTGRESQL SCHEMA (PHASE 3)
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================
-- 2. TABLES DEFINITIONS
-- ==========================================================

-- 2.1 PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  profile_photo TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  age_range TEXT,
  city TEXT DEFAULT 'Central District',
  bio TEXT,
  location_visibility TEXT DEFAULT 'approximate' CHECK (location_visibility IN ('exact', 'approximate', 'hidden')),
  profile_visibility TEXT DEFAULT 'visible' CHECK (profile_visibility IN ('visible', 'private', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 INTERESTS TABLE
CREATE TABLE IF NOT EXISTS public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 USER_INTERESTS TABLE
CREATE TABLE IF NOT EXISTS public.user_interests (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_id UUID REFERENCES public.interests(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, interest_id)
);

-- 2.4 ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  approximate_latitude DOUBLE PRECISION,
  approximate_longitude DOUBLE PRECISION,
  location_name TEXT,
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  skill_level TEXT DEFAULT 'All Levels',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 ACTIVITY_PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'waitlisted', 'cancelled', 'attended')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_activity_participant UNIQUE (activity_id, user_id)
);

-- 2.6 COMMUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 COMMUNITY_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_community_member UNIQUE (community_id, user_id)
);

-- 2.8 REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 ACTIVITY_MESSAGES TABLE (SQUAD CHAT)
CREATE TABLE IF NOT EXISTS public.activity_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_user_id)
);

-- ==========================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE DISCOVERY
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_activities_creator ON public.activities(creator_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_category ON public.activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activity_participants_activity ON public.activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_user ON public.activity_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_comm ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON public.blocks(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_messages_activity ON public.activity_messages(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_messages_created ON public.activity_messages(created_at);

-- ==========================================================
-- 4. AUTOMATIC TRIGGERS & PROCEDURES
-- ==========================================================

-- Trigger: Automatically create public profile on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, profile_photo, bio, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'profile_photo', NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    COALESCE(NEW.raw_user_meta_data->>'bio', 'Joined the grid.'),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Central District')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Sync community member_count automatically
CREATE OR REPLACE FUNCTION public.sync_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities
    SET member_count = member_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities
    SET member_count = GREATEST(0, member_count - 1)
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_community_member_change ON public.community_members;
CREATE TRIGGER on_community_member_change
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.sync_community_member_count();

-- Procedure: Concurrency-Safe Activity Joining
CREATE OR REPLACE FUNCTION public.join_activity_safe(p_activity_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_max_participants INTEGER;
  v_current_count INTEGER;
  v_status TEXT;
  v_is_already_joined BOOLEAN;
  v_result JSON;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to join an activity';
  END IF;

  -- Lock activity row for update to prevent race conditions
  SELECT max_participants, status
  INTO v_max_participants, v_status
  FROM public.activities
  WHERE id = p_activity_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Activity not found';
  END IF;

  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'Activity is not active';
  END IF;

  -- Check if user already joined
  SELECT EXISTS (
    SELECT 1 FROM public.activity_participants
    WHERE activity_id = p_activity_id AND user_id = v_user_id
  ) INTO v_is_already_joined;

  IF v_is_already_joined THEN
    RAISE EXCEPTION 'User has already joined this activity';
  END IF;

  -- Check current count
  SELECT COUNT(*)
  INTO v_current_count
  FROM public.activity_participants
  WHERE activity_id = p_activity_id;

  IF v_current_count >= v_max_participants THEN
    RAISE EXCEPTION 'Activity is already full';
  END IF;

  -- Insert participant record
  INSERT INTO public.activity_participants (activity_id, user_id, status)
  VALUES (p_activity_id, v_user_id, 'joined');

  SELECT json_build_object(
    'success', true,
    'activity_id', p_activity_id,
    'user_id', v_user_id,
    'participant_count', v_current_count + 1
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure: Leave Activity
CREATE OR REPLACE FUNCTION public.leave_activity_safe(p_activity_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_new_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  DELETE FROM public.activity_participants
  WHERE activity_id = p_activity_id AND user_id = v_user_id;

  SELECT COUNT(*)
  INTO v_new_count
  FROM public.activity_participants
  WHERE activity_id = p_activity_id;

  RETURN json_build_object(
    'success', true,
    'activity_id', p_activity_id,
    'user_id', v_user_id,
    'participant_count', v_new_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- 5.1 PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (
    profile_visibility = 'visible'
    OR auth.uid() = id
    OR auth.uid() IS NULL
  );

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5.2 INTERESTS POLICIES
CREATE POLICY "Interests are viewable by everyone"
  ON public.interests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create interests"
  ON public.interests FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 5.3 USER_INTERESTS POLICIES
CREATE POLICY "User interests are viewable by everyone"
  ON public.user_interests FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own interests"
  ON public.user_interests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5.4 ACTIVITIES POLICIES
CREATE POLICY "Active activities are viewable by everyone"
  ON public.activities FOR SELECT
  USING (
    status = 'active'
    OR creator_id = auth.uid()
    OR auth.uid() IS NULL
  );

CREATE POLICY "Authenticated users can create activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their activities"
  ON public.activities FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their activities"
  ON public.activities FOR DELETE
  USING (auth.uid() = creator_id);

-- 5.5 ACTIVITY_PARTICIPANTS POLICIES
CREATE POLICY "Activity participants are viewable by everyone"
  ON public.activity_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join activities as themselves"
  ON public.activity_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave activities or update their status"
  ON public.activity_participants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own participation record"
  ON public.activity_participants FOR DELETE
  USING (auth.uid() = user_id);

-- 5.6 COMMUNITIES POLICIES
CREATE POLICY "Communities are viewable by everyone"
  ON public.communities FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert communities"
  ON public.communities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 5.7 COMMUNITY_MEMBERS POLICIES
CREATE POLICY "Community members are viewable by everyone"
  ON public.community_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join communities as themselves"
  ON public.community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities as themselves"
  ON public.community_members FOR DELETE
  USING (auth.uid() = user_id);

-- 5.8 REPORTS POLICIES
CREATE POLICY "Users can submit reports as themselves"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can only read their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- 5.9 BLOCKS POLICIES
CREATE POLICY "Users can view their own blocks"
  ON public.blocks FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks as themselves"
  ON public.blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks"
  ON public.blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- 5.10 ACTIVITY_MESSAGES (SQUAD CHAT) POLICIES
ALTER TABLE public.activity_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Squad chat viewable only by creator or active participants"
  ON public.activity_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_id AND a.creator_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.activity_participants ap
      WHERE ap.activity_id = activity_id
        AND ap.user_id = auth.uid()
        AND ap.status IN ('joined', 'attended', 'confirmed')
    )
  );

CREATE POLICY "Squad chat insertable only by creator or active participants"
  ON public.activity_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      EXISTS (
        SELECT 1 FROM public.activities a
        WHERE a.id = activity_id AND a.creator_id = auth.uid() AND a.status != 'cancelled'
      )
      OR
      EXISTS (
        SELECT 1 FROM public.activity_participants ap
        JOIN public.activities a ON a.id = ap.activity_id
        WHERE ap.activity_id = activity_id
          AND ap.user_id = auth.uid()
          AND ap.status IN ('joined', 'attended', 'confirmed')
          AND a.status != 'cancelled'
      )
    )
  );

CREATE POLICY "Users can delete only their own squad chat messages"
  ON public.activity_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ==========================================================
-- 6. INITIAL SEED DATA
-- ==========================================================

-- Seed Communities
INSERT INTO public.communities (name, category, description, member_count)
VALUES
  ('Central London FC & Pickups', 'Football', 'Weekly 5-a-side and 7-a-side football games across Regent Park and Shoreditch.', 48),
  ('CyberCity Hoops Squad', 'Basketball', 'Full-court runs, 3v3 half-court tournaments, and weekend pickup basketball.', 35),
  ('FC25 & Cyber Gaming Hub', 'Gaming', 'Local FIFA/FC25 tournaments, Smash Bros tourneys, and LAN gaming sessions.', 64),
  ('Full-Stack Hackers & Devs', 'Programming', 'Weekend buildathons, AI prompt jams, and coffee coding sessions.', 52),
  ('Sunrise 5K & 10K Pacing Club', 'Running', 'Casual urban morning runs and structured marathon training pacing packs.', 29),
  ('Heavy Iron & Push Day Spotters', 'Gym', 'Find reliable lifting spotters, form checks, and powerlifting workout squads.', 41),
  ('Speed Chess & Blitz Lounge', 'Chess', 'Fast-paced blitz chess, coffee meetups, and tactical endgame workshops.', 26),
  ('Night Neon Street Photography', 'Photography', 'Night walks exploring cyberpunk architecture, neon reflections, and portraiture.', 33),
  ('Modular Synth & Vinyl Producers', 'Music', 'Electronic music jams, vinyl listening sessions, and DAW production workshops.', 21),
  ('Clay & Hardcourt Tennis Rallies', 'Tennis', 'Singles matchplay, doubles rallies, and casual ball machine practice.', 19)
ON CONFLICT DO NOTHING;

-- Seed Interests
INSERT INTO public.interests (name)
VALUES
  ('Football'),
  ('Basketball'),
  ('Gaming'),
  ('Programming'),
  ('Running'),
  ('Gym & Powerlifting'),
  ('Chess'),
  ('Photography'),
  ('Electronic Music'),
  ('Tennis'),
  ('Badminton'),
  ('Bouldering & Climbing'),
  ('Cycling'),
  ('Board Games'),
  ('Design & Creative')
ON CONFLICT (name) DO NOTHING;
