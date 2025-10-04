import { http, HttpResponse, delay } from 'msw';
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

// Mock data
let mockUser: User = {
  id: '1',
  name: 'Jan Kowalski',
  email: 'jan@example.com',
  onboardingCompleted: false,
};

const onboardingQuestions: OnboardingQuestion[] = [
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

let mockProjects: Project[] = [];
let mockTrips: Trip[] = [];
let mockProjectMessages: Record<string, ChatMessage[]> = {};
let mockTripMessages: Record<string, ChatMessage[]> = {};
let mockAttractions: Record<string, Attraction[]> = {};

const mockLocations: Location[] = [
  {
    id: 'loc1',
    name: 'Val Thorens',
    country: 'Francja',
    teaser: 'Najwyżej położony ośrodek narciarski w Europie z 600 km tras',
  },
  {
    id: 'loc2',
    name: 'Livigno',
    country: 'Włochy',
    teaser: 'Wolnocłowa strefa w Alpach z doskonałymi warunkami do jazdy',
  },
  {
    id: 'loc3',
    name: 'Sölden',
    country: 'Austria',
    teaser: 'Lodowiec zapewniający jazdę przez cały sezon, słynny z Bond movies',
  },
];

export const handlers = [
  // User
  http.get('/api/me', async () => {
    await delay(300);
    return HttpResponse.json(mockUser);
  }),

  http.patch('/api/me', async ({ request }) => {
    await delay(300);
    const updates = (await request.json()) as Partial<User>;
    mockUser = { ...mockUser, ...updates };
    return HttpResponse.json(mockUser);
  }),

  // Onboarding
  http.get('/api/onboarding/questions', async () => {
    await delay(300);
    return HttpResponse.json(onboardingQuestions);
  }),

  http.post('/api/onboarding/answer', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { questionId: string; answerText: string };

    // Simple validation - check if answer is too short
    if (body.answerText.length < 3) {
      return HttpResponse.json({
        status: 'needs_clarification',
        followupMarkdown:
          'Czy mógłbyś/mogłabyś podać więcej szczegółów? Pomoże mi to lepiej dobrać oferty.',
      });
    }

    return HttpResponse.json({ status: 'ok' });
  }),

  http.post('/api/onboarding/complete', async () => {
    await delay(800);

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

    return HttpResponse.json({ projectId: newProject.id });
  }),

  // Projects
  http.get('/api/projects', async () => {
    await delay(300);
    return HttpResponse.json(mockProjects);
  }),

  http.post('/api/projects', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { title?: string };

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: body.title || 'Nowy projekt',
      createdAt: new Date().toISOString(),
    };

    mockProjects.push(newProject);
    mockProjectMessages[newProject.id] = [];

    return HttpResponse.json({ id: newProject.id });
  }),

  http.get('/api/projects/:projectId', async ({ params }) => {
    await delay(300);
    const project = mockProjects.find((p) => p.id === params.projectId);
    if (!project) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(project);
  }),

  http.get('/api/projects/:projectId/messages', async ({ params }) => {
    await delay(300);
    const messages = mockProjectMessages[params.projectId as string] || [];
    return HttpResponse.json({ messages, nextCursor: null });
  }),

  http.post('/api/projects/:projectId/messages', async ({ request, params }) => {
    await delay(800);
    const body = (await request.json()) as { text: string };

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

    const projectId = params.projectId as string;
    if (!mockProjectMessages[projectId]) {
      mockProjectMessages[projectId] = [];
    }

    mockProjectMessages[projectId].push(userMessage, assistantMessage);

    return HttpResponse.json([userMessage, assistantMessage]);
  }),

  http.get('/api/projects/:projectId/locations/suggestions', async () => {
    await delay(400);
    return HttpResponse.json(mockLocations);
  }),

  http.post('/api/projects/:projectId/locations', async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as { selectedLocationId: string };

    const location = mockLocations.find((l) => l.id === body.selectedLocationId);
    if (!location) return new HttpResponse(null, { status: 404 });

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

    // Add some mock attractions
    mockAttractions[newTrip.id] = [
      {
        id: 'attr1',
        title: 'Przejazd kolejką gondolową',
        description: 'Spektakularne widoki na Alpy podczas przejazdu nowoczesną kolejką',
        category: 'Transport',
      },
      {
        id: 'attr2',
        title: 'Szkoła narciarska (2 dni)',
        description: 'Profesjonalne kursy dla początkujących i zaawansowanych',
        category: 'Aktywności',
      },
      {
        id: 'attr3',
        title: 'Wieczór przy ognisku',
        description: 'Tradycyjne spotkanie z lokalnymi potrawami i muzyką',
        category: 'Rozrywka',
      },
    ];

    return HttpResponse.json({ tripId: newTrip.id });
  }),

  // Trips
  http.get('/api/trips', async () => {
    await delay(300);
    return HttpResponse.json(mockTrips);
  }),

  http.get('/api/trips/:tripId', async ({ params }) => {
    await delay(300);
    const trip = mockTrips.find((t) => t.id === params.tripId);
    if (!trip) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(trip);
  }),

  http.get('/api/trips/:tripId/messages', async ({ params }) => {
    await delay(300);
    const messages = mockTripMessages[params.tripId as string] || [];
    return HttpResponse.json({ messages, nextCursor: null });
  }),

  http.post('/api/trips/:tripId/messages', async ({ request, params }) => {
    await delay(800);
    const body = (await request.json()) as { text: string };

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

    const tripId = params.tripId as string;
    if (!mockTripMessages[tripId]) {
      mockTripMessages[tripId] = [];
    }

    mockTripMessages[tripId].push(userMessage, assistantMessage);

    return HttpResponse.json([userMessage, assistantMessage]);
  }),

  http.get('/api/trips/:tripId/attractions', async ({ params }) => {
    await delay(300);
    return HttpResponse.json(mockAttractions[params.tripId as string] || []);
  }),

  http.post('/api/trips/:tripId/attractions/:attractionId/decision', async () => {
    await delay(400);
    return HttpResponse.json({ status: 'ok' });
  }),

  http.get('/api/trips/:tripId/summary', async () => {
    await delay(500);

    const summary: TripSummary = {
      sections: [
        {
          category: 'Pogoda',
          title: 'Warunki pogodowe',
          markdown:
            '**Grudzień - Marzec:** Idealne warunki narciarskie\n\n- Temperatura: -5°C do -15°C\n- Opady śniegu: wysokie\n- Nasłonecznienie: 6-7h dziennie',
        },
        {
          category: 'Bezpieczeństwo',
          title: 'Bezpieczeństwo i zdrowie',
          markdown:
            '✅ Bardzo bezpieczny region\n\n- Służby ratownicze: 24/7\n- Szpital: 15 min\n- Ubezpieczenie: zalecane',
          important: true,
        },
        {
          category: 'Budżet/koszty',
          title: 'Szacunkowe koszty',
          markdown:
            '**Na osobę (7 dni):**\n\n- Karnet narciarski: €280-350\n- Nocleg: €70-150/noc\n- Wyżywienie: €40-60/dzień\n- Wypożyczenie sprzętu: €120-180',
          tags: ['Premium', 'All-inclusive dostępne'],
        },
        {
          category: 'Transport/Dojezdność',
          title: 'Jak dojechać',
          markdown:
            '**Opcje dojazdu:**\n\n1. Lot do Genewa + transfer (3h)\n2. Własny samochód z Polski (12-14h)\n3. Autokar zorganizowany\n\nTransfer z lotniska: €45-60 os/stronę',
        },
      ],
    };

    return HttpResponse.json(summary);
  }),
];
