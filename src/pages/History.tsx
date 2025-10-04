import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Plane, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProjects } from '@/api/hooks/use-projects';
import { useTrips } from '@/api/hooks/use-trips';
import { useCreateProject } from '@/api/hooks/use-projects';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function History() {
  const navigate = useNavigate();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const createProjectMutation = useCreateProject();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const handleCreateProject = () => {
    createProjectMutation.mutate(
      { title: 'Nowy projekt' },
      {
        onSuccess: (project) => {
          navigate(`/app/projects/${project.id}`);
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

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Twoje podróże</h1>
          <Button onClick={handleCreateProject} disabled={createProjectMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Nowy projekt
          </Button>
        </div>

        {/* Projects list */}
        {projectsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : !projects || projects.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych projektów</p>
            <Button onClick={handleCreateProject} disabled={createProjectMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Utwórz pierwszy projekt
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => {
              const projectTrips = getProjectTrips(project.id);
              const isExpanded = expandedProjects.has(project.id);

              return (
                <Collapsible
                  key={project.id}
                  open={isExpanded}
                  onOpenChange={() => toggleProject(project.id)}
                >
                  <Card>
                    {/* Project header */}
                    <CollapsibleTrigger asChild>
                      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/5 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FolderKanban className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{project.title}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.createdAt).toLocaleDateString('pl-PL')}
                              {projectTrips.length > 0 && (
                                <>
                                  <span className="mx-1">•</span>
                                  <Plane className="w-3 h-3" />
                                  {projectTrips.length} {projectTrips.length === 1 ? 'podróż' : 'podróży'}
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
                          >
                            Otwórz
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
                          Brak podróży w tym projekcie
                        </div>
                      ) : (
                        <div className="px-4 pb-4 pl-16 space-y-2">
                          {projectTrips.map((trip) => (
                            <div
                              key={trip.id}
                              onClick={() => navigate(`/app/trips/${trip.id}`)}
                              className="p-3 rounded-lg border border-border hover:border-accent hover:bg-accent/5 cursor-pointer transition-all flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <Plane className="w-4 h-4 text-accent" />
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
    </AppShell>
  );
}
