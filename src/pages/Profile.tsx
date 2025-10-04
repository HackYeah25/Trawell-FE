import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users as UsersIcon, 
  Heart,
  ArrowLeft,
  Plane,
  Settings
} from 'lucide-react';
import { useUser } from '@/api/hooks/use-user';
import { EditPreferencesDialog } from '@/components/profile/EditPreferencesDialog';
import { useToast } from '@/hooks/use-toast';

// Mock profile data collected during onboarding
const mockProfileData = {
  travelPreferences: {
    type: 'Beach relaxation, city exploration',
    budget: 'Medium',
    timing: 'Summer 2025',
    companions: 'Couple',
  },
  favoriteDestinations: [
    'Val Thorens, France',
    'Livigno, Italy',
    'Sölden, Austria',
  ],
  interests: [
    'Skiing',
    'Mountains',
    'Local culture',
    'Gastronomy',
    'Photography',
  ],
};

export default function Profile() {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [profileData, setProfileData] = useState(mockProfileData);

  if (!user) return null;

  const handleSavePreferences = (data: {
    preferences: typeof mockProfileData.travelPreferences;
    interests: string[];
    destinations: string[];
  }) => {
    setProfileData({
      travelPreferences: data.preferences,
      interests: data.interests,
      favoriteDestinations: data.destinations,
    });
    toast({
      title: "Preferences updated",
      description: "Your travel preferences have been saved successfully.",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/app')}
          className="mb-4 hover:bg-warm-coral/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        {/* Header Card */}
        <Card className="border-warm-coral/20 bg-gradient-to-br from-warm-coral/5 to-warm-turquoise/5 shadow-warm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-warm-coral/20 shadow-warm">
                <AvatarFallback className="bg-gradient-sunset text-primary-foreground text-3xl font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <CardTitle className="text-3xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent mb-2">
                  {user.name}
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-warm-coral" />
                    {user.email}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <Badge variant="secondary" className="bg-warm-turquoise/10 text-warm-turquoise border-warm-turquoise/20">
                    <Plane className="w-3 h-3 mr-1" />
                    Travel Enthusiast
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Travel Preferences */}
        <Card className="border-warm-coral/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Heart className="w-5 h-5 text-warm-coral" />
                  Travel Preferences
                </CardTitle>
                <CardDescription>Your travel style and preferences</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="border-warm-coral/20 hover:bg-warm-coral/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-warm-coral/5 border border-warm-coral/10">
                <MapPin className="w-5 h-5 text-warm-coral mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Travel Type</p>
                  <p className="text-foreground">{profileData.travelPreferences.type}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-warm-turquoise/5 border border-warm-turquoise/10">
                <DollarSign className="w-5 h-5 text-warm-turquoise mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Budget Range</p>
                  <p className="text-foreground">{profileData.travelPreferences.budget}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-warm-sand/20 border border-warm-sand/30">
                <Calendar className="w-5 h-5 text-warm-coral mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Preferred Timing</p>
                  <p className="text-foreground">{profileData.travelPreferences.timing}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-warm-coral/5 border border-warm-coral/10">
                <UsersIcon className="w-5 h-5 text-warm-coral mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Travel Companions</p>
                  <p className="text-foreground">{profileData.travelPreferences.companions}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card className="border-warm-coral/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-5 h-5 text-warm-turquoise" />
              Interests
            </CardTitle>
            <CardDescription>Activities and experiences you enjoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profileData.interests.map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-warm-coral/10 to-warm-turquoise/10 border-warm-coral/20 hover:from-warm-coral/20 hover:to-warm-turquoise/20 transition-colors"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favorite Destinations */}
        <Card className="border-warm-coral/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="w-5 h-5 text-warm-sand" />
              Favorite Destinations
            </CardTitle>
            <CardDescription>Places you've shown interest in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profileData.favoriteDestinations.map((destination, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-warm-sand/10 to-warm-turquoise/5 border border-warm-sand/20 hover:border-warm-coral/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-sunset flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-foreground font-medium">{destination}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="border-warm-coral/20 bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-warm-coral" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Account Status</span>
              <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium">January 2025</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Onboarding</span>
              <Badge className="bg-warm-turquoise/10 text-warm-turquoise border-warm-turquoise/20">
                Completed
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditPreferencesDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        preferences={profileData.travelPreferences}
        interests={profileData.interests}
        destinations={profileData.favoriteDestinations}
        onSave={handleSavePreferences}
      />
    </AppShell>
  );
}
