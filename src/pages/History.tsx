import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderKanban, Plane, Calendar, MessageSquare } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProjects } from '@/api/hooks/use-projects';
import { useTrips } from '@/api/hooks/use-trips';
import { useUIStore } from '@/store/ui-store';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function History() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const openCreateProjectModal = useUIStore((s) => s.openCreateProjectModal);
  const openCreateTripModal = useUIStore((s) => s.openCreateTripModal);

  const filteredProjects =
    projects?.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredTrips =
    trips?.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Twoje podróże</h1>
              <p className="text-muted-foreground mt-1">
                Zarządzaj projektami i planuj nowe wyprawy
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Szukaj projektów lub podróży..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">Wszystkie</TabsTrigger>
            <TabsTrigger value="projects">
              <FolderKanban className="w-4 h-4 mr-2" />
              Projekty
            </TabsTrigger>
            <TabsTrigger value="trips">
              <Plane className="w-4 h-4 mr-2" />
              Podróże
            </TabsTrigger>
          </TabsList>

          {/* All */}
          <TabsContent value="all" className="space-y-6 mt-6">
            {/* Projects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-primary" />
                  Projekty
                </h2>
                <Button onClick={openCreateProjectModal} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nowy projekt
                </Button>
              </div>

              {projectsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FolderKanban className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nie masz jeszcze żadnych projektów</p>
                    <Button onClick={openCreateProjectModal} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Utwórz pierwszy projekt
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                      onClick={() => navigate(`/app/projects/${project.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-start justify-between gap-2">
                          <span className="line-clamp-1">{project.title}</span>
                          <FolderKanban className="w-5 h-5 text-primary flex-shrink-0" />
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.createdAt).toLocaleDateString('pl-PL')}
                        </CardDescription>
                      </CardHeader>
                      {project.lastMessagePreview && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {project.lastMessagePreview}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Trips Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Plane className="w-5 h-5 text-accent" />
                  Podróże
                </h2>
              </div>

              {tripsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : filteredTrips.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Plane className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nie masz jeszcze żadnych podróży</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Utwórz podróż z poziomu projektu
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTrips.map((trip) => (
                    <Card
                      key={trip.id}
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-accent"
                      onClick={() => navigate(`/app/trips/${trip.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-start justify-between gap-2">
                          <span className="line-clamp-1">{trip.title}</span>
                          <Plane className="w-5 h-5 text-accent flex-shrink-0" />
                        </CardTitle>
                        <CardDescription className="flex flex-col gap-1">
                          <span className="font-medium">{trip.locationName}</span>
                          <span className="text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(trip.createdAt).toLocaleDateString('pl-PL')}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      {trip.lastMessagePreview && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {trip.lastMessagePreview}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Projects only */}
          <TabsContent value="projects" className="mt-6">
            {/* Same as projects section above */}
          </TabsContent>

          {/* Trips only */}
          <TabsContent value="trips" className="mt-6">
            {/* Same as trips section above */}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
