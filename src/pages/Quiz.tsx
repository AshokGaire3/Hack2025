import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizStore, TradingStore, Quiz } from '@/lib/store';
import { User } from '@/lib/trading';
import { Brain, CheckCircle, XCircle, Zap, Trophy, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function QuizPage() {
  const [user, setUser] = useState<User>(TradingStore.getUser());
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);

  useEffect(() => {
    loadNextQuiz();
    setCompletedQuizzes(QuizStore.getCompletedQuizzes());
  }, []);

  const loadNextQuiz = () => {
    const nextQuiz = QuizStore.getNextQuiz();
    setCurrentQuiz(nextQuiz);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null || !currentQuiz) return;

    setLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const correct = selectedAnswer === currentQuiz.correctChoice;
    setIsCorrect(correct);
    setShowResult(true);
    setLoading(false);

    if (correct) {
      // Award XP and mark quiz as completed
      const updatedUser = TradingStore.updateUserXP(currentQuiz.xpReward);
      setUser(updatedUser);
      QuizStore.markQuizCompleted(currentQuiz.id);
      setCompletedQuizzes(QuizStore.getCompletedQuizzes());

      toast({
        title: "Correct! 🎉",
        description: `You earned ${currentQuiz.xpReward} XP!`,
      });
    } else {
      toast({
        title: "Incorrect",
        description: "Study the explanation and try the next question!",
        variant: "destructive"
      });
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
          <p className="text-3xl font-bold text-primary">{completedQuizzes.length}</p>
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
          <p className="text-2xl font-bold text-accent">{user.xp.toLocaleString()}</p>
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
                  {completedQuizzes.length} of 5 quizzes completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Level {user.level}</p>
              <p className="text-lg font-bold text-accent">{user.xp % 1000} / 1000 XP</p>
            </div>
          </div>
          <Progress value={(completedQuizzes.length / 5) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Quiz Card */}
      <Card className="relative overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Question {completedQuizzes.length + 1}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyBadge(currentQuiz.difficulty)}`}>
                {currentQuiz.difficulty}
              </span>
              <div className="flex items-center text-accent">
                <Zap className="h-4 w-4 mr-1" />
                <span className="font-medium">{currentQuiz.xpReward} XP</span>
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
            {currentQuiz.choices.map((choice, index) => {
              let buttonClass = "w-full p-4 text-left border-2 transition-all duration-200 hover:border-primary/50";
              
              if (showResult) {
                if (index === currentQuiz.correctChoice) {
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
                    {showResult && index === currentQuiz.correctChoice && (
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
                  <p className="text-muted-foreground leading-relaxed">{currentQuiz.explanation}</p>
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