import { ReactNode } from 'react';
import { ArrowLeft, Plane } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { useUser } from '@/api/hooks/use-user';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useUser();
  const showBackButton = location.pathname !== '/app';

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Top bar */}
      <header className="h-16 border-b border-warm-coral/20 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="h-full px-4 flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/app')}
                className="hover:bg-warm-coral/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-sunset flex items-center justify-center shadow-warm">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent">
                TraWell
              </h1>
            </div>
          </div>

          {user && (
            <UserMenu user={{ name: user.name, email: user.email }} />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
