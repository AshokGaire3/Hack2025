import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface WelcomeToLearningProps {
  userLevel?: number;
  className?: string;
}

export default function WelcomeToLearning({ userLevel = 1, className = '' }: WelcomeToLearningProps) {
  const navigate = useNavigate();

  // Show different messages based on user level
  const getWelcomeMessage = () => {
    if (userLevel === 1) {
      return {
        title: "Start Your Trading Journey! 🚀",
        description: "New to trading? Our learning platform will guide you from the basics to advanced strategies.",
        cta: "Begin with 'What is a Stock?'",
        highlight: "Perfect for beginners"
      };
    } else if (userLevel < 5) {
      return {
        title: "Continue Learning! 📚",
        description: "You're making great progress! Continue building your trading knowledge with our structured lessons.",
        cta: "Continue Learning Path",
        highlight: "Building momentum"
      };
    } else {
      return {
        title: "Master Advanced Strategies! 🎯",
        description: "Ready for advanced concepts? Dive into complex options strategies and risk management.",
        cta: "Explore Advanced Topics",
        highlight: "Advanced trader"
      };
    }
  };

  const message = getWelcomeMessage();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{message.title}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {message.highlight}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{message.description}</p>
        
        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          <div>• From stocks to options</div>
          <div>• Interactive quizzes</div>
          <div>• Earn XP & level up</div>
        </div>

        <Button 
          onClick={() => navigate('/learning')}
          className="w-full"
        >
          {message.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
