import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, MapPin, Calendar, Star, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjectTrips } from '@/api/hooks/use-trips';
import { useBrainstormTrips } from '@/api/hooks/use-brainstorm';

interface AdventureTripsProps {
  adventureId: string;
  adventureType: 'project' | 'brainstorm';
  isExpanded: boolean;
  onToggle: () => void;
}

interface MappedTrip {
  id: string;
  title: string;
  locationName: string;
  imageUrl?: string;
  createdAt: string;
  rating?: number;
  status: string;
  startDate?: string;
  endDate?: string;
}

export function AdventureTrips({ 
  adventureId, 
  adventureType, 
  isExpanded, 
  onToggle 
}: AdventureTripsProps) {
  const navigate = useNavigate();
  const { data: projectTrips, isLoading: projectTripsLoading } = useProjectTrips(
    adventureType === 'project' ? adventureId : ''
  );
  const { data: brainstormTrips, isLoading: brainstormTripsLoading } = useBrainstormTrips(
    adventureType === 'brainstorm' ? adventureId : ''
  );

  // Map brainstorm trips to consistent format
  const mappedBrainstormTrips: MappedTrip[] = brainstormTrips?.map((trip: unknown) => {
    // Type guard to ensure trip is an object
    if (!trip || typeof trip !== 'object') {
      return {
        id: 'invalid-trip',
        title: 'Invalid Trip Data',
        locationName: 'Unknown',
        imageUrl: undefined,
        createdAt: new Date().toISOString(),
        rating: undefined,
        status: 'pending',
      };
    }
    
    const tripObj = trip as Record<string, unknown>;
    const destination = (tripObj.destination as Record<string, unknown>) || {};
    const title = (destination.name as string) || (destination.city as string) || (tripObj.title as string) || 'Trip';
    const locationName = (destination.city as string) || (destination.name as string) || (tripObj.locationName as string) || 'Unknown';
    const imageUrl = (destination.imageUrl as string) || (tripObj.url as string) || (tripObj.imageUrl as string);
    const createdAt = (tripObj.created_at as string) || (tripObj.createdAt as string) || new Date().toISOString();
    const rating = (destination.rating as number) || (tripObj.rating as number);
    const status = (tripObj.status as string) || 'pending';
    
    return {
      id: (tripObj.recommendation_id as string) || (tripObj.id as string) || 'unknown-id',
      title,
      locationName,
      imageUrl,
      createdAt,
      rating,
      status,
    };
  }) || [];

  const trips: MappedTrip[] = adventureType === 'project' ? (projectTrips as MappedTrip[]) : mappedBrainstormTrips;
  const isLoading = adventureType === 'project' ? projectTripsLoading : brainstormTripsLoading;
  const tripCount = trips?.length || 0;

  // Debug logs
  console.log('AdventureTrips - adventureType:', adventureType);
  console.log('AdventureTrips - projectTrips:', projectTrips);
  console.log('AdventureTrips - brainstormTrips:', brainstormTrips);
  console.log('AdventureTrips - mappedBrainstormTrips:', mappedBrainstormTrips);
  console.log('AdventureTrips - trips:', trips);

  const handleTripClick = (trip: MappedTrip) => {
    if (trip.id) {
      navigate(`/app/trips/${trip.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="ml-13 mt-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
          <div className="w-4 h-4 border-2 border-warm-coral/30 border-t-warm-coral rounded-full animate-spin" />
          Loading trips...
        </div>
      </div>
    );
  }

  if (tripCount === 0) {
    return (
      <div className="ml-13 mt-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
          <MapPin className="w-4 h-4" />
          No trips yet
        </div>
      </div>
    );
  }

  return (
    <div className="ml-13 mt-1">
      {/* Toggle button with better styling */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-warm-coral/10 rounded-lg border border-warm-coral/20 bg-card/50"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 mr-2" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2" />
        )}
        <MapPin className="w-4 h-4 mr-1" />
        {tripCount} {tripCount === 1 ? 'trip' : 'trips'}
      </Button>

      {/* Trips list with better grouping */}
      {isExpanded && (
        <div className="mt-3 ml-4 border-l-2 border-warm-coral/20 pl-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-warm-coral uppercase tracking-wide">
              Your Trips
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/gallery')}
              className="h-6 px-2 text-xs text-warm-coral hover:text-warm-coral/80 hover:bg-warm-coral/10"
            >
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {trips?.map((trip: MappedTrip, index: number) => {
              // Validate trip data and provide fallbacks
              if (!trip || typeof trip !== 'object') {
                console.warn('Invalid trip data:', trip);
                return null;
              }

              const tripTitle = trip.title || 'Untitled Trip';
              const tripLocation = trip.locationName || 'Unknown Location';
              const tripImageUrl = trip.imageUrl;
              const tripCreatedAt = trip.createdAt || new Date().toISOString();
              const tripRating = trip.rating;
              const tripStatus = trip.status || 'pending';

              return (
                <Card
                  key={trip.id || `trip-${index}`}
                  className="group p-4 border-warm-coral/15 bg-gradient-to-r from-warm-coral/3 to-warm-turquoise/3 hover:from-warm-coral/8 hover:to-warm-turquoise/8 hover:border-warm-coral/25 transition-all duration-200 cursor-pointer hover:shadow-sm"
                  onClick={() => handleTripClick(trip)}
                >
                  <div className="flex items-center gap-4">
                    {/* Trip image or icon */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-warm group-hover:scale-105 transition-transform overflow-hidden">
                      {tripImageUrl ? (
                        <img
                          src={tripImageUrl}
                          alt={tripTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-sunset flex items-center justify-center ${tripImageUrl ? 'hidden' : ''}`}>
                        <Plane className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Trip details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate mb-1">
                        {tripTitle}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                        <span>
                          {trip.startDate ? 
                            new Date(trip.startDate).toLocaleDateString() : 
                            new Date(tripCreatedAt).toLocaleDateString()
                          }
                        </span>
                        </div>
                        {tripRating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{tripRating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex-shrink-0 flex flex-col gap-1">
                      {tripStatus === 'active' && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          Active
                        </Badge>
                      )}
                      {trip.startDate && trip.endDate && (
                        <Badge variant="outline" className="text-xs w-fit border-warm-coral/30 text-warm-coral">
                          Planned
                        </Badge>
                      )}
                      {!tripStatus && !trip.startDate && (
                        <Badge variant="outline" className="text-xs w-fit border-warm-turquoise/30 text-warm-turquoise">
                          Idea
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
