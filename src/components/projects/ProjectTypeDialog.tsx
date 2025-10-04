import { Lock, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ProjectTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (isShared: boolean) => void;
}

export function ProjectTypeDialog({
  open,
  onOpenChange,
  onSelectType,
}: ProjectTypeDialogProps) {
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
      </DialogContent>
    </Dialog>
  );
}
