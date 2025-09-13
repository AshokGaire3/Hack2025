import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import NewsNotification from '@/components/NewsNotification';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Trophy, 
  Briefcase,
  Menu,
  X,
  Activity,
  LogOut,
  Loader2,
  Lightbulb,
  BookOpen
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: TrendingUp },
  { name: 'Learning', href: '/learning', icon: BookOpen },
  { name: 'Trading', href: '/trading', icon: Activity },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Strategy', href: '/strategy', icon: Lightbulb },
  { name: 'Quiz', href: '/quiz', icon: Brain },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, loading, signOut } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img 
                  src="/favicon.png" 
                  alt="OPT Lab Logo" 
                  className="w-10 h-10 rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  OPT Lab
                </h1>
                <p className="text-xs text-muted-foreground">Options Trading Simulator</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* News Notification */}
              <div className="ml-4">
                <NewsNotification />
              </div>
              
              {/* Theme Toggle */}
              <div className="ml-2">
                <ThemeToggle />
              </div>
              
              {/* Sign Out Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Actions */}
              <div className="border-t border-border pt-2 mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <NewsNotification />
                    <span className="text-sm text-muted-foreground">News</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <span className="text-sm text-muted-foreground">Theme</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full text-muted-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

    </div>
  );
}