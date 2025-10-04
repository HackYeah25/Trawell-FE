import type {
  User,
  OnboardingQuestion,
  Project,
  Trip,
  ChatMessage,
  Location,
  Attraction,
  TripSummary,
} from '@/types';

// User data
export let mockUser: User = {
  id: '1',
  name: 'Jan Kowalski',
  email: 'jan@example.com',
  onboardingCompleted: false,
};

// Initial project questions (asked when starting a new project)
export const initialProjectQuestions: ChatMessage[] = [
  {
    id: 'pq1',
    role: 'assistant',
    markdown: 'Witaj! Zacznijmy planowanie Twojej podróży. Dokąd chciałbyś pojechać?',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pq2',
    role: 'assistant',
    markdown: 'Jaki jest Twój budżet na tę podróż?',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pq3',
    role: 'assistant',
    markdown: 'Jakie masz preferencje dotyczące zakwaterowania i transportu?',
    createdAt: new Date().toISOString(),
  },
];

// Onboarding questions
export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 'q1',
    markdownQuestion:
      '**Pytanie 1/4:** Jaki rodzaj podróży Cię interesuje?\n\n(Przykład: relaks na plaży, eksploracja miast, aktywność w górach, etc.)',
  },
  {
    id: 'q2',
    markdownQuestion:
      '**Pytanie 2/4:** Jaki masz budżet na tę podróż?\n\n(Przykład: ekonomiczny, średni, premium)',
  },
  {
    id: 'q3',
    markdownQuestion:
      '**Pytanie 3/4:** Kiedy planujesz wyjazd?\n\n(Przykład: lato 2025, zima 2025, elastycznie)',
  },
  {
    id: 'q4',
    markdownQuestion:
      '**Pytanie 4/4:** Z kim podróżujesz?\n\n(Przykład: sam/sama, para, rodzina z dziećmi, grupa przyjaciół)',
  },
];

// Post-attraction questions
export const postAttractionQuestions: OnboardingQuestion[] = [
  {
    id: 'pq1',
    markdownQuestion:
      '**Pytanie 1/3:** Czy posiadasz wszystkie wymagane szczepienia do tej destynacji?\n\n(Przykład: tak/nie/nie wiem)',
  },
  {
    id: 'pq2',
    markdownQuestion:
      '**Pytanie 2/3:** Czy potrzebujesz wizy do tego kraju?\n\n(Przykład: tak/nie/nie sprawdzałem)',
  },
  {
    id: 'pq3',
    markdownQuestion:
      '**Pytanie 3/3:** Czy masz już ubezpieczenie podróżne?\n\n(Przykład: tak/nie/planuję wykupić)',
  },
];

// Default projects and trips
export let mockProjects: Project[] = [
  {
    id: 'default-proj-1',
    title: 'My Summer Adventure 2025',
    createdAt: new Date('2025-01-15').toISOString(),
    lastMessagePreview: 'Planning an amazing summer getaway...',
    isShared: false,
    hasLocationSuggestions: true, // Has location suggestions ready
  },
];

export let mockTrips: Trip[] = [
  {
    id: 'default-trip-1',
    projectId: 'default-proj-1',
    locationId: 'loc1',
    locationName: 'Val Thorens, France',
    title: 'Val Thorens Ski Trip',
    createdAt: new Date('2025-01-16').toISOString(),
  },
  {
    id: 'default-trip-2',
    projectId: 'default-proj-1',
    locationId: 'loc2',
    locationName: 'Livigno, Italy',
    title: 'Livigno Winter Escape',
    createdAt: new Date('2025-01-17').toISOString(),
  },
];

export let mockProjectMessages: Record<string, ChatMessage[]> = {
  'default-proj-1': [
    {
      id: 'initial-msg-1',
      role: 'assistant',
      markdown: 'Welcome to your summer adventure planning! I\'ve prepared some great destinations for you.',
      createdAt: new Date('2025-01-15').toISOString(),
    },
  ],
};

export let mockTripMessages: Record<string, ChatMessage[]> = {
  'default-trip-1': [
    {
      id: 'trip-msg-1',
      role: 'assistant',
      markdown: 'Welcome to **Val Thorens**! 🎿\n\nThis is the highest ski resort in Europe. What activities interest you?',
      createdAt: new Date('2025-01-16').toISOString(),
    },
  ],
  'default-trip-2': [
    {
      id: 'trip-msg-2',
      role: 'assistant',
      markdown: 'Welcome to **Livigno**! 🏔️\n\nA duty-free paradise in the Alps. Let\'s plan your perfect trip!',
      createdAt: new Date('2025-01-17').toISOString(),
    },
  ],
};

export let mockAttractions: Record<string, Attraction[]> = {
  'default-trip-1': [
    {
      id: 'attr-vt-1',
      title: 'Gondola Ride',
      description: 'Spectacular views of the Alps on a modern gondola',
      category: 'Transport',
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',
    },
    {
      id: 'attr-vt-2',
      title: 'Ski School (2 days)',
      description: 'Professional courses for beginners and advanced skiers',
      category: 'Activities',
      imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
    },
  ],
  'default-trip-2': [
    {
      id: 'attr-liv-1',
      title: 'Duty-Free Shopping',
      description: 'Explore the unique tax-free shopping opportunities',
      category: 'Shopping',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
    },
    {
      id: 'attr-liv-2',
      title: 'Snowboarding Park',
      description: 'World-class freestyle park with various difficulty levels',
      category: 'Activities',
      imageUrl: 'https://images.unsplash.com/photo-1519315901367-02a8e4b98e12?w=600&q=80',
    },
  ],
};

// Special shared project (only accessible via ABC123 code)
export const specialSharedProject: Project = {
  id: 'shared-proj-abc123',
  title: 'Team Adventure - Alps Explorer',
  createdAt: new Date('2025-01-10').toISOString(),
  lastMessagePreview: 'Collaborative trip planning for the whole team',
  isShared: true,
  shareCode: 'ABC123',
  ownerId: 'other-user-123', // Not owned by current user
  hasLocationSuggestions: true, // Has location suggestions ready
};

// Special shared project with complete trip (accessible via IGUANA code)
export const iguanaSharedProject: Project = {
  id: 'shared-proj-iguana',
  title: 'Barcelona Group Trip 2025',
  createdAt: new Date('2025-01-08').toISOString(),
  lastMessagePreview: 'Group planning for Barcelona adventure',
  isShared: true,
  shareCode: 'IGUANA',
  ownerId: 'user-sarah-456',
};

export const iguanaTrip: Trip = {
  id: 'trip-iguana-bcn',
  projectId: 'shared-proj-iguana',
  locationId: 'loc-barcelona',
  locationName: 'Barcelona, Spain',
  title: 'Barcelona Summer Adventure',
  createdAt: new Date('2025-01-09').toISOString(),
};

export const iguanaLocation: Location = {
  id: 'loc-barcelona',
  name: 'Barcelona',
  country: 'Spain',
  teaser: 'Vibrant Mediterranean city with stunning architecture, beaches, and culture',
  imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
};

// Available locations
export const mockLocations: Location[] = [
  {
    id: 'loc1',
    name: 'Val Thorens',
    country: 'Francja',
    teaser: 'Najwyżej położony ośrodek narciarski w Europie z 600 km tras',
    imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&q=80',
  },
  {
    id: 'loc2',
    name: 'Livigno',
    country: 'Włochy',
    teaser: 'Wolnocłowa strefa w Alpach z doskonałymi warunkami do jazdy',
    imageUrl: 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80',
  },
  {
    id: 'loc3',
    name: 'Sölden',
    country: 'Austria',
    teaser: 'Lodowiec zapewniający jazdę przez cały sezon, słynny z Bond movies',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&q=80',
  },
];

// Trip summary template
export const getTripSummary = (attractions?: Attraction[]): TripSummary => ({
  sections: [
    {
      category: 'Weather',
      title: 'Weather Conditions',
      markdown:
        '**December - March:** Perfect skiing conditions\n\n- Temperature: -5°C to -15°C\n- Snowfall: High\n- Sunshine: 6-7h daily',
    },
    {
      category: 'Safety',
      title: 'Safety & Health',
      markdown:
        '✅ Very safe region\n\n- Rescue services: 24/7\n- Hospital: 15 min\n- Insurance: Recommended',
      important: true,
    },
    {
      category: 'Budget',
      title: 'Estimated Costs',
      markdown:
        '**Per person (7 days):**\n\n- Ski pass: €280-350\n- Accommodation: €70-150/night\n- Food: €40-60/day\n- Equipment rental: €120-180',
      tags: ['Premium', 'All-inclusive available'],
    },
    {
      category: 'Transport',
      title: 'How to Get There',
      markdown:
        '**Travel options:**\n\n1. Flight to Geneva + transfer (3h)\n2. Own car from Poland (12-14h)\n3. Organized coach\n\nAirport transfer: €45-60 per person/one-way',
    },
    ...(attractions && attractions.length > 0 ? [{
      category: 'Attractions' as const,
      title: 'Selected Attractions',
      markdown: attractions
        .filter(a => a.decision === 'accepted')
        .map(a => `**${a.title}**\n${a.description}${a.category ? ` (${a.category})` : ''}`)
        .join('\n\n') || 'No attractions selected yet',
    }] : []),
  ],
});

// Helper function to update user
export function updateMockUser(updates: Partial<User>) {
  mockUser = { ...mockUser, ...updates };
}
