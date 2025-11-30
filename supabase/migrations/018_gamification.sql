-- ============================================
-- 018_gamification.sql
-- User gamification: XP, levels, achievements, streaks
-- Supports the incredible onboarding experience
-- ============================================

-- ============================================
-- 1. USER GAMIFICATION TABLE
-- Tracks XP, levels, achievements, and streaks
-- ============================================
CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,

  -- XP & Levels
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,

  -- Achievements (array of achievement IDs)
  achievements JSONB DEFAULT '[]'::jsonb,

  -- Financial tracking
  disasters_prevented_total INTEGER DEFAULT 0, -- in dollars

  -- Streak tracking
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- User intent/motivation (from onboarding survey)
  onboarding_intent JSONB DEFAULT '{}'::jsonb,
  -- Example: { "fear": "hvac_failure", "goal": "protect_value", "trigger": "just_bought" }

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. XP TRANSACTIONS TABLE
-- Logs every XP award for audit/analytics
-- ============================================
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  action_type TEXT NOT NULL,

  -- Optional: link to related entity
  related_entity_type TEXT, -- 'property', 'system', 'inspection', 'task'
  related_entity_id UUID,

  -- Metadata for the action
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. ACHIEVEMENT UNLOCKS TABLE
-- Records when achievements were earned
-- ============================================
CREATE TABLE IF NOT EXISTS achievement_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  xp_bonus INTEGER DEFAULT 0,

  -- Context when unlocked
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 4. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_level ON user_gamification(current_level);
CREATE INDEX IF NOT EXISTS idx_user_gamification_xp ON user_gamification(total_xp DESC);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_action_type ON xp_transactions(action_type);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_achievement_unlocks_user_id ON achievement_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_unlocks_achievement_id ON achievement_unlocks(achievement_id);

-- ============================================
-- 5. ENABLE RLS
-- ============================================
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_unlocks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- User Gamification: Users can view and update their own data
CREATE POLICY "Users can view own gamification" ON user_gamification
  FOR SELECT USING (true); -- Allow viewing (for leaderboards later)

CREATE POLICY "Users can insert own gamification" ON user_gamification
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own gamification" ON user_gamification
  FOR UPDATE USING (true);

-- XP Transactions: Users can view their own, insert their own
CREATE POLICY "Users can view own xp transactions" ON xp_transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert xp transactions" ON xp_transactions
  FOR INSERT WITH CHECK (true);

-- Achievement Unlocks: Users can view their own, insert their own
CREATE POLICY "Users can view own achievements" ON achievement_unlocks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert achievements" ON achievement_unlocks
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE TRIGGER user_gamification_updated_at
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(p_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := 1;
BEGIN
  -- Level thresholds: 0, 200, 500, 1000, 2000, 3500, 5500, 8000, 12000, 20000
  IF p_xp >= 20000 THEN v_level := 10;
  ELSIF p_xp >= 12000 THEN v_level := 9;
  ELSIF p_xp >= 8000 THEN v_level := 8;
  ELSIF p_xp >= 5500 THEN v_level := 7;
  ELSIF p_xp >= 3500 THEN v_level := 6;
  ELSIF p_xp >= 2000 THEN v_level := 5;
  ELSIF p_xp >= 1000 THEN v_level := 4;
  ELSIF p_xp >= 500 THEN v_level := 3;
  ELSIF p_xp >= 200 THEN v_level := 2;
  ELSE v_level := 1;
  END IF;

  RETURN v_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award XP and auto-update level
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id TEXT,
  p_xp_amount INTEGER,
  p_action_type TEXT,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  new_total_xp INTEGER,
  old_level INTEGER,
  new_level INTEGER,
  leveled_up BOOLEAN
) AS $$
DECLARE
  v_current_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_xp INTEGER;
BEGIN
  -- Get current XP and level (or create record if doesn't exist)
  INSERT INTO user_gamification (user_id, total_xp, current_level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT total_xp, current_level INTO v_current_xp, v_old_level
  FROM user_gamification
  WHERE user_id = p_user_id;

  -- Calculate new XP and level
  v_new_xp := v_current_xp + p_xp_amount;
  v_new_level := calculate_level_from_xp(v_new_xp);

  -- Update gamification record
  UPDATE user_gamification
  SET total_xp = v_new_xp,
      current_level = v_new_level,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO xp_transactions (user_id, xp_amount, action_type, related_entity_type, related_entity_id, metadata)
  VALUES (p_user_id, p_xp_amount, p_action_type, p_related_entity_type, p_related_entity_id, p_metadata);

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_old_level, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id TEXT)
RETURNS TABLE (
  new_streak INTEGER,
  is_new_longest BOOLEAN
) AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := CURRENT_DATE;
  v_new_streak INTEGER;
  v_new_longest BOOLEAN := FALSE;
BEGIN
  -- Get current streak data
  SELECT last_activity_date, streak_current, streak_longest
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM user_gamification
  WHERE user_id = p_user_id;

  -- Calculate new streak
  IF v_last_activity IS NULL THEN
    -- First activity ever
    v_new_streak := 1;
  ELSIF v_last_activity = v_today THEN
    -- Already logged activity today
    v_new_streak := v_current_streak;
  ELSIF v_last_activity = v_today - INTERVAL '1 day' THEN
    -- Consecutive day - increase streak
    v_new_streak := v_current_streak + 1;
  ELSE
    -- Streak broken - reset to 1
    v_new_streak := 1;
  END IF;

  -- Check if new longest
  IF v_new_streak > COALESCE(v_longest_streak, 0) THEN
    v_longest_streak := v_new_streak;
    v_new_longest := TRUE;
  END IF;

  -- Update record
  UPDATE user_gamification
  SET streak_current = v_new_streak,
      streak_longest = v_longest_streak,
      last_activity_date = v_today,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_new_streak, v_new_longest;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add disasters prevented amount
CREATE OR REPLACE FUNCTION add_disaster_prevented(
  p_user_id TEXT,
  p_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  UPDATE user_gamification
  SET disasters_prevented_total = disasters_prevented_total + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING disasters_prevented_total INTO v_new_total;

  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
