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
  mockBrainstorms,
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

// API Client implementation with real backend
const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = {
  // User endpoints
  get: async <T>(endpoint: string): Promise<T> => {
    // User
    if (endpoint === '/me') {
      return mockFetch(mockUser as T);
    }

    // Onboarding questions - use real backend
    if (endpoint === '/profiling/questions') {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, response.status);
      }
      return response.json();
    }

    // brainstorms list
    if (endpoint === '/brainstorms') {
      return mockFetch(mockBrainstorms as T);
    }

    // Single project
    if (endpoint.match(/^\/brainstorms\/[^/]+$/)) {
      const projectId = endpoint.split('/')[2];
      const project = mockBrainstorms.find((p) => p.id === projectId);
      if (!project) throw new ApiError('Project not found', 404);
      return mockFetch(project as T);
    }

    // Project messages
    if (endpoint.match(/^\/brainstorms\/[^/]+\/messages$/)) {
      const projectId = endpoint.split('/')[2];
      const messages = mockProjectMessages[projectId] || [];
      return mockFetch({ messages, nextCursor: null } as T);
    }

    // Project location suggestions
    if (endpoint.match(/^\/brainstorms\/[^/]+\/locations\/suggestions$/)) {
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

    // Update project
    if (endpoint.match(/^\/brainstorms\/[^/]+$/)) {
      await mockDelay(300);
      const projectId = endpoint.split('/')[2];
      const project = mockBrainstorms.find((p) => p.id === projectId);
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
    // Start profiling session - use real backend
    if (endpoint === '/profiling/start') {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, response.status);
      }
      return response.json();
    }

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

      mockBrainstorms.push(newProject);

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
    if (endpoint === '/brainstorms') {
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

      mockBrainstorms.push(newProject);
      mockProjectMessages[newProject.id] = [];

      return { id: newProject.id, shareCode: newProject.shareCode } as T;
    }

    // Join shared project
    if (endpoint === '/brainstorms/join') {
      await mockDelay(600);
      const body = data as { shareCode: string };

      const project = mockBrainstorms.find((p) => p.shareCode === body.shareCode);
      if (!project) {
        throw new ApiError('Project not found with that share code', 404);
      }

      // In a real app, this would add the user to the project participants
      return { projectId: project.id } as T;
    }

    // Send project message
    if (endpoint.match(/^\/brainstorms\/[^/]+\/messages$/)) {
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
    if (endpoint.match(/^\/brainstorms\/[^/]+\/locations$/)) {
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
