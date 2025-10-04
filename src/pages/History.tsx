import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Plane, Calendar, ChevronDown, ChevronRight, Palmtree, Users, UserPlus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBrainstorms, useCreateProject, useJoinProject } from '@/api/hooks/use-brainstorms';
import { useTrips } from '@/api/hooks/use-trips';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProjectTypeDialog } from '@/components/brainstorms/ProjectTypeDialog';
import { JoinProjectDialog } from '@/components/brainstorms/JoinProjectDialog';
import { toast } from 'sonner';

export default function History() {
  const navigate = useNavigate();
  const { data: brainstorms, isLoading: BrainstormsLoading } = useBrainstorms();
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const createProjectMutation = useCreateProject();
  const joinProjectMutation = useJoinProject();
  const [expandedBrainstorms, setExpandedBrainstorms] = useState<Set<string>>(new Set());
  const [showProjectTypeDialog, setShowProjectTypeDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const handleSelectProjectType = (isShared: boolean) => {
    setShowProjectTypeDialog(false);
    createProjectMutation.mutate(
      { title: 'New Project', isShared },
      {
        onSuccess: (result) => {
          if (isShared && result.shareCode) {
            toast.success(`Project created! Share code: ${result.shareCode}`);
          }
          navigate(`/app/brainstorms/${result.id}`);
        },
      }
    );
  };

  const handleJoinProject = (shareCode: string) => {
    joinProjectMutation.mutate(
      { shareCode },
      {
        onSuccess: (result) => {
          setShowJoinDialog(false);
          toast.success('Joined project successfully!');
          navigate(`/app/brainstorms/${result.projectId}`);
        },
        onError: () => {
          toast.error('Invalid share code. Please check and try again.');
        },
      }
    );
  };

  const toggleProject = (projectId: string) => {
    setExpandedBrainstorms((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const getProjectTrips = (projectId: string) => {
    return trips?.filter((trip) => trip.projectId === projectId) || [];
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
              className="hidden sm:flex"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Project
            </Button>
            <Button 
              onClick={() => setShowProjectTypeDialog(true)}
              disabled={createProjectMutation.isPending}
              className="bg-gradient-sunset hover:opacity-90 text-white shadow-warm border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* brainstorms list */}
        {BrainstormsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : !brainstorms || brainstorms.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-warm-coral/30 bg-gradient-to-br from-warm-coral/5 to-warm-turquoise/5">
            <div className="w-20 h-20 rounded-full bg-gradient-sunset flex items-center justify-center mb-4 mx-auto shadow-warm">
              <Palmtree className="w-10 h-10 text-white" />
            </div>
            <p className="text-muted-foreground mb-4">You don't have any brainstorms yet</p>
            <Button 
              onClick={() => setShowProjectTypeDialog(true)}
              disabled={createProjectMutation.isPending}
              className="bg-gradient-sunset hover:opacity-90 text-white shadow-warm border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {brainstorms.map((project) => {
              const projectTrips = getProjectTrips(project.id);
              const isExpanded = expandedBrainstorms.has(project.id);

              return (
                <Collapsible
                  key={project.id}
                  open={isExpanded}
                  onOpenChange={() => toggleProject(project.id)}
                >
                  <Card className="border-warm-coral/20 bg-card/80 backdrop-blur-sm">
                    {/* Project header */}
                    <CollapsibleTrigger asChild>
                      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-warm-coral/5 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-gradient-sunset flex items-center justify-center flex-shrink-0 shadow-warm">
                            {project.isShared ? (
                              <Users className="w-5 h-5 text-white" />
                            ) : (
                              <FolderKanban className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{project.title}</h3>
                              {project.isShared && (
                                <Badge variant="secondary" className="text-xs">
                                  Shared
                                </Badge>
                              )}
                            </div>
                             <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.createdAt).toLocaleDateString('en-US')}
                              {projectTrips.length > 0 && (
                                <>
                                  <span className="mx-1">•</span>
                                  <Plane className="w-3 h-3" />
                                  {projectTrips.length} {projectTrips.length === 1 ? 'trip' : 'trips'}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/app/brainstorms/${project.id}`);
                            }}
                            className="hover:bg-warm-coral/10"
                          >
                            Open
                          </Button>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* Project trips */}
                    <CollapsibleContent>
                      {projectTrips.length === 0 ? (
                        <div className="px-4 pb-4 pl-16 text-sm text-muted-foreground">
                          No trips in this project yet
                        </div>
                      ) : (
                        <div className="px-4 pb-4 pl-16 space-y-2">
                          {projectTrips.map((trip) => (
                            <div
                              key={trip.id}
                              onClick={() => navigate(`/app/trips/${trip.id}`)}
                              className="p-3 rounded-lg border border-warm-coral/20 hover:border-warm-coral hover:bg-warm-coral/5 cursor-pointer transition-all flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded bg-warm-turquoise/20 flex items-center justify-center flex-shrink-0">
                                <Plane className="w-4 h-4 text-warm-turquoise" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{trip.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {trip.locationName}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
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
