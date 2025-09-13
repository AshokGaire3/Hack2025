import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, ExternalLink, TrendingUp, BarChart3, Target, BookOpen } from 'lucide-react';
import { NewsService, type NewsItem } from '@/services/newsService';

interface NewsNotificationProps {
  className?: string;
}

export default function NewsNotification({ className = '' }: NewsNotificationProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNews();
    
    // Set up periodic news refresh (every 5 minutes)
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const latestNews = await NewsService.getTopNews(8);
      setNews(latestNews);
      
      // Simulate unread count (in a real app, this would be based on last read timestamp)
      const recentNews = latestNews.filter(item => {
        const publishedTime = new Date(item.publishedAt).getTime();
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        return publishedTime > oneHourAgo;
      });
      setUnreadCount(recentNews.length);
      
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark as read when opened
      setUnreadCount(0);
    }
  };

  const getCategoryIcon = (category: NewsItem['category']) => {
    switch (category) {
      case 'options': return <Target className="w-3 h-3" />;
      case 'market': return <TrendingUp className="w-3 h-3" />;
      case 'earnings': return <BarChart3 className="w-3 h-3" />;
      case 'analysis': return <BookOpen className="w-3 h-3" />;
      default: return <Bell className="w-3 h-3" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
          onClick={handleNewsClick}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Options Trading News
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadNews}
                disabled={loading}
                className="h-6 px-2 text-xs"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {news.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No news available</p>
                </div>
              ) : (
                news.map((item, index) => (
                  <div key={item.id}>
                    <div className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getCategoryIcon(item.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium leading-tight line-clamp-2">
                              {item.title}
                            </h4>
                            <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {item.summary}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs px-1.5 py-0.5 ${NewsService.getCategoryColor(item.category)}`}
                              >
                                {item.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {item.source}
                              </span>
                            </div>
                            
                            <span className="text-xs text-muted-foreground">
                              {NewsService.getTimeAgo(item.publishedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {index < news.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </div>
            
            {news.length > 0 && (
              <>
                <Separator />
                <div className="p-3">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View All News
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
