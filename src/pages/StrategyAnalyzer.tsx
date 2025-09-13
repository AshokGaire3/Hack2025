import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Lightbulb, TrendingUp, TrendingDown, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SupabaseService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';

// Trading scenarios from the Flask app
const SCENARIOS = [
  {
    id: 1,
    title: "🚀 Anticipation of a New Product Launch",
    content: "A company called 'Techtron' is rumored to unveil a groundbreaking product next month. You expect the stock price to rise significantly. How would you invest?"
  },
  {
    id: 2,
    title: "📉 Rising Competition Threat",
    content: "You currently own 100 shares of 'EnergySolutions' purchased at $50 each. A strong new competitor is entering the market, and you worry the stock might fall. How would you protect your investment?"
  },
  {
    id: 3,
    title: "💥 Uncertainty Around Earnings Report",
    content: "'BioHealth' is about to release its quarterly earnings. The results could send the stock sharply up or down. You are not sure about the direction, but you expect extreme volatility. What strategy would you use?"
  },
  {
    id: 4,
    title: "🌍 Geopolitical Tensions",
    content: "Rising geopolitical tensions in Eastern Europe are causing market uncertainty. You hold no positions yet, but expect sudden downward moves in the overall market index. How would you position yourself with options?"
  },
  {
    id: 5,
    title: "💡 Merger Rumor Buzz",
    content: "News outlets are speculating that 'RetailOne' may merge with a larger competitor. If the deal goes through, the stock may skyrocket; if not, it could crash. How would you take advantage of this rumor using options?"
  },
  {
    id: 6,
    title: "📊 Interest Rate Announcement",
    content: "The Federal Reserve is about to announce its decision on interest rates. Markets often react strongly to such news, but it is unclear whether the rates will rise or fall. How would you use options to prepare?"
  },
  {
    id: 7,
    title: "🎮 Gaming Stock Hype",
    content: "'PixelPlay', a gaming company, is launching its long-awaited blockbuster game this week. You believe the hype could push the stock up temporarily, but you are unsure about its long-term success. What's your play?"
  },
  {
    id: 8,
    title: "🛢️ Oil Price Shock",
    content: "Due to sudden supply chain disruptions, oil prices are swinging wildly. You are considering taking a position in 'GlobalOil' but are unsure whether prices will stabilize or continue to fluctuate. How would you trade options here?"
  },
  {
    id: 9,
    title: "📦 Tech Stock Overvaluation?",
    content: "'CloudNet' stock has doubled in the past 6 months. Analysts are split: some say it's still undervalued, others warn of a bubble. You are cautious but want to explore opportunities with limited downside risk. What's your strategy?"
  }
];

// Strategy definitions from the Flask app
const STRATEGIES = {
  "BULLISH": {
    name: "Long Call",
    description: "Buying a call option gives you the right to purchase the stock at a set price in the future. You profit if the stock rises significantly.",
    reason: "This is the most direct bullish strategy to bet on a rising stock price.",
    icon: TrendingUp,
    color: "bg-green-100 text-green-800",
    xp_reward: 15
  },
  "BEARISH": {
    name: "Long Put",
    description: "Buying a put option gives you the right to sell the stock at a set price in the future. You profit if the stock falls sharply.",
    reason: "This strategy benefits when you expect a stock's value to decrease.",
    icon: TrendingDown,
    color: "bg-red-100 text-red-800",
    xp_reward: 15
  },
  "HEDGING": {
    name: "Protective Put",
    description: "You buy a put option while holding the underlying stock to insure against downside risk. It works like an insurance policy.",
    reason: "Protects your existing stock position from major losses.",
    icon: Shield,
    color: "bg-blue-100 text-blue-800",
    xp_reward: 20
  },
  "VOLATILITY": {
    name: "Long Straddle",
    description: "Buying both a call and a put option with the same strike price and expiration. Profits if the stock moves sharply in either direction.",
    reason: "Best for situations with high uncertainty and expected volatility.",
    icon: Zap,
    color: "bg-purple-100 text-purple-800",
    xp_reward: 25
  },
  "UNCLEAR": {
    name: "Unclear Strategy",
    description: "The input is too vague for classification. Please clarify your intention (e.g., expecting price rise, fall, or just hedging).",
    reason: "The AI could not determine a clear investment intention.",
    icon: Lightbulb,
    color: "bg-gray-100 text-gray-800",
    xp_reward: 0
  }
};

interface AnalysisResult {
  intent: keyof typeof STRATEGIES;
  reason: string;
  strategy: {
    name: string;
    description: string;
    reason: string;
  };
}

const StrategyAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [currentScenario, setCurrentScenario] = useState(SCENARIOS[0]);
  const [userInput, setUserInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [completedScenarios, setCompletedScenarios] = useState<Set<number>>(new Set());
  const [scenarioAttempts, setScenarioAttempts] = useState<Map<number, number>>(new Map());
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [correctAnswerForScenario, setCorrectAnswerForScenario] = useState<keyof typeof STRATEGIES | null>(null);

  // Load user profile and get a random scenario on component mount
  useEffect(() => {
    const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setCurrentScenario(randomScenario);
    setCorrectAnswerForScenario(getCorrectAnswerForScenario(randomScenario.id));
    
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      let profile = await SupabaseService.getUserProfile(user.id);
      if (!profile) {
        // Fallback profile
        profile = {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          balance: 10000,
          total_xp: 0,
          level: 1,
          created_at: new Date().toISOString()
        };
      }
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback profile
      const fallbackProfile = {
        id: user.id,
        username: user.email?.split('@')[0] || 'User',
        balance: 10000,
        total_xp: 0,
        level: 1,
        created_at: new Date().toISOString()
      };
      setUserProfile(fallbackProfile);
    }
  };

  // Load user's strategy data from database
  const loadUserStrategyData = async () => {
    if (!user) return;
    
    try {
      // Load completed scenarios
      const completed = await SupabaseService.getCompletedScenarios(user.id);
      setCompletedScenarios(new Set(completed));
      
      // Load attempt counts for all scenarios
      const attemptCounts = new Map<number, number>();
      for (const scenario of SCENARIOS) {
        const count = await SupabaseService.getScenarioAttemptCount(user.id, scenario.id);
        if (count > 0) {
          attemptCounts.set(scenario.id, count);
        }
      }
      setScenarioAttempts(attemptCounts);
    } catch (error) {
      console.error('Error loading user strategy data:', error);
      // Fallback to local storage or default state
    }
  };

  // Function to determine the correct answer for each scenario
  const getCorrectAnswerForScenario = (scenarioId: number): keyof typeof STRATEGIES => {
    // Define correct answers for each scenario based on the scenario content
    const correctAnswers: { [key: number]: keyof typeof STRATEGIES } = {
      1: "BULLISH",     // Product launch - expect stock to rise
      2: "HEDGING",     // Competition threat - protect existing position
      3: "VOLATILITY",  // Earnings uncertainty - expect volatility
      4: "BEARISH",     // Geopolitical tensions - expect downward moves
      5: "VOLATILITY",  // Merger rumor - could go either way
      6: "VOLATILITY",  // Interest rate announcement - uncertain direction
      7: "BULLISH",     // Gaming hype - temporary price increase
      8: "VOLATILITY",  // Oil price shock - wild swings
      9: "HEDGING"      // Tech overvaluation - cautious with limited downside
    };
    
    return correctAnswers[scenarioId] || "UNCLEAR";
  };

  const getNewScenario = () => {
    const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setCurrentScenario(randomScenario);
    setUserInput('');
    setAnalysisResult(null);
    setError(null);
    setShowCorrectAnswer(false);
    setCorrectAnswerForScenario(getCorrectAnswerForScenario(randomScenario.id));
    
    // Reload user strategy data to get updated attempt counts
    if (user) {
      loadUserStrategyData();
    }
  };

  const analyzeStrategy = async () => {
    if (!userInput.trim()) {
      setError('Please provide your thoughts on the scenario.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // For now, we'll simulate the AI analysis since we don't have the Gemini API integrated
      // In a real implementation, you would call your backend API here
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simple keyword-based classification for demo purposes
      const input = userInput.toLowerCase();
      let intent: keyof typeof STRATEGIES = "UNCLEAR";
      let reason = "Based on keyword analysis of your input.";

      if (input.includes('buy') && (input.includes('call') || input.includes('rise') || input.includes('up'))) {
        intent = "BULLISH";
        reason = "You mentioned buying calls or expecting price increases.";
      } else if (input.includes('put') || input.includes('fall') || input.includes('down') || input.includes('short')) {
        intent = "BEARISH";
        reason = "You mentioned puts or expecting price decreases.";
      } else if (input.includes('protect') || input.includes('hedge') || input.includes('insurance')) {
        intent = "HEDGING";
        reason = "You mentioned protection or hedging strategies.";
      } else if (input.includes('straddle') || input.includes('volatility') || input.includes('uncertain')) {
        intent = "VOLATILITY";
        reason = "You mentioned uncertainty or volatility strategies.";
      }

      const strategy = STRATEGIES[intent];
      
      setAnalysisResult({
        intent,
        reason,
        strategy
      });

      // Track attempts for this scenario
      const currentAttempts = scenarioAttempts.get(currentScenario.id) || 0;
      const newAttempts = currentAttempts + 1;
      setScenarioAttempts(prev => new Map(prev.set(currentScenario.id, newAttempts)));

      // Check if the user got the correct answer
      const isCorrectAnswer = intent === correctAnswerForScenario;
      const xpEarned = isCorrectAnswer && !completedScenarios.has(currentScenario.id) ? strategy.xp_reward : 0;

      // Save attempt to database
      if (user) {
        try {
          await SupabaseService.submitStrategyAttempt({
            user_id: user.id,
            scenario_id: currentScenario.id,
            user_input: userInput.trim(),
            predicted_strategy: intent,
            correct_strategy: correctAnswerForScenario!,
            is_correct: isCorrectAnswer,
            attempt_number: newAttempts,
            xp_earned: xpEarned
          });
        } catch (error) {
          console.error('Error saving strategy attempt:', error);
          // Continue with local state management even if database save fails
        }
      }

      // Award XP if the strategy is correct and scenario hasn't been completed
      if (xpEarned > 0 && user && userProfile) {
        
        try {
          // Try to update XP in database
          await SupabaseService.updateUserXP(user.id, xpEarned);
          
          // Update local profile state
          const newTotalXP = (userProfile.total_xp || 0) + xpEarned;
          const newLevel = Math.floor(newTotalXP / 100) + 1;
          
          setUserProfile({
            ...userProfile,
            total_xp: newTotalXP,
            level: newLevel
          });

          // Mark scenario as completed
          setCompletedScenarios(prev => new Set([...prev, currentScenario.id]));

          // Show success toast
          toast({
            title: "Great Analysis! 🎉",
            description: `You earned ${xpEarned} XP for identifying the ${strategy.name} strategy!`,
          });

        } catch (xpError) {
          console.log('XP update failed, using local state');
          // Update local state even if database fails
          const newTotalXP = (userProfile.total_xp || 0) + xpEarned;
          const newLevel = Math.floor(newTotalXP / 100) + 1;
          
          setUserProfile({
            ...userProfile,
            total_xp: newTotalXP,
            level: newLevel
          });

          // Mark scenario as completed
          setCompletedScenarios(prev => new Set([...prev, currentScenario.id]));

          // Show success toast
          toast({
            title: "Great Analysis! 🎉",
            description: `You earned ${xpEarned} XP for identifying the ${strategy.name} strategy!`,
          });
        }
      } else if (!isCorrectAnswer && newAttempts >= 3) {
        // Show correct answer after 3 failed attempts
        setShowCorrectAnswer(true);
        toast({
          title: "Here's the correct answer! 📚",
          description: `After 3 attempts, the correct strategy is: ${STRATEGIES[correctAnswerForScenario!].name}`,
        });
      } else if (!isCorrectAnswer && newAttempts === 2) {
        // Give a hint on the second attempt
        const correctStrategy = STRATEGIES[correctAnswerForScenario!];
        toast({
          title: "Not quite right! 💡",
          description: `Hint: Think about ${correctStrategy.reason.toLowerCase()} Try one more time!`,
          variant: "destructive"
        });
      } else if (!isCorrectAnswer) {
        // First incorrect attempt
        toast({
          title: "Not the optimal strategy",
          description: "Think about the scenario more carefully. What's the main concern or opportunity?",
          variant: "destructive"
        });
      } else if (intent === "UNCLEAR") {
        toast({
          title: "Try to be more specific",
          description: "Provide clearer details about your trading strategy to earn XP!",
          variant: "destructive"
        });
      } else if (completedScenarios.has(currentScenario.id)) {
        toast({
          title: "Already completed!",
          description: "You've already analyzed this scenario. Try a new one to earn more XP!",
        });
      }

    } catch (err) {
      setError('Failed to analyze strategy. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const StrategyIcon = analysisResult ? STRATEGIES[analysisResult.intent].icon : Lightbulb;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Strategy Analyzer
          </h1>
          <p className="text-muted-foreground mt-2">
            Get personalized options trading strategies powered by AI
          </p>
        </div>
        {userProfile && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Level {userProfile.level || 1}</p>
            <p className="text-2xl font-bold text-accent">{userProfile.total_xp || 0} XP</p>
            <p className="text-xs text-muted-foreground">
              {100 - ((userProfile.total_xp || 0) % 100)} XP to next level
            </p>
          </div>
        )}
      </div>

      {/* Current Scenario */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Scenario {currentScenario.id}: {currentScenario.title}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={getNewScenario}>
              New Scenario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {currentScenario.content}
          </p>
          {scenarioAttempts.get(currentScenario.id) > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Attempts: {scenarioAttempts.get(currentScenario.id)} / 3
                </span>
                {scenarioAttempts.get(currentScenario.id) >= 2 && !showCorrectAnswer && (
                  <span className="text-warning font-medium">
                    {3 - scenarioAttempts.get(currentScenario.id)!} attempts left
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Your Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="What would you do in this situation? Share your thoughts..."
            className="min-h-[120px]"
          />
          <Button 
            onClick={analyzeStrategy}
            disabled={isAnalyzing || !userInput.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Strategy...
              </>
            ) : (
              'Analyze Strategy'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-4">
          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StrategyIcon className="h-5 w-5" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <Badge className={STRATEGIES[analysisResult.intent].color}>
                  {analysisResult.intent}
                </Badge>
                <p className="text-sm text-muted-foreground flex-1">
                  {analysisResult.reason}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Strategy */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">
                  Recommended Strategy: {analysisResult.strategy.name}
                </CardTitle>
                {STRATEGIES[analysisResult.intent].xp_reward > 0 && (
                  <div className="flex items-center text-accent">
                    <Zap className="h-4 w-4 mr-1" />
                    <span className="font-medium">{STRATEGIES[analysisResult.intent].xp_reward} XP</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                {analysisResult.strategy.description}
              </p>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Why this strategy:</span> {analysisResult.strategy.reason}
                </p>
              </div>
              {completedScenarios.has(currentScenario.id) && (
                <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                  <p className="text-sm text-accent font-medium">
                    ✅ Scenario completed! You've already earned XP for this analysis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Correct Answer Reveal */}
      {showCorrectAnswer && correctAnswerForScenario && (
        <Card className="border-accent bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center text-accent">
              <Lightbulb className="h-5 w-5 mr-2" />
              Correct Answer Revealed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-accent">
                  {STRATEGIES[correctAnswerForScenario].name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {STRATEGIES[correctAnswerForScenario].description}
                </p>
              </div>
              <div className="flex items-center text-accent">
                <Zap className="h-4 w-4 mr-1" />
                <span className="font-medium">{STRATEGIES[correctAnswerForScenario].xp_reward} XP</span>
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Why this strategy:</span> {STRATEGIES[correctAnswerForScenario].reason}
              </p>
            </div>
            <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
              <p className="text-sm text-accent font-medium">
                💡 Don't worry! Learning from mistakes is part of mastering options trading. Try the next scenario!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              🎯 <strong>Earn XP:</strong> Get 15-25 XP for correct strategy analysis! 
            </p>
            <p className="mb-2">
              💡 <strong>Strategy Rewards:</strong> Bullish/Bearish (15 XP), Hedging (20 XP), Volatility (25 XP)
            </p>
            <p className="mb-2">
              📚 <strong>Learning System:</strong> Get hints after 2 attempts, see correct answer after 3 attempts
            </p>
            <p>
              Try different scenarios to earn more XP and level up your trading knowledge!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyAnalyzer;
