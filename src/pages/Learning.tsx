import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { LearningService, type Lesson, type LearningPath } from '@/services/learningService';
import { SupabaseService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  CheckCircle, 
  Lock, 
  Play,
  Star,
  Target,
  TrendingUp,
  Brain,
  Zap
} from 'lucide-react';

export default function Learning() {
  const { user } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const lessons = LearningService.getLessons();
  const categories = LearningService.getCategories();
  const learningPaths = LearningService.getLearningPaths();

  useEffect(() => {
    // Load completed lessons from localStorage (in real app, from database)
    const completed = localStorage.getItem(`learning_progress_${user?.id}`);
    if (completed) {
      setCompletedLessons(JSON.parse(completed));
    }
  }, [user]);

  const markLessonComplete = async (lessonId: string) => {
    const lesson = LearningService.getLesson(lessonId);
    if (!lesson || !user) return;

    const newCompleted = [...completedLessons, lessonId];
    setCompletedLessons(newCompleted);
    localStorage.setItem(`learning_progress_${user.id}`, JSON.stringify(newCompleted));

    // Award XP for completing the lesson
    try {
      await SupabaseService.updateUserXP(user.id, lesson.xpReward);
      
      toast({
        title: "Lesson Completed! ✨",
        description: `Great job! You earned ${lesson.xpReward} XP for completing "${lesson.title}"`,
      });
    } catch (error) {
      console.log('XP update failed:', error);
      // Still show completion toast even if XP update fails
      toast({
        title: "Lesson Completed! ✨",
        description: `Great job completing "${lesson.title}"!`,
      });
    }
  };

  const isLessonAvailable = (lesson: Lesson): boolean => {
    return LearningService.arePrerequisitesMet(lesson.id, completedLessons);
  };

  const getLessonStatus = (lesson: Lesson): 'completed' | 'available' | 'locked' => {
    if (completedLessons.includes(lesson.id)) return 'completed';
    if (isLessonAvailable(lesson)) return 'available';
    return 'locked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'available': return <Play className="w-4 h-4 text-blue-600" />;
      case 'locked': return <Lock className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const overallProgress = Math.round((completedLessons.length / lessons.length) * 100);

  if (selectedLesson) {
    return <LessonViewer 
      lesson={selectedLesson} 
      onBack={() => setSelectedLesson(null)}
      onComplete={() => markLessonComplete(selectedLesson.id)}
      isCompleted={completedLessons.includes(selectedLesson.id)}
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Learning Platform
        </h1>
        <p className="text-muted-foreground mb-4">Master trading from basics to advanced strategies</p>
        <div className="text-sm text-muted-foreground">
          Progress: {completedLessons.length} of {lessons.length} lessons completed ({overallProgress}%)
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="mb-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Completed: {completedLessons.length}</span>
            <span>Available: {lessons.filter(l => isLessonAvailable(l) && !completedLessons.includes(l.id)).length}</span>
            <span>Locked: {lessons.filter(l => !isLessonAvailable(l)).length}</span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="lessons">All Lessons</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
              {/* Next Lesson Recommendation */}
          {(() => {
            const nextLesson = LearningService.getNextLesson(completedLessons);
            return nextLesson ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Recommended Next</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{nextLesson.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{nextLesson.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{nextLesson.difficulty}</span>
                        <span>{LearningService.formatDuration(nextLesson.duration)}</span>
                        <span>{nextLesson.xpReward} XP</span>
                      </div>
                    </div>
                    <Button onClick={() => setSelectedLesson(nextLesson)}>
                      Start Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardContent className="text-center py-8">
                  <h3 className="text-lg font-semibold">Congratulations!</h3>
                  <p className="text-muted-foreground">You've completed all available lessons!</p>
                </CardContent>
              </Card>
            );
          })()}

          {/* Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map(category => {
              const categoryLessons = LearningService.getLessonsByCategory(category);
              const completedCount = categoryLessons.filter(l => completedLessons.includes(l.id)).length;
              const progress = Math.round((completedCount / categoryLessons.length) * 100);
              const availableCount = categoryLessons.filter(l => isLessonAvailable(l) && !completedLessons.includes(l.id)).length;
              const nextLesson = categoryLessons.find(l => isLessonAvailable(l) && !completedLessons.includes(l.id));


              return (
                <Card 
                  key={category}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setActiveTab('lessons')}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{category}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {categoryLessons.length} lessons • {progress}% complete
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <Progress value={progress} className="mb-4" />
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>Done: {completedCount}</span>
                      <span>Available: {availableCount}</span>
                    </div>

                    {nextLesson && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Next: {nextLesson.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {LearningService.formatDuration(nextLesson.duration)} • {nextLesson.xpReward} XP
                        </p>
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (nextLesson) {
                          setSelectedLesson(nextLesson);
                        } else {
                          setActiveTab('lessons');
                        }
                      }}
                    >
                      {nextLesson ? 'Continue Learning' : completedCount === categoryLessons.length ? 'All Complete!' : 'View Lessons'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Learning Paths Tab */}
        <TabsContent value="paths" className="space-y-4">
          {learningPaths.map(path => {
            const progress = LearningService.getPathProgress(path.id, completedLessons);
            
            return (
              <Card key={path.id}>
                <CardHeader>
                  <CardTitle>{path.title}</CardTitle>
                  <p className="text-muted-foreground">{path.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{path.difficulty}</span>
                    <span>{LearningService.formatDuration(path.estimatedTime)}</span>
                    <span>{progress.completed} of {progress.total} lessons</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={progress.percentage} className="mb-4" />
                  <div className="space-y-1">
                    {path.lessons.map(lessonId => {
                      const lesson = LearningService.getLesson(lessonId);
                      if (!lesson) return null;
                      
                      const status = getLessonStatus(lesson);
                      
                      return (
                        <div key={lessonId} className="flex items-center gap-2 text-sm">
                          {getStatusIcon(status)}
                          <span className={status === 'locked' ? 'text-muted-foreground' : ''}>
                            {lesson.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* All Lessons Tab */}
        <TabsContent value="lessons" className="space-y-8">
          {categories.map(category => {
            const categoryLessons = LearningService.getLessonsByCategory(category);
            const completedCount = categoryLessons.filter(l => completedLessons.includes(l.id)).length;
            const progress = Math.round((completedCount / categoryLessons.length) * 100);
            

            return (
              <div key={category} className="space-y-4">
                {/* Category Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">{category}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{categoryLessons.length} lessons</span>
                    <span>{completedCount}/{categoryLessons.length} complete ({progress}%)</span>
                  </div>
                  <Progress value={progress} />
                </div>
                
                {/* Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {LearningService.getLessonsByCategory(category).map(lesson => {
                  const status = getLessonStatus(lesson);
                  const isClickable = status !== 'locked';
                  
                  return (
                    <Card 
                      key={lesson.id} 
                      className={`cursor-pointer hover:bg-muted/50 ${
                        !isClickable ? 'opacity-60' : ''
                      } ${status === 'completed' ? 'bg-muted/30' : ''}`}
                      onClick={() => isClickable && setSelectedLesson(lesson)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <CardTitle className="text-base">{lesson.title}</CardTitle>
                          </div>
                          <span className="text-xs text-muted-foreground">{lesson.difficulty}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {lesson.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{LearningService.formatDuration(lesson.duration)}</span>
                          <span>{lesson.xpReward} XP</span>
                        </div>
                        {lesson.prerequisites.length > 0 && status === 'locked' && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Prerequisites: {lesson.prerequisites.join(', ')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Lesson Viewer Component
interface LessonViewerProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

function LessonViewer({ lesson, onBack, onComplete, isCompleted }: LessonViewerProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    if (score >= 80 && !isCompleted) { // 80% to pass
      onComplete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Learning
        </Button>
        {isCompleted && (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )}
      </div>

      {/* Lesson Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              <p className="text-muted-foreground mt-1">{lesson.description}</p>
            </div>
            <div className="text-right">
              <Badge className={LearningService.getDifficultyColor(lesson.difficulty)}>
                {lesson.difficulty}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {LearningService.formatDuration(lesson.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {lesson.xpReward} XP
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {lesson.category}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Lesson Content */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-5 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            {lesson.content.split('\n\n').map((paragraph, index) => {
              // Skip empty paragraphs
              if (!paragraph.trim()) return null;
              
              // Check if it's a main title (first line or standalone line without detailed explanation)
              if (paragraph.includes(':') && paragraph.split('\n').length === 1 && !paragraph.includes('•') && 
                  !paragraph.includes('The ') && !paragraph.includes('Price ') && !paragraph.includes('Date ') && 
                  !paragraph.includes('Money ') && !paragraph.includes('Option ') && !paragraph.includes('Right ') &&
                  !paragraph.includes('Sell ') && !paragraph.includes('Buy ') && !paragraph.includes('Measures ') &&
                  paragraph.length < 50) {
                return (
                  <h2 key={index} className="text-base font-medium text-slate-800 dark:text-slate-200 mt-4 mb-2">
                    {paragraph.replace(':', '')}
                  </h2>
                );
              }
              
              // Check if it's a section with bullet points
              if (paragraph.includes('•')) {
                const lines = paragraph.split('\n');
                const title = lines[0];
                const bullets = lines.slice(1).filter(line => line.includes('•'));
                
                return (
                  <div key={index} className="space-y-2">
                    {title && !title.includes('•') && (
                      <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-2">
                        {title.replace(':', '')}
                      </h3>
                    )}
                    <ul className="space-y-1 ml-3">
                      {bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="flex items-start gap-2">
                          <span className="text-slate-500 font-medium mt-0.5 text-xs">•</span>
                          <span className="flex-1 text-sm leading-relaxed">{bullet.replace('•', '').trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              
              // Check if it's a numbered list
              if (paragraph.match(/^\d+\./m)) {
                const lines = paragraph.split('\n');
                const title = lines.find(line => !line.match(/^\d+\./) && line.trim() && !line.includes(':'));
                const numberedItems = lines.filter(line => line.match(/^\d+\./));
                
                return (
                  <div key={index} className="space-y-2">
                    {title && (
                      <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-2">
                        {title.replace(':', '')}
                      </h3>
                    )}
                    <ol className="space-y-1 ml-3">
                      {numberedItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <span className="text-slate-500 font-medium mt-0.5 text-xs">
                            {item.match(/^\d+/)?.[0]}.
                          </span>
                          <span className="flex-1 text-sm leading-relaxed">{item.replace(/^\d+\./, '').trim()}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              }
              
              // Regular paragraph
              return (
                <div key={index} className="space-y-1">
                  {paragraph.split('\n').map((line, lineIndex) => {
                    if (!line.trim()) return null;
                    
                    // Check if it's a subtitle (ends with colon and is likely a section header, not a definition)
                    if (line.trim().endsWith(':') && !line.includes('•') && !line.match(/^\d+\./) && 
                        !line.includes('The ') && !line.includes('Price ') && !line.includes('Date ') && 
                        !line.includes('Money ') && !line.includes('Option ') && !line.includes('Right ') &&
                        !line.includes('Sell ') && !line.includes('Buy ') && !line.includes('Measures ') &&
                        line.length < 30) {
                      return (
                        <h3 key={lineIndex} className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-2 mb-1">
                          {line.replace(':', '')}
                        </h3>
                      );
                    }
                    
                    return (
                      <p key={lineIndex} className="text-sm leading-relaxed">
                        {line}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Section */}
      {lesson.quiz && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Knowledge Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showQuiz ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Test your understanding with a quick quiz
                </p>
                <Button onClick={() => setShowQuiz(true)}>
                  Start Quiz
                </Button>
              </div>
            ) : (
              <LessonQuiz 
                quiz={lesson.quiz} 
                onComplete={handleQuizComplete}
                score={quizScore}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Completion Button */}
      {!isCompleted && (!lesson.quiz || quizScore !== null) && (
        <div className="text-center">
          <Button 
            onClick={onComplete}
            size="lg"
            disabled={lesson.quiz && (quizScore === null || quizScore < 80)}
          >
            Complete Lesson (+{lesson.xpReward} XP)
          </Button>
        </div>
      )}
    </div>
  );
}

// Quiz Component
interface LessonQuizProps {
  quiz: { questions: any[] };
  onComplete: (score: number) => void;
  score: number | null;
}

function LessonQuiz({ quiz, onComplete, score }: LessonQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const correct = quiz.questions.reduce((count, question, index) => {
        return count + (newAnswers[index] === question.correctAnswer ? 1 : 0);
      }, 0);
      const finalScore = Math.round((correct / quiz.questions.length) * 100);
      onComplete(finalScore);
      setShowResults(true);
    }
  };

  if (showResults && score !== null) {
    const passed = score >= 80;
    return (
      <div className="text-center py-8">
        <div className={`text-4xl font-bold mb-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {score}%
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${passed ? 'text-green-800' : 'text-red-800'}`}>
          {passed ? 'Great job!' : 'Keep studying!'}
        </h3>
        <p className="text-muted-foreground">
          {passed 
            ? 'You can now proceed to the next lesson.' 
            : 'You need 80% to pass. Review the content and try again.'
          }
        </p>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </h3>
        <Progress value={(currentQuestion / quiz.questions.length) * 100} className="w-32" />
      </div>

      <div className="space-y-4">
        <h4 className="text-base font-medium">{question.question}</h4>
        <div className="space-y-2">
          {question.options.map((option: string, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto p-4"
              onClick={() => handleAnswer(index)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
