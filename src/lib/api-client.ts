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
      return mockFetch(mockLocations as T, 400);
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
      return mockFetch(getTripSummary() as T, 500);
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
      const body = data as { title?: string };

      const newProject: Project = {
        id: `proj-${Date.now()}`,
        title: body.title || 'Nowy projekt',
        createdAt: new Date().toISOString(),
      };

      mockProjects.push(newProject);
      mockProjectMessages[newProject.id] = [];

      return { id: newProject.id } as T;
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
