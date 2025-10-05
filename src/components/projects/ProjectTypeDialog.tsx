import { Lock, Users, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface ProjectTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (isShared: boolean) => void;
  onJoinProject?: (shareCode: string) => void;
  isJoining?: boolean;
}

export function ProjectTypeDialog({
  open,
  onOpenChange,
  onSelectType,
  onJoinProject,
  isJoining = false,
}: ProjectTypeDialogProps) {
  const [shareCode, setShareCode] = useState('');
  const [showJoinSection, setShowJoinSection] = useState(false);

  const handleJoinProject = () => {
    if (shareCode.trim() && onJoinProject) {
      onJoinProject(shareCode.trim());
      setShareCode('');
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent">
            Create New Adventure
          </DialogTitle>
          <DialogDescription className="text-sm">
            Choose the type of adventure you want to create
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {/* Create New Adventures */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Create New Adventure</h3>
            
            <Button
              onClick={() => onSelectType(false)}
              variant="outline"
              className="h-auto flex-col items-start p-3 sm:p-4 gap-2 hover:border-warm-coral"
            >
              <div className="flex items-center gap-2 sm:gap-3 w-full">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-warm-sand/30 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-warm-coral" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm sm:text-base">Private Adventure</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Only you can access</div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => onSelectType(true)}
              variant="outline"
              className="h-auto flex-col items-start p-3 sm:p-4 gap-2 hover:border-warm-coral"
            >
              <div className="flex items-center gap-2 sm:gap-3 w-full">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm sm:text-base">Shared Adventure</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Collaborate with others via share code
                  </div>
                </div>
              </div>
            </Button>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4 my-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* Join Existing Adventure */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Join Existing Adventure</h3>
            
            {!showJoinSection ? (
              <Button
                onClick={() => setShowJoinSection(true)}
                variant="outline"
                className="h-auto flex-col items-start p-3 sm:p-4 gap-2 hover:border-warm-turquoise"
              >
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-warm-turquoise/20 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-warm-turquoise" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm sm:text-base">Join Adventure</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Enter a share code to join an existing adventure
                    </div>
                  </div>
                </div>
              </Button>
            ) : (
              <div className="space-y-3 p-3 border border-warm-turquoise/20 rounded-lg bg-warm-turquoise/5">
                <div className="text-sm font-medium text-warm-turquoise">Enter Share Code</div>
                <div className="flex gap-2">
                  <Input
                    value={shareCode}
                    onChange={(e) => setShareCode(e.target.value)}
                    placeholder="Enter adventure code..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinProject()}
                  />
                  <Button
                    onClick={handleJoinProject}
                    disabled={!shareCode.trim() || isJoining}
                    size="sm"
                    className="bg-warm-turquoise hover:bg-warm-turquoise/90 text-white"
                  >
                    {isJoining ? 'Joining...' : 'Join'}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowJoinSection(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
