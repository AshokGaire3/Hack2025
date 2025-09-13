import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Lightbulb, TrendingUp, TrendingDown, Shield, Zap } from 'lucide-react';

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
    color: "bg-green-100 text-green-800"
  },
  "BEARISH": {
    name: "Long Put",
    description: "Buying a put option gives you the right to sell the stock at a set price in the future. You profit if the stock falls sharply.",
    reason: "This strategy benefits when you expect a stock's value to decrease.",
    icon: TrendingDown,
    color: "bg-red-100 text-red-800"
  },
  "HEDGING": {
    name: "Protective Put",
    description: "You buy a put option while holding the underlying stock to insure against downside risk. It works like an insurance policy.",
    reason: "Protects your existing stock position from major losses.",
    icon: Shield,
    color: "bg-blue-100 text-blue-800"
  },
  "VOLATILITY": {
    name: "Long Straddle",
    description: "Buying both a call and a put option with the same strike price and expiration. Profits if the stock moves sharply in either direction.",
    reason: "Best for situations with high uncertainty and expected volatility.",
    icon: Zap,
    color: "bg-purple-100 text-purple-800"
  },
  "UNCLEAR": {
    name: "Unclear Strategy",
    description: "The input is too vague for classification. Please clarify your intention (e.g., expecting price rise, fall, or just hedging).",
    reason: "The AI could not determine a clear investment intention.",
    icon: Lightbulb,
    color: "bg-gray-100 text-gray-800"
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
  const [currentScenario, setCurrentScenario] = useState(SCENARIOS[0]);
  const [userInput, setUserInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get a random scenario on component mount
  useEffect(() => {
    const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setCurrentScenario(randomScenario);
  }, []);

  const getNewScenario = () => {
    const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setCurrentScenario(randomScenario);
    setUserInput('');
    setAnalysisResult(null);
    setError(null);
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

    } catch (err) {
      setError('Failed to analyze strategy. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const StrategyIcon = analysisResult ? STRATEGIES[analysisResult.intent].icon : Lightbulb;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AI Strategy Analyzer
        </h1>
        <p className="text-muted-foreground mt-2">
          Get personalized options trading strategies powered by AI
        </p>
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
              <CardTitle className="text-primary">
                Recommended Strategy: {analysisResult.strategy.name}
              </CardTitle>
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              💡 <strong>Note:</strong> This is a simplified demo version. 
            </p>
            <p>
              In production, this would connect to Google's Gemini AI for sophisticated strategy analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyAnalyzer;
