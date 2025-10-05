import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Calendar, ChevronRight, Palmtree, Users as UsersIcon, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/api/hooks/use-user';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateProject, useJoinProject, useProjects } from '@/api/hooks/use-projects';
import { useBrainstormSessions, useCreateBrainstormSession } from '@/api/hooks/use-brainstorm';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { ProjectTypeDialog } from '@/components/projects/ProjectTypeDialog';
import { JoinProjectDialog } from '@/components/projects/JoinProjectDialog';
import { toast } from 'sonner';

export default function History() {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const { data: brainstormSessions, isLoading: brainstormLoading } = useBrainstormSessions();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const createProjectMutation = useCreateProject();
  const createBrainstormMutation = useCreateBrainstormSession();
  const joinProjectMutation = useJoinProject();
  const [showProjectTypeDialog, setShowProjectTypeDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const handleSelectProjectType = (isShared: boolean) => {
    setShowProjectTypeDialog(false);

    if (isShared) {
      // Use old project system for shared adventures
      createProjectMutation.mutate(
        { title: 'New Project', isShared },
        {
          onSuccess: (result) => {
            if (result.shareCode) {
              toast.success(`Project created! Share code: ${result.shareCode}`);
            }
            navigate(`/app/projects/${result.id}`);
          },
        }
      );
    } else {
      // Use new brainstorm system for solo adventures
      createBrainstormMutation.mutate(undefined, {
        onSuccess: (result) => {
          toast.success('New brainstorm session created!');
          navigate(`/app/brainstorm/${result.session_id}`);
        },
        onError: () => {
          toast.error('Failed to create brainstorm session');
        },
      });
    }
  };

  const handleJoinProject = (shareCode: string) => {
    joinProjectMutation.mutate(
      { shareCode },
      {
        onSuccess: () => {
          setShowJoinDialog(false);
          // Project will appear in the list automatically due to query invalidation
        },
        onError: () => {
          toast.error('Invalid share code. Please check and try again.');
        },
      }
    );
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-3xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent">Your Trips</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowJoinDialog(true)}
              variant="outline"
              size="sm"
              className="sm:px-4"
            >
              <UserPlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Join Adventure</span>
            </Button>
            <Button 
              onClick={() => setShowProjectTypeDialog(true)}
              disabled={createProjectMutation.isPending}
              size="sm"
              className="bg-gradient-sunset hover:opacity-90 text-white shadow-warm border-0 sm:px-4"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New Adventure</span>
            </Button>
          </div>
        </div>

        {/* Combined list of projects and brainstorm sessions */}
        {(brainstormLoading || projectsLoading) ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (!brainstormSessions || brainstormSessions.length === 0) && (!projects || projects.length === 0) ? (
          <Card className="p-12 text-center border-dashed border-warm-coral/30 bg-gradient-to-br from-warm-coral/5 to-warm-turquoise/5">
            <div className="w-20 h-20 rounded-full bg-gradient-sunset flex items-center justify-center mb-4 mx-auto shadow-warm">
              <Palmtree className="w-10 h-10 text-white" />
            </div>
            <p className="text-muted-foreground mb-4">You don't have any adventures yet</p>
            <Button
              onClick={() => setShowProjectTypeDialog(true)}
              disabled={createBrainstormMutation.isPending}
              className="bg-gradient-sunset hover:opacity-90 text-white shadow-warm border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Adventure
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {/* Projects (shared adventures) */}
            {projects && projects.map((project) => {
              const isShared = project.isShared;

              return (
                <Card
                  key={project.id}
                  className={cn(
                    "border-warm-coral/20 bg-card/80 backdrop-blur-sm cursor-pointer hover:bg-warm-coral/5 transition-colors",
                    isShared && "border-warm-turquoise/40 bg-warm-turquoise/5"
                  )}
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-warm",
                        isShared
                          ? "bg-gradient-to-br from-warm-turquoise to-warm-turquoise/80"
                          : "bg-gradient-sunset"
                      )}>
                        {isShared ? (
                          <UsersIcon className="w-5 h-5 text-white" />
                        ) : (
                          <FolderKanban className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate sm:max-w-none max-w-[150px]">{project.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.createdAt).toLocaleDateString('en-US')}
                          {project.lastMessagePreview && (
                            <>
                              <span className="mx-1">•</span>
                              <span>Project</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isShared && (
                        <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                          Shared
                        </Badge>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Brainstorm Sessions (solo adventures) */}
            {brainstormSessions && brainstormSessions.map((session) => {
              const isShared = session.isShared;

              return (
                <Card
                  key={session.id}
                  className={cn(
                    "border-warm-coral/20 bg-card/80 backdrop-blur-sm cursor-pointer hover:bg-warm-coral/5 transition-colors",
                    isShared && "border-warm-turquoise/40 bg-warm-turquoise/5"
                  )}
                  onClick={() => navigate(`/app/brainstorm/${session.id}`)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-warm",
                        isShared
                          ? "bg-gradient-to-br from-warm-turquoise to-warm-turquoise/80"
                          : "bg-gradient-sunset"
                      )}>
                        {isShared ? (
                          <UsersIcon className="w-5 h-5 text-white" />
                        ) : (
                          <FolderKanban className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate sm:max-w-none max-w-[150px]">{session.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.createdAt).toLocaleDateString('en-US')}
                          <span className="mx-1">•</span>
                          {session.messageCount} {session.messageCount === 1 ? 'message' : 'messages'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isShared && (
                        <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                          Shared
                        </Badge>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ProjectTypeDialog
        open={showProjectTypeDialog}
        onOpenChange={setShowProjectTypeDialog}
        onSelectType={handleSelectProjectType}
      />
      <JoinProjectDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onJoin={handleJoinProject}
        isLoading={joinProjectMutation.isPending}
      />
    </AppShell>
  );
}
