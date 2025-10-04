import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Plane, Calendar, ChevronDown, ChevronRight, Palmtree, Users as UsersIcon, UserPlus, MapPin, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/api/hooks/use-user';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjects, useCreateProject, useJoinProject } from '@/api/hooks/use-projects';
import { useTrips } from '@/api/hooks/use-trips';
import { mockLocations, iguanaLocation } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProjectTypeDialog } from '@/components/projects/ProjectTypeDialog';
import { JoinProjectDialog } from '@/components/projects/JoinProjectDialog';
import { toast } from 'sonner';

export default function History() {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const createProjectMutation = useCreateProject();
  const joinProjectMutation = useJoinProject();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
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
          navigate(`/app/projects/${result.id}`);
        },
      }
    );
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

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
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

  const getLocationImage = (locationId: string) => {
    const allLocations = [...mockLocations, iguanaLocation];
    const location = allLocations.find(loc => loc.id === locationId);
    return location?.imageUrl;
  };

  const isTripActive = (trip: any) => {
    if (!trip.startDate || !trip.endDate) return false;
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    // Active if within trip dates or within 2 days before/after
    const twoDaysBefore = new Date(start.getTime() - 2 * 24 * 60 * 60 * 1000);
    const twoDaysAfter = new Date(end.getTime() + 2 * 24 * 60 * 60 * 1000);
    return now >= twoDaysBefore && now <= twoDaysAfter;
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

        {/* Projects list */}
        {projectsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : !projects || projects.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-warm-coral/30 bg-gradient-to-br from-warm-coral/5 to-warm-turquoise/5">
            <div className="w-20 h-20 rounded-full bg-gradient-sunset flex items-center justify-center mb-4 mx-auto shadow-warm">
              <Palmtree className="w-10 h-10 text-white" />
            </div>
            <p className="text-muted-foreground mb-4">You don't have any adventures yet</p>
            <Button 
              onClick={() => setShowProjectTypeDialog(true)}
              disabled={createProjectMutation.isPending}
              className="bg-gradient-sunset hover:opacity-90 text-white shadow-warm border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Adventure
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => {
              const projectTrips = getProjectTrips(project.id);
              const isExpanded = expandedProjects.has(project.id);
              const isSharedNotOwned = project.isShared && project.ownerId && project.ownerId !== user?.id;

              return (
                <Collapsible
                  key={project.id}
                  open={isExpanded}
                  onOpenChange={() => toggleProject(project.id)}
                >
                  <Card className={cn(
                    "border-warm-coral/20 bg-card/80 backdrop-blur-sm",
                    isSharedNotOwned && "border-warm-turquoise/40 bg-warm-turquoise/5"
                  )}>
                    {/* Project header */}
                    <CollapsibleTrigger asChild>
                      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-warm-coral/5 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-warm",
                            project.isShared 
                              ? "bg-gradient-to-br from-warm-turquoise to-warm-turquoise/80" 
                              : "bg-gradient-sunset"
                          )}>
                            {project.isShared ? (
                              <UsersIcon className="w-5 h-5 text-blue-600" />
                            ) : (
                              <FolderKanban className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate sm:max-w-none max-w-[150px]">{project.title}</h3>
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
                              navigate(`/app/projects/${project.id}`);
                            }}
                            className="hover:bg-warm-coral/10"
                          >
                            Chat
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
                          No trips in this adventure yet
                        </div>
                      ) : (
                        <div className="px-4 pb-4 pl-16 space-y-2">
                          {projectTrips.map((trip) => {
                            const isTripSharedNotOwned = isSharedNotOwned;
                            const locationImage = getLocationImage(trip.locationId);
                            
                            return (
                              <div
                                key={trip.id}
                                onClick={() => navigate(`/app/trips/${trip.id}`)}
                                className={cn(
                                  "p-3 rounded-lg border hover:bg-warm-coral/5 cursor-pointer transition-all flex items-center gap-3",
                                  isTripSharedNotOwned ? "border-warm-turquoise/30" : "border-warm-coral/20 hover:border-warm-coral"
                                )}
                              >
                                {locationImage ? (
                                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 relative">
                                    <img 
                                      src={locationImage} 
                                      alt={trip.locationName}
                                      className="w-full h-full object-cover"
                                    />
                                    {isTripSharedNotOwned && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                        <UsersIcon className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className={cn(
                                    "w-12 h-12 rounded flex items-center justify-center flex-shrink-0 relative",
                                    isTripSharedNotOwned ? "bg-warm-turquoise/20" : "bg-warm-turquoise/20"
                                  )}>
                                    <MapPin className="w-5 h-5 text-warm-turquoise" />
                                    {isTripSharedNotOwned && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                        <UsersIcon className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{trip.title}</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs text-muted-foreground truncate">
                                      {trip.locationName}
                                    </p>
                                    {isTripActive(trip) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/app/trips/${trip.id}/live`);
                                        }}
                                        className="h-5 px-1.5 gap-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                      >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <Radio className="w-3 h-3" />
                                        <span>Live</span>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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
