import type { 
  User, 
  OnboardingQuestion, 
  OnboardingAnswerResponse,
  Project,
  Trip,
  ChatMessage,
  Location,
  Attraction,
  TripSummary,
} from '@/types';
import {
  mockUser,
  updateMockUser,
  onboardingQuestions,
  mockProjects,
  mockTrips,
  mockProjectMessages,
  mockTripMessages,
  mockAttractions,
  mockLocations,
  getTripSummary,
  specialSharedProject,
  iguanaSharedProject,
  iguanaTrip,
  iguanaLocation,
} from './mock-data';

// Simulate network delay
async function mockDelay(ms: number = 300): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// Simulate API response
async function mockFetch<T>(data: T, delay: number = 300): Promise<T> {
  await mockDelay(delay);
  return data;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client implementation with mocked data
export const apiClient = {
  // User endpoints
  get: async <T>(endpoint: string): Promise<T> => {
    // User
    if (endpoint === '/me') {
      return mockFetch(mockUser as T);
    }

    // Onboarding questions
    if (endpoint === '/onboarding/questions') {
      return mockFetch(onboardingQuestions as T);
    }

    // Projects list
    if (endpoint === '/projects') {
      return mockFetch(mockProjects as T);
    }

    // Single project
    if (endpoint.match(/^\/projects\/[^/]+$/)) {
      const projectId = endpoint.split('/')[2];
      const project = mockProjects.find((p) => p.id === projectId);
      if (!project) throw new ApiError('Project not found', 404);
      return mockFetch(project as T);
    }

    // Project messages
    if (endpoint.match(/^\/projects\/[^/]+\/messages$/)) {
      const projectId = endpoint.split('/')[2];
      const messages = mockProjectMessages[projectId] || [];
      return mockFetch({ messages, nextCursor: null } as T);
    }

    // Project location suggestions
    if (endpoint.match(/^\/projects\/[^/]+\/locations\/suggestions$/)) {
      const projectId = endpoint.split('/')[2];
      
      // Return locations for projects that have suggestions
      const project = mockProjects.find(p => p.id === projectId);
      if (project?.hasLocationSuggestions || 
          projectId === 'default-proj-1' || 
          projectId === 'shared-proj-abc123') {
        const allLocations = [...mockLocations, iguanaLocation];
        return mockFetch(allLocations as T, 400);
      }
      
      return mockFetch([] as T, 400);
    }

    // Project participants
    if (endpoint.match(/^\/projects\/[^/]+\/participants$/)) {
      const projectId = endpoint.split('/')[2];
      
      if (projectId === 'shared-proj-iguana') {
        return mockFetch([
          {
            id: 'participant-1',
            projectId,
            userId: 'user-sarah-456',
            userName: 'Sarah Mitchell',
            joinedAt: new Date('2025-01-08T09:00:00').toISOString(),
          },
          {
            id: 'participant-2',
            projectId,
            userId: 'user-mark-789',
            userName: 'Mark Johnson',
            joinedAt: new Date('2025-01-08T09:30:00').toISOString(),
          },
          {
            id: 'participant-3',
            projectId,
            userId: 'user-emma-321',
            userName: 'Emma Rodriguez',
            joinedAt: new Date('2025-01-08T10:00:00').toISOString(),
          },
        ] as T);
      }
      
      if (projectId === 'shared-proj-abc123') {
        return mockFetch([
          {
            id: 'participant-abc-1',
            projectId,
            userId: 'other-user-123',
            userName: 'Alex Thompson',
            joinedAt: new Date('2025-01-10T08:00:00').toISOString(),
          },
        ] as T);
      }
      
      return mockFetch([] as T);
    }

    // Trips list
    if (endpoint === '/trips') {
      return mockFetch(mockTrips as T);
    }

    // Single trip
    if (endpoint.match(/^\/trips\/[^/]+$/)) {
      const tripId = endpoint.split('/')[2];
      const trip = mockTrips.find((t) => t.id === tripId);
      if (!trip) throw new ApiError('Trip not found', 404);
      return mockFetch(trip as T);
    }

    // Trip messages
    if (endpoint.match(/^\/trips\/[^/]+\/messages$/)) {
      const tripId = endpoint.split('/')[2];
      const messages = mockTripMessages[tripId] || [];
      return mockFetch({ messages, nextCursor: null } as T);
    }

    // Trip attractions
    if (endpoint.match(/^\/trips\/[^/]+\/attractions$/)) {
      const tripId = endpoint.split('/')[2];
      return mockFetch((mockAttractions[tripId] || []) as T);
    }

    // Trip summary
    if (endpoint.match(/^\/trips\/[^/]+\/summary$/)) {
      const tripId = endpoint.split('/')[2];
      const tripAttractions = mockAttractions[tripId] || [];
      return mockFetch(getTripSummary(tripAttractions) as T, 500);
    }

    throw new ApiError(`Unknown endpoint: ${endpoint}`, 404);
  },

  patch: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    // Update user
    if (endpoint === '/me') {
      const updates = data as Partial<User>;
      updateMockUser(updates);
      return mockFetch(mockUser as T);
    }

    // Update project
    if (endpoint.match(/^\/projects\/[^/]+$/)) {
      await mockDelay(300);
      const projectId = endpoint.split('/')[2];
      const project = mockProjects.find((p) => p.id === projectId);
      if (!project) throw new ApiError('Project not found', 404);
      
      const updates = data as Partial<Project>;
      Object.assign(project, updates);
      return mockFetch(project as T);
    }

    // Update trip
    if (endpoint.match(/^\/trips\/[^/]+$/)) {
      await mockDelay(300);
      const tripId = endpoint.split('/')[2];
      const trip = mockTrips.find((t) => t.id === tripId);
      if (!trip) throw new ApiError('Trip not found', 404);
      
      const updates = data as Partial<Trip>;
      Object.assign(trip, updates);
      return mockFetch(trip as T);
    }

    throw new ApiError(`Unknown endpoint: ${endpoint}`, 404);
  },

  post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    // Answer onboarding question
    if (endpoint === '/onboarding/answer') {
      await mockDelay(500);
      const body = data as { questionId: string; answerText: string };
      
      // Simple validation
      if (body.answerText.length < 3) {
        return {
          status: 'needs_clarification',
          followupMarkdown:
            'Czy mógłbyś/mogłabyś podać więcej szczegółów? Pomoże mi to lepiej dobrać oferty.',
        } as T;
      }

      return { status: 'ok' } as T;
    }

    // Complete onboarding
    if (endpoint === '/onboarding/complete') {
      await mockDelay(800);

      const newProject: Project = {
        id: `proj-${Date.now()}`,
        title: 'Moja wymarzona podróż',
        createdAt: new Date().toISOString(),
        lastMessagePreview: 'Rozpocznijmy planowanie...',
      };

      mockProjects.push(newProject);

      mockProjectMessages[newProject.id] = [
        {
          id: 'm1',
          role: 'assistant',
          markdown:
            '🎉 Świetnie! Na podstawie Twoich odpowiedzi przygotowałem kilka propozycji.\n\nCzy chciałbyś zobaczyć sugerowane lokalizacje?',
          createdAt: new Date().toISOString(),
        },
      ];

      return { projectId: newProject.id } as T;
    }

    // Create new project
    if (endpoint === '/projects') {
      await mockDelay(400);
      const body = data as { title?: string; isShared?: boolean };

      const newProject: Project = {
        id: `proj-${Date.now()}`,
        title: body.title || 'New Project',
        createdAt: new Date().toISOString(),
        isShared: body.isShared || false,
      };

      if (body.isShared) {
        const { generateShareCode } = await import('./utils');
        newProject.shareCode = generateShareCode();
      }

      mockProjects.push(newProject);
      mockProjectMessages[newProject.id] = [];

      return { id: newProject.id, shareCode: newProject.shareCode } as T;
    }

    // Join shared project
    if (endpoint === '/projects/join') {
      await mockDelay(600);
      const body = data as { shareCode: string };

      // Check for special shared project code
      if (body.shareCode.toUpperCase() === 'ABC123') {
        // Add the special shared project if not already added
        const existingProject = mockProjects.find(p => p.id === specialSharedProject.id);
        if (!existingProject) {
          mockProjects.push({ ...specialSharedProject });
          mockProjectMessages[specialSharedProject.id] = [
            {
              id: 'shared-msg-1',
              role: 'assistant',
              markdown: '👥 Welcome to the **Team Adventure**!\n\nThis is a collaborative project. You can see and contribute to the planning.',
              createdAt: new Date().toISOString(),
            },
          ];
        }
        return { projectId: specialSharedProject.id } as T;
      }

      // Check for IGUANA shared project code
      if (body.shareCode.toUpperCase() === 'IGUANA') {
        const existingProject = mockProjects.find(p => p.id === iguanaSharedProject.id);
        if (!existingProject) {
          mockProjects.push({ ...iguanaSharedProject });
          mockTrips.push({ ...iguanaTrip });
          
          // Multi-user conversation
          mockTripMessages[iguanaTrip.id] = [
            {
              id: 'iguana-msg-1',
              role: 'assistant',
              markdown: '🌟 Welcome to **Barcelona Summer Adventure**!\n\nPlanning an amazing group trip to Barcelona!',
              createdAt: new Date('2025-01-09T10:00:00').toISOString(),
            },
            {
              id: 'iguana-msg-2',
              role: 'user',
              markdown: 'I\'d love to visit Park Güell and the Sagrada Familia! - Sarah',
              createdAt: new Date('2025-01-09T10:15:00').toISOString(),
            },
            {
              id: 'iguana-msg-3',
              role: 'user',
              markdown: 'Definitely! And we should check out the Gothic Quarter. - Mark',
              createdAt: new Date('2025-01-09T10:20:00').toISOString(),
            },
            {
              id: 'iguana-msg-4',
              role: 'assistant',
              markdown: 'Great suggestions! I\'ve prepared a list of attractions based on your preferences. Check the **Attractions** tab!',
              createdAt: new Date('2025-01-09T10:25:00').toISOString(),
            },
            {
              id: 'iguana-msg-5',
              role: 'user',
              markdown: 'Perfect! I\'ll review the beach options. - Emma',
              createdAt: new Date('2025-01-09T11:00:00').toISOString(),
            },
          ];
          
          // Attractions for Barcelona trip
          mockAttractions[iguanaTrip.id] = [
            {
              id: 'attr-bcn-1',
              title: 'Sagrada Familia Tour',
              description: 'Skip-the-line guided tour of Gaudí\'s masterpiece basilica',
              category: 'Architecture',
              imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80',
              decision: 'accepted',
            },
            {
              id: 'attr-bcn-2',
              title: 'Park Güell Visit',
              description: 'Explore the colorful mosaic park with panoramic city views',
              category: 'Parks',
              imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80',
              decision: 'accepted',
            },
            {
              id: 'attr-bcn-3',
              title: 'Gothic Quarter Walking Tour',
              description: 'Discover medieval streets, hidden squares, and Roman ruins',
              category: 'Culture',
              imageUrl: 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=600&q=80',
              decision: 'accepted',
            },
            {
              id: 'attr-bcn-4',
              title: 'Barceloneta Beach Day',
              description: 'Relax at the famous urban beach with beachside restaurants',
              category: 'Beach',
              imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
              decision: 'accepted',
            },
            {
              id: 'attr-bcn-5',
              title: 'Tapas Food Tour',
              description: 'Taste authentic Catalan cuisine at local tapas bars',
              category: 'Food',
              imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
              decision: 'accepted',
            },
          ];
          
          mockProjectMessages[iguanaSharedProject.id] = [
            {
              id: 'iguana-proj-msg-1',
              role: 'assistant',
              markdown: '👥 Welcome to the collaborative Barcelona project! Your trip is ready to explore.',
              createdAt: new Date('2025-01-08').toISOString(),
            },
          ];
        }
        return { projectId: iguanaSharedProject.id } as T;
      }

      const project = mockProjects.find((p) => p.shareCode === body.shareCode);
      if (!project) {
        throw new ApiError('Project not found with that share code', 404);
      }

      // In a real app, this would add the user to the project participants
      return { projectId: project.id } as T;
    }

    // Send project message
    if (endpoint.match(/^\/projects\/[^/]+\/messages$/)) {
      await mockDelay(800);
      const projectId = endpoint.split('/')[2];
      const body = data as { text: string };

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        markdown: body.text,
        createdAt: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        markdown:
          'Rozumiem! Oto kilka propozycji lokalizacji, które mogą Cię zainteresować. Możesz utworzyć podróż dla każdej z nich.',
        createdAt: new Date().toISOString(),
      };

      if (!mockProjectMessages[projectId]) {
        mockProjectMessages[projectId] = [];
      }

      mockProjectMessages[projectId].push(userMessage, assistantMessage);

      return [userMessage, assistantMessage] as T;
    }

    // Create trip from location
    if (endpoint.match(/^\/projects\/[^/]+\/locations$/)) {
      await mockDelay(600);
      const body = data as { selectedLocationId: string };

      const location = mockLocations.find((l) => l.id === body.selectedLocationId);
      if (!location) throw new ApiError('Location not found', 404);

      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        projectId: 'proj-1',
        locationId: location.id,
        locationName: `${location.name}, ${location.country}`,
        title: `Podróż do ${location.name}`,
        createdAt: new Date().toISOString(),
      };

      mockTrips.push(newTrip);
      mockTripMessages[newTrip.id] = [
        {
          id: 'tm1',
          role: 'assistant',
          markdown: `Witaj w planowaniu podróży do **${location.name}**! 🎿\n\nOpowiedz mi więcej o swoich oczekiwaniach, a ja przygotuję listę atrakcji.`,
          createdAt: new Date().toISOString(),
        },
      ];

      // Add mock attractions
      mockAttractions[newTrip.id] = [
        {
          id: 'attr1',
          title: 'Przejazd kolejką gondolową',
          description: 'Spektakularne widoki na Alpy podczas przejazdu nowoczesną kolejką',
          category: 'Transport',
          imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',
        },
        {
          id: 'attr2',
          title: 'Szkoła narciarska (2 dni)',
          description: 'Profesjonalne kursy dla początkujących i zaawansowanych',
          category: 'Aktywności',
          imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
        },
        {
          id: 'attr3',
          title: 'Wieczór przy ognisku',
          description: 'Tradycyjne spotkanie z lokalnymi potrawami i muzyką',
          category: 'Rozrywka',
          imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80',
        },
      ];

      return { tripId: newTrip.id } as T;
    }

    // Send trip message
    if (endpoint.match(/^\/trips\/[^/]+\/messages$/)) {
      await mockDelay(800);
      const tripId = endpoint.split('/')[2];
      const body = data as { text: string };

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        markdown: body.text,
        createdAt: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        markdown:
          'Świetnie! Sprawdź zakładkę **Atrakcje** - przygotowałem dla Ciebie propozycje. Zaakceptuj te, które Cię interesują.',
        createdAt: new Date().toISOString(),
      };

      if (!mockTripMessages[tripId]) {
        mockTripMessages[tripId] = [];
      }

      mockTripMessages[tripId].push(userMessage, assistantMessage);

      return [userMessage, assistantMessage] as T;
    }

    // Attraction decision
    if (endpoint.match(/^\/trips\/[^/]+\/attractions\/[^/]+\/decision$/)) {
      await mockDelay(400);
      const tripId = endpoint.split('/')[2];
      const attractionId = endpoint.split('/')[4];
      const body = data as { decision: 'accept' | 'reject' };

      // Update attraction decision in mock data
      if (mockAttractions[tripId]) {
        const attraction = mockAttractions[tripId].find((a) => a.id === attractionId);
        if (attraction) {
          attraction.decision = body.decision === 'accept' ? 'accepted' : 'rejected';
        }
      }

      // Check if all attractions have been decided
      const allDecided = mockAttractions[tripId]?.every((a) => a.decision);
      
      if (allDecided && mockTripMessages[tripId]) {
        // Add post-attraction questions after all decisions are made
        const { postAttractionQuestions } = await import('./mock-data');
        
        mockTripMessages[tripId].push({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          markdown: postAttractionQuestions[0].markdownQuestion,
          createdAt: new Date().toISOString(),
        });
      }

      return { status: 'ok' } as T;
    }

    throw new ApiError(`Unknown endpoint: ${endpoint}`, 404);
  },

  put: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    throw new ApiError(`PUT not implemented: ${endpoint}`, 404);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    throw new ApiError(`DELETE not implemented: ${endpoint}`, 404);
  },
};

export { ApiError };
