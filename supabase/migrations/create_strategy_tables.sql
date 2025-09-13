-- Create strategy scenarios table
CREATE TABLE IF NOT EXISTS strategy_scenarios (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  correct_strategy TEXT NOT NULL CHECK (correct_strategy IN ('BULLISH', 'BEARISH', 'HEDGING', 'VOLATILITY')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategy attempts table
CREATE TABLE IF NOT EXISTS strategy_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  scenario_id INTEGER NOT NULL REFERENCES strategy_scenarios(id) ON DELETE CASCADE,
  user_input TEXT NOT NULL,
  predicted_strategy TEXT NOT NULL CHECK (predicted_strategy IN ('BULLISH', 'BEARISH', 'HEDGING', 'VOLATILITY', 'UNCLEAR')),
  correct_strategy TEXT NOT NULL CHECK (correct_strategy IN ('BULLISH', 'BEARISH', 'HEDGING', 'VOLATILITY')),
  is_correct BOOLEAN NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strategy_attempts_user_id ON strategy_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_attempts_scenario_id ON strategy_attempts(scenario_id);
CREATE INDEX IF NOT EXISTS idx_strategy_attempts_user_scenario ON strategy_attempts(user_id, scenario_id);
CREATE INDEX IF NOT EXISTS idx_strategy_attempts_created_at ON strategy_attempts(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE strategy_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_attempts ENABLE ROW LEVEL SECURITY;

-- Policy for strategy_scenarios - everyone can read
CREATE POLICY "strategy_scenarios_select_policy" ON strategy_scenarios
  FOR SELECT USING (true);

-- Policy for strategy_attempts - users can only see their own attempts
CREATE POLICY "strategy_attempts_select_policy" ON strategy_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for strategy_attempts - users can only insert their own attempts
CREATE POLICY "strategy_attempts_insert_policy" ON strategy_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for strategy_attempts - users can only update their own attempts
CREATE POLICY "strategy_attempts_update_policy" ON strategy_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert initial strategy scenarios
INSERT INTO strategy_scenarios (id, title, content, correct_strategy, difficulty) VALUES
(1, '🚀 Anticipation of a New Product Launch', 'A company called ''Techtron'' is rumored to unveil a groundbreaking product next month. You expect the stock price to rise significantly. How would you invest?', 'BULLISH', 'beginner'),
(2, '📉 Rising Competition Threat', 'You currently own 100 shares of ''EnergySolutions'' purchased at $50 each. A strong new competitor is entering the market, and you worry the stock might fall. How would you protect your investment?', 'HEDGING', 'intermediate'),
(3, '💥 Uncertainty Around Earnings Report', '''BioHealth'' is about to release its quarterly earnings. The results could send the stock sharply up or down. You are not sure about the direction, but you expect extreme volatility. What strategy would you use?', 'VOLATILITY', 'advanced'),
(4, '🌍 Geopolitical Tensions', 'Rising geopolitical tensions in Eastern Europe are causing market uncertainty. You hold no positions yet, but expect sudden downward moves in the overall market index. How would you position yourself with options?', 'BEARISH', 'intermediate'),
(5, '💡 Merger Rumor Buzz', 'News outlets are speculating that ''RetailOne'' may merge with a larger competitor. If the deal goes through, the stock may skyrocket; if not, it could crash. How would you take advantage of this rumor using options?', 'VOLATILITY', 'advanced'),
(6, '📊 Interest Rate Announcement', 'The Federal Reserve is about to announce its decision on interest rates. Markets often react strongly to such news, but it is unclear whether the rates will rise or fall. How would you use options to prepare?', 'VOLATILITY', 'advanced'),
(7, '🎮 Gaming Stock Hype', '''PixelPlay'', a gaming company, is launching its long-awaited blockbuster game this week. You believe the hype could push the stock up temporarily, but you are unsure about its long-term success. What''s your play?', 'BULLISH', 'beginner'),
(8, '🛢️ Oil Price Shock', 'Due to sudden supply chain disruptions, oil prices are swinging wildly. You are considering taking a position in ''GlobalOil'' but are unsure whether prices will stabilize or continue to fluctuate. How would you trade options here?', 'VOLATILITY', 'advanced'),
(9, '📦 Tech Stock Overvaluation?', '''CloudNet'' stock has doubled in the past 6 months. Analysts are split: some say it''s still undervalued, others warn of a bubble. You are cautious but want to explore opportunities with limited downside risk. What''s your strategy?', 'HEDGING', 'intermediate')
ON CONFLICT (id) DO NOTHING;
