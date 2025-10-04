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
import { 
  seedUsers, 
  seedProjects, 
  seedConversations, 
  seedTripConversations,
  seedAttractions,
  seedTrips,
  getSeedUserById,
  getSeedProjectsForUser 
} from './seeds';

// Get current user from storage
function getCurrentUserId(): string {
  const storedUser = localStorage.getItem('travelai_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return user.id;
    } catch {
      return 'user-anna-001';
    }
  }
  return 'user-anna-001';
}

// User data - dynamically from seed
export let mockUser: User = (() => {
  const userId = getCurrentUserId();
  const seedUser = getSeedUserById(userId);
  return seedUser || seedUsers[0];
})();

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

// Projects and trips - merge seed data with defaults
export let mockProjects: Project[] = (() => {
  const userId = getCurrentUserId();
  const userProjects = getSeedProjectsForUser(userId);
  
  // Add default project if user has no seed projects
  const defaultProject: Project = {
    id: 'default-proj-1',
    title: 'My Summer Adventure 2025',
    createdAt: new Date('2025-01-15').toISOString(),
    lastMessagePreview: 'Planning an amazing summer getaway...',
    isShared: false,
    hasLocationSuggestions: true,
  };
  
  return userProjects.length > 0 ? [...userProjects, defaultProject] : [defaultProject];
})();

export let mockTrips: Trip[] = (() => {
  // Get trips from seed data
  const userTrips = seedTrips.filter(trip => {
    const project = seedProjects.find(p => p.id === trip.projectId);
    return project?.participants.includes(getCurrentUserId());
  });
  
  // Add default trips
  const defaultTrips: Trip[] = [
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
  
  return [...userTrips, ...defaultTrips];
})();

export let mockProjectMessages: Record<string, ChatMessage[]> = (() => {
  const messages: Record<string, ChatMessage[]> = {
    'default-proj-1': [
      {
        id: 'initial-msg-1',
        role: 'assistant',
        markdown: 'Welcome to your summer adventure planning! I\'ve prepared some great destinations for you.',
        createdAt: new Date('2025-01-15').toISOString(),
      },
    ],
  };
  
  // Merge with seed conversations
  Object.entries(seedConversations).forEach(([projectId, msgs]) => {
    messages[projectId] = msgs;
  });
  
  return messages;
})();

export let mockTripMessages: Record<string, ChatMessage[]> = (() => {
  const messages: Record<string, ChatMessage[]> = {
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
    'trip-iguana-bcn': [
    {
      id: 'iguana-msg-1',
      role: 'assistant',
      markdown: '🌟 **Welcome to Barcelona Summer Adventure!**\n\nI\'m here to help you plan an amazing trip to Barcelona. I\'ve analyzed the city and prepared some fantastic attractions for you to explore.',
      createdAt: new Date('2025-01-09T10:00:00').toISOString(),
    },
    {
      id: 'iguana-msg-2',
      role: 'user',
      userName: 'Sarah Mitchell',
      markdown: 'Hi everyone! I\'m so excited about this trip! I\'ve always wanted to see the Sagrada Familia.',
      createdAt: new Date('2025-01-09T10:15:00').toISOString(),
    },
    {
      id: 'iguana-msg-3',
      role: 'user',
      userName: 'Mark Johnson',
      markdown: 'Same here! The architecture in Barcelona is incredible. I think we should definitely include Park Güell too.',
      createdAt: new Date('2025-01-09T10:20:00').toISOString(),
    },
    {
      id: 'iguana-msg-4',
      role: 'user',
      userName: 'Emma Rodriguez',
      markdown: 'Count me in! I love the food there. Can we add some time for tapas bars on Las Ramblas?',
      createdAt: new Date('2025-01-09T10:25:00').toISOString(),
    },
    {
      id: 'iguana-msg-5',
      role: 'assistant',
      markdown: 'Great enthusiasm! I\'ve added all those attractions to your itinerary. Barcelona is perfect for mixing culture, food, and beach time.',
      createdAt: new Date('2025-01-09T10:30:00').toISOString(),
    },
    {
      id: 'iguana-msg-6',
      role: 'user',
      userName: 'Sarah Mitchell',
      markdown: 'Perfect! How many days do you think we need?',
      createdAt: new Date('2025-01-09T11:00:00').toISOString(),
    },
    {
      id: 'iguana-msg-7',
      role: 'assistant',
      markdown: 'I\'d recommend **4-5 days** to enjoy Barcelona without rushing. This gives you time for major attractions, beach relaxation, and discovering hidden gems.',
      createdAt: new Date('2025-01-09T11:05:00').toISOString(),
    },
    {
      id: 'iguana-msg-8',
      role: 'user',
      userName: 'Mark Johnson',
      markdown: 'Sounds good! I can take Friday off, so we could do Thursday to Monday. What do you all think?',
      createdAt: new Date('2025-01-09T11:15:00').toISOString(),
    },
    {
      id: 'iguana-msg-9',
      role: 'user',
      userName: 'Emma Rodriguez',
      markdown: 'Works for me! And we should definitely spend one afternoon at the beach. Barceloneta is supposed to be amazing.',
      createdAt: new Date('2025-01-09T11:20:00').toISOString(),
    },
    {
      id: 'iguana-msg-10',
      role: 'user',
      userName: 'Sarah Mitchell',
      markdown: 'Love it! Beach day is a must. I\'m also interested in the Gothic Quarter for some history.',
      createdAt: new Date('2025-01-09T11:30:00').toISOString(),
    },
    {
      id: 'iguana-msg-11',
      role: 'assistant',
      markdown: 'Excellent planning! I\'ve accepted Sagrada Familia, Park Güell, Las Ramblas, and Beach Day in your itinerary. The Gothic Quarter is included in the Las Ramblas area - perfect for an afternoon stroll.',
      createdAt: new Date('2025-01-09T11:35:00').toISOString(),
    },
  ],
  };
  
  // Merge with seed trip conversations
  Object.entries(seedTripConversations).forEach(([tripId, msgs]) => {
    messages[tripId] = msgs;
  });
  
  return messages;
})();

export let mockAttractions: Record<string, Attraction[]> = (() => {
  const attractions: Record<string, Attraction[]> = {
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
  'trip-iguana-bcn': [
    {
      id: 'attr-bcn-1',
      title: 'Sagrada Familia',
      description: "Gaudí's masterpiece - iconic unfinished basilica",
      category: 'Architecture',
      imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80',
      rating: 3,
      status: 'rated',
    },
    {
      id: 'attr-bcn-2',
      title: 'Park Güell',
      description: 'Colorful mosaic park with stunning city views',
      category: 'Parks',
      imageUrl: 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=600&q=80',
      rating: 3,
      status: 'rated',
    },
    {
      id: 'attr-bcn-3',
      title: 'Las Ramblas',
      description: 'Famous tree-lined pedestrian street',
      category: 'Streets',
      imageUrl: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600&q=80',
      rating: 2,
      status: 'rated',
    },
    {
      id: 'attr-bcn-4',
      title: 'Beach Day',
      description: 'Relax at Barceloneta Beach',
      category: 'Beach',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
      rating: 3,
      status: 'rated',
    },
  ],
  };
  
  // Merge with seed attractions
  Object.entries(seedAttractions).forEach(([tripId, attrs]) => {
    attractions[tripId] = attrs;
  });
  
  return attractions;
})();

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
export const getTripSummary = (attractions?: Attraction[]): TripSummary => {
  const ratedAttractions = attractions?.filter(a => a.status === 'rated' && a.rating && a.rating >= 2) || [];
  
  return {
    sections: [
      {
        category: 'Najważniejsze',
        title: '⚠️ Najważniejsze informacje',
        markdown: `**Pamiętaj o tych rzeczach:**

✅ **Paszport ważny minimum 6 miesięcy**
✅ **Ubezpieczenie podróżne obowiązkowe**
✅ **Szczepienia: brak wymaganych**
✅ **Wiza: nie wymagana (do 90 dni)**

🚨 **Numery alarmowe:**
- Pogotowie: 112
- Ambasada: +81 3-5562-1100`,
        important: true,
        tags: ['Najważniejsze', 'Must-know'],
      },
      {
        category: 'Pogoda',
        title: 'Pogoda w marcu',
        markdown: `**Warunki pogodowe:**

🌸 **Sezon kwitnienia wiśni (Sakura)**
- Temperatura: 12-18°C
- Opady: średnie (parasol przydatny)
- Wschód słońca: 5:45, zachód: 17:50
- Najlepszy miesiąc na zwiedzanie!

**Co zabrać:**
- Lekką kurtkę
- Warstwowe ubrania
- Parasol`,
        tags: ['Wiosna', 'Sakura', 'Idealna temperatura'],
      },
      {
        category: 'Loty',
        title: 'Połączenia lotnicze',
        markdown: `**Opcje przelotu:**

✈️ **1. LOT Polish Airlines** (polecane)
- Warszawa → Tokio (Narita)
- Bezpośredni: ~11h
- Cena: 2800-3500 PLN w obie strony

✈️ **2. Turkish Airlines**
- Z przesiadką w Stambule
- Całkowity czas: ~15h
- Cena: 2200-2800 PLN

✈️ **3. Lufthansa**
- Z przesiadką w Frankfurcie
- Całkowity czas: ~14h
- Cena: 2500-3200 PLN

🎫 **Pro tip:** Rezerwuj 2-3 miesiące wcześniej dla najlepszych cen`,
        tags: ['Direct flight available', 'Book early'],
      },
      {
        category: 'Hotele',
        title: 'Rekomendowane noclegi',
        markdown: `**Propozycje hoteli:**

🏨 **Budget (150-250 PLN/noc):**
- Capsule hotels (unikalne doświadczenie!)
- Hostele w Shinjuku/Shibuya
- Airbnb w dzielnicach mieszkalnych

🏨 **Mid-range (300-500 PLN/noc):**
- Hotel Gracery Shinjuku (widok na Godzillę!)
- Cross Hotel Osaka
- Richmond Hotel Asakusa

🏨 **Luxury (600+ PLN/noc):**
- Park Hyatt Tokyo (Lost in Translation!)
- Aman Tokyo
- The Peninsula Tokyo

💡 **Wskazówka:** Wybierz hotel blisko stacji metra - to klucz do wygodnego zwiedzania!`,
        tags: ['Variety', 'Metro access important'],
      },
      {
        category: 'Terminy',
        title: 'Najlepsze terminy podróży',
        markdown: `**Kalendarz podróżny:**

🌸 **Marzec-Kwiecień** (polecane!)
- Sezon Sakury
- Idealna pogoda: 12-20°C
- Większy ruch turystyczny
- Rezerwuj z wyprzedzeniem!

🍂 **Październik-Listopad**
- Kolorowa jesień (Momiji)
- Przyjemna pogoda: 15-22°C
- Mniej tłoczno niż w sezonie Sakury

❄️ **Grudzień-Luty**
- Skiing w Alpach Japońskich
- Świąteczne iluminacje
- Ciepłe onsen (gorące źródła)

🔥 **Unikaj:** Lipiec-Sierpień (gorąco i wilgotno, pora deszczowa)`,
        tags: ['Sakura season', 'Fall foliage'],
      },
      {
        category: 'Lokalizacja',
        title: 'Tokio - stolica Japonii',
        markdown: `**O mieście:**

📍 **Położenie:** Wschodnia Japonia, nad Zatoką Tokijską
🏙️ **Populacja:** ~14 mln (38 mln w aglomeracji!)
🗼 **Dzielnice must-see:**
- **Shibuya** - słynne skrzyżowanie, młodzieżowa moda
- **Shinjuku** - neonowe światła, życie nocne
- **Asakusa** - tradycyjna dzielnica, świątynie
- **Harajuku** - moda, kawaii culture
- **Ginza** - luksusowe zakupy

⏰ **Strefa czasowa:** UTC+9 (7h do przodu od Polski)`,
        tags: ['Megacity', 'Safe', 'Modern + Traditional'],
      },
      {
        category: 'Opis',
        title: 'Czego się spodziewać',
        markdown: `**Tokio to:**

🎌 **Kontrast tradycji i nowoczesności**
- Starożytne świątynie obok drapaczy chmur
- Tradycyjne ogródki herbaciane i futurystyczne kawiarnie robotów

🍱 **Kulinarny raj**
- Najwięcej restauracji z gwiazdkami Michelin na świecie
- Street food: ramen, sushi, takoyaki
- Konbini (sklepy 24/7) z pysznym jedzeniem

🚄 **Perfekcyjna infrastruktura**
- Metro NIGDY się nie spóźnia
- Wszystko ultraczyste
- Wysokie bezpieczeństwo

🎭 **Unikalne doświadczenia**
- Karaoke boxy
- Onsen (gorące źródła)
- Anime & manga cafes
- Gaming centers`,
      },
      {
        category: 'Transport',
        title: 'Poruszanie się po Tokio',
        markdown: `**System komunikacji:**

🎫 **Suica Card / Pasmo** (must-have!)
- Karta miejska na metro/autobusy/pociągi
- Zakup na lotnisku: 1000-2000 ¥
- Uzupełnianie w automatach

🚇 **Metro:**
- 13 linii metra + 10 linii JR
- Godziny szczytu: 7:30-9:30, 17:30-19:30
- Google Maps ZAWSZE pokazuje najlepszą trasę

🚅 **JR Pass** (dla dłuższych pobytów)
- Unlimited przejazdy JR przez 7/14/21 dni
- Opłacalne jeśli planujesz wyjazdy poza Tokio
- Cena: ~1200 PLN za 7 dni

🚕 **Taxi:**
- Drogie! (start: ~300 ¥, każdy km: ~100 ¥)
- Używaj tylko jako ostateczność

💡 **Pro tip:** Pobierz offline mapy w Google Maps!`,
        tags: ['Suica essential', 'Metro best option'],
      },
      {
        category: 'Budżet/koszty',
        title: 'Szacunkowy budżet (7 dni)',
        markdown: `**Koszty per osoba:**

✈️ **Przelot:** 2500-3500 PLN
🏨 **Noclegi:** 1500-3000 PLN (zależnie od kategorii)
🍜 **Jedzenie:**
- Budget: 70-100 PLN/dzień
- Mid: 120-200 PLN/dzień
- Premium: 250+ PLN/dzień

🎫 **Atrakcje & transport:** 500-800 PLN
🛍️ **Zakupy & pamiątki:** 300-1000 PLN

**💰 RAZEM: 5500-9000 PLN**

💡 **Jak oszczędzać:**
- Jedzenie w convenience stores (konbini)
- Free attractions: świątynie, parki, dzielnice
- Happy hours w restauracjach (lunch sets!)`,
        tags: ['Mid-range budget', 'Savings tips'],
      },
      {
        category: 'Co zabrać',
        title: 'Lista pakowania',
        markdown: `**Niezbędne rzeczy:**

📱 **Elektronika:**
- ☑️ Powerbank (długie dni zwiedzania!)
- ☑️ Adapter (Japanese plugs: Type A/B)
- ☑️ Pocket WiFi lub SIM card

👕 **Ubrania (Marzec):**
- ☑️ Lekka kurtka/wiatrówka
- ☑️ Swetry/bluzy (warstwowe!)
- ☑️ Wygodne buty do chodzenia
- ☑️ Parasol kompaktowy

💊 **Zdrowie:**
- ☑️ Podstawowe leki (ból głowy, żołądek)
- ☑️ Witaminy
- ☑️ Ubezpieczenie (kopia!)

🎒 **Przydatne:**
- ☑️ Mała torba/plecak na dzień
- ☑️ Butelka wielorazowa
- ☑️ Powerbank
- ☑️ Gotówka (wiele miejsc bez karty!)

❌ **NIE zabieraj:**
- Dużej walizki (metra mają schody!)
- Za dużo ubrań (zrobisz zakupy tam!)`,
      },
      {
        category: 'Dokumenty',
        title: 'Wymagane dokumenty',
        markdown: `**Co musisz mieć:**

✅ **Paszport:**
- Ważność: minimum 6 miesięcy od daty wyjazdu
- Minimum 2 puste strony

✅ **Ubezpieczenie podróżne:**
- Obowiązkowe!
- Pokrycie min. 30,000 EUR
- Kopia polisy w telefonie + wydruk

✅ **Karta pokładowa:**
- Online check-in 24h przed lotem
- Zapisz w telefonie (Google/Apple Wallet)

✅ **Rezerwacje:**
- Potwierdzenie hotelu (wydruk/PDF)
- Bilet powrotny (mogą sprawdzić na granicy!)

📱 **W telefonie:**
- Zdjęcie paszportu
- Potwierdzenia rezerwacji
- Numery alarmowe
- Offline mapy

💡 **Pro tip:** Zrób kopie wszystkiego i wyślij do siebie na email!`,
        important: true,
      },
      {
        category: 'Checklista',
        title: 'Checklist przed wylotem',
        markdown: `**3 miesiące przed:**
- ☑️ Zarezerwuj loty
- ☑️ Zarezerwuj hotel
- ☑️ Sprawdź ważność paszportu

**1 miesiąc przed:**
- ☑️ Wykup ubezpieczenie
- ☑️ Zamów Pocket WiFi/SIM card
- ☑️ Zarezerwuj bilety na atrakcje (TeamLab!)
- ☑️ Wymień część pieniędzy na JPY

**1 tydzień przed:**
- ☑️ Online check-in
- ☑️ Pobierz offline mapy
- ☑️ Zainstaluj apps: Google Translate, Google Maps, Suica
- ☑️ Sprawdź prognozę pogody

**Dzień przed:**
- ☑️ Spakuj walizkę (max 23kg!)
- ☑️ Naładuj wszystkie urządzenia
- ☑️ Wydrukuj potwierdzenia
- ☑️ Powiadom bank o wyjeździe

**Na lotnisku:**
- ☑️ Paszport + bilet
- ☑️ Gotówka JPY (minimum 10,000¥)
- ☑️ Suica card (kup na lotnisku Narita!)`,
      },
      ...(ratedAttractions.length > 0 ? [{
        category: 'Atrakcje' as const,
        title: '⭐ Zaakceptowane atrakcje',
        markdown: ratedAttractions
          .map(a => {
            const stars = '⭐'.repeat(a.rating || 0);
            const imgTag = a.imageUrl ? `\n![${a.title}](${a.imageUrl})` : '';
            return `### ${a.title} ${stars}\n${a.description}${a.category ? ` *(${a.category})*` : ''}${imgTag}`;
          })
          .join('\n\n---\n\n'),
        tags: ['Personalized', 'Your picks'],
      }] : []),
    ],
  };
};

// Helper function to update user
export function updateMockUser(updates: Partial<User>) {
  mockUser = { ...mockUser, ...updates };
}
