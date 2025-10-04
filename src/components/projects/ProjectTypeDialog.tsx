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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent">
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Choose the type of project you want to create
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <Button
            onClick={() => onSelectType(false)}
            variant="outline"
            className="h-auto flex-col items-start p-4 gap-2 hover:border-warm-coral"
          >
            <div className="flex items-center gap-2 w-full">
              <div className="w-10 h-10 rounded-lg bg-warm-sand/30 flex items-center justify-center">
                <Lock className="w-5 h-5 text-warm-coral" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Private Project</div>
                <div className="text-sm text-muted-foreground">Only you can access</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => onSelectType(true)}
            variant="outline"
            className="h-auto flex-col items-start p-4 gap-2 hover:border-warm-coral"
          >
            <div className="flex items-center gap-2 w-full">
              <div className="w-10 h-10 rounded-lg bg-warm-turquoise/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-warm-turquoise" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Shared Project</div>
                <div className="text-sm text-muted-foreground">
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
