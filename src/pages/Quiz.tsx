import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { SupabaseService, type Quiz } from '@/services/supabaseService';
import { Brain, CheckCircle, XCircle, Zap, Trophy, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function QuizPage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [completedAttempts, setCompletedAttempts] = useState<any[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadQuizzes();
    }
  }, [user]);

  const loadUserData = async () => {
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
      
      try {
        const attempts = await SupabaseService.getQuizAttempts(user.id);
        setCompletedAttempts(attempts);
      } catch (attemptError) {
        console.log('Using fallback attempts data');
        setCompletedAttempts([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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
      setCompletedAttempts([]);
    }
  };

  const loadQuizzes = async () => {
    try {
      const quizData = await SupabaseService.getQuizzes();
      setQuizzes(quizData);
      
      // Find next available quiz
      const completedQuizIds = completedAttempts.map(attempt => attempt.quiz_id);
      const nextQuiz = quizData.find(quiz => !completedQuizIds.includes(quiz.id.toString()));
      setCurrentQuiz(nextQuiz || null);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      // Fallback quiz data
      const fallbackQuizzes = [
        {
          id: 1,
          question: "What is an option?",
          choices: [
            "A contract that gives the right to buy or sell an asset",
            "A type of stock",
            "A bond certificate",
            "A savings account"
          ],
          correct_choice: 0,
          difficulty: "beginner",
          xp_reward: 10,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          question: "What does 'strike price' mean in options trading?",
          choices: [
            "The current market price",
            "The price at which the option can be exercised",
            "The premium paid for the option",
            "The expiration date"
          ],
          correct_choice: 1,
          difficulty: "beginner",
          xp_reward: 15,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          question: "What is the Black-Scholes model used for?",
          choices: [
            "Calculating stock dividends",
            "Pricing options contracts",
            "Determining interest rates",
            "Measuring market volatility"
          ],
          correct_choice: 1,
          difficulty: "intermediate",
          xp_reward: 25,
          created_at: new Date().toISOString()
        }
      ];
      
      setQuizzes(fallbackQuizzes);
      
      // Find next available quiz
      const completedQuizIds = completedAttempts.map(attempt => attempt.quiz_id);
      const nextQuiz = fallbackQuizzes.find(quiz => !completedQuizIds.includes(quiz.id.toString()));
      setCurrentQuiz(nextQuiz || fallbackQuizzes[0]);
    }
  };

  const loadNextQuiz = () => {
    const completedQuizIds = completedAttempts.map(attempt => attempt.quiz_id);
    const nextQuiz = quizzes.find(quiz => !completedQuizIds.includes(quiz.id.toString()));
    setCurrentQuiz(nextQuiz || null);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null || !currentQuiz || !user) return;

    setLoading(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const correct = selectedAnswer === currentQuiz.correct_choice;
      setIsCorrect(correct);
      setShowResult(true);

      // Try to submit quiz attempt to database
      try {
        await SupabaseService.submitQuizAttempt(
          user.id,
          currentQuiz.id.toString(),
          { selectedAnswer },
          correct ? 1 : 0,
          1,
          correct
        );

        if (correct) {
          // Try to award XP
          try {
            await SupabaseService.updateUserXP(user.id, currentQuiz.xp_reward);
          } catch (xpError) {
            console.log('XP update failed, using local state');
            // Update local state instead
            if (userProfile) {
              setUserProfile({
                ...userProfile,
                total_xp: (userProfile.total_xp || 0) + currentQuiz.xp_reward,
                level: Math.floor(((userProfile.total_xp || 0) + currentQuiz.xp_reward) / 100) + 1
              });
            }
          }
        }

        // Try to update completed attempts
        try {
          const attempts = await SupabaseService.getQuizAttempts(user.id);
          setCompletedAttempts(attempts);
        } catch (attemptError) {
          console.log('Attempts update failed, using local state');
          // Add to local completed attempts
          const newAttempt = {
            id: Date.now().toString(),
            user_id: user.id,
            quiz_id: currentQuiz.id.toString(),
            score: correct ? 1 : 0,
            total_questions: 1,
            is_correct: correct,
            created_at: new Date().toISOString()
          };
          setCompletedAttempts(prev => [...prev, newAttempt]);
        }

      } catch (dbError) {
        console.log('Database submission failed, continuing with local state');
        // Still show the result and update local state
        if (correct && userProfile) {
          setUserProfile({
            ...userProfile,
            total_xp: (userProfile.total_xp || 0) + currentQuiz.xp_reward,
            level: Math.floor(((userProfile.total_xp || 0) + currentQuiz.xp_reward) / 1000) + 1
          });
        }
        
        // Add to local completed attempts
        const newAttempt = {
          id: Date.now().toString(),
          user_id: user.id,
          quiz_id: currentQuiz.id.toString(),
          score: correct ? 1 : 0,
          total_questions: 1,
          is_correct: correct,
          created_at: new Date().toISOString()
        };
        setCompletedAttempts(prev => [...prev, newAttempt]);
      }

      if (correct) {
        toast({
          title: "Correct! 🎉",
          description: `You earned ${currentQuiz.xp_reward} XP!`,
        });
      } else {
        toast({
          title: "Incorrect",
          description: "Study the explanation and try the next question!",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error submitting quiz answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-profit';
      case 'intermediate': return 'text-warning';
      case 'advanced': return 'text-loss';
      default: return 'text-muted-foreground';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-profit/20 text-profit border-profit/30';
      case 'intermediate': return 'bg-warning/20 text-warning border-warning/30';
      case 'advanced': return 'bg-loss/20 text-loss border-loss/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  if (!currentQuiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <Trophy className="h-16 w-16 text-accent" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-accent mb-2">Congratulations!</h2>
          <p className="text-muted-foreground">
            You've completed all available quizzes. More questions coming soon!
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Quizzes Completed</p>
          <p className="text-3xl font-bold text-primary">{completedAttempts.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Trading Knowledge Quiz
          </h1>
          <p className="text-muted-foreground">Test your options trading knowledge and earn XP</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Current XP</p>
          <p className="text-2xl font-bold text-accent">{userProfile?.total_xp || 0}</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="glow-trading">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Progress</p>
                <p className="text-sm text-muted-foreground">
                  {completedAttempts.length} of {quizzes.length} quizzes completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Level {userProfile?.level || 1}</p>
              <p className="text-lg font-bold text-accent">{(userProfile?.total_xp || 0) % 100} / 100 XP</p>
            </div>
          </div>
          <Progress value={quizzes.length > 0 ? (completedAttempts.length / quizzes.length) * 100 : 0} className="h-2" />
        </CardContent>
      </Card>

      {/* Quiz Card */}
      <Card className="relative overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Question {completedAttempts.length + 1}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyBadge(currentQuiz.difficulty)}`}>
                {currentQuiz.difficulty}
              </span>
              <div className="flex items-center text-accent">
                <Zap className="h-4 w-4 mr-1" />
                <span className="font-medium">{currentQuiz.xp_reward} XP</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="p-6 bg-secondary/50 rounded-lg">
            <p className="text-lg font-medium leading-relaxed">{currentQuiz.question}</p>
          </div>

          {/* Answer Choices */}
          <div className="space-y-3">
            {(currentQuiz.choices as string[]).map((choice, index) => {
              let buttonClass = "w-full p-4 text-left border-2 transition-all duration-200 hover:border-primary/50";
              
              if (showResult) {
                if (index === currentQuiz.correct_choice) {
                  buttonClass += " border-profit bg-profit/10 text-profit";
                } else if (index === selectedAnswer && !isCorrect) {
                  buttonClass += " border-loss bg-loss/10 text-loss";
                } else {
                  buttonClass += " border-muted bg-muted/20 text-muted-foreground";
                }
              } else if (selectedAnswer === index) {
                buttonClass += " border-primary bg-primary/10 text-primary";
              } else {
                buttonClass += " border-border hover:bg-secondary/50";
              }

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{choice}</span>
                    {showResult && index === currentQuiz.correct_choice && (
                      <CheckCircle className="h-5 w-5 ml-auto text-profit" />
                    )}
                    {showResult && index === selectedAnswer && !isCorrect && (
                      <XCircle className="h-5 w-5 ml-auto text-loss" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Result Explanation */}
          {showResult && (
            <div className={`p-6 rounded-lg border-2 ${isCorrect ? 'border-profit bg-profit/5' : 'border-loss bg-loss/5'}`}>
              <div className="flex items-start space-x-3">
                {isCorrect ? (
                  <CheckCircle className="h-6 w-6 text-profit mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-loss mt-0.5" />
                )}
                <div>
                  <h4 className={`font-medium mb-2 ${isCorrect ? 'text-profit' : 'text-loss'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {/* Note: Add explanation field to quiz table if needed */}
                    {isCorrect ? 'Great job! You got it right.' : 'Not quite right, but keep learning!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={loadNextQuiz}>
              Skip Question
            </Button>
            
            {!showResult ? (
              <Button 
                onClick={submitAnswer} 
                disabled={selectedAnswer === null || loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking...
                  </div>
                ) : (
                  'Submit Answer'
                )}
              </Button>
            ) : (
              <Button onClick={loadNextQuiz} className="bg-gradient-to-r from-primary to-accent">
                Next Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}