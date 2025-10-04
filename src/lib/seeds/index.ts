import type { UserProfile } from '@/types/profile';
import type { Project, ChatMessage, Trip, Attraction, User } from '@/types';

// Import JSON files
import usersData from './users.json';
import sharedProjectsData from './shared-projects.json';
import alpineConversation from './conversations/project-alpine-2025.json';
import japanConversation from './conversations/project-japan-dream.json';
import tokyoConversation from './conversations/trip-tokyo.json';

// Type definitions for seed data
export interface SeedUser extends User {
  profile: UserProfile;
}

export interface SeedProject extends Project {
  participants: string[]; // User IDs
}

export interface SeedConversation {
  projectId: string;
  messages: ChatMessage[];
}

export interface SeedTrip {
  tripId: string;
  messages: ChatMessage[];
  attractions: Attraction[];
}

// Export parsed seed data
export const seedUsers: SeedUser[] = usersData as SeedUser[];
export const seedProjects: SeedProject[] = sharedProjectsData as SeedProject[];

// Conversations mapped by project ID
export const seedConversations: Record<string, ChatMessage[]> = {
  'proj-alpine-2025': alpineConversation as ChatMessage[],
  'proj-japan-dream': japanConversation as ChatMessage[],
};

// Trip conversations
export const seedTripConversations: Record<string, ChatMessage[]> = {
  'trip-tokyo-001': tokyoConversation as ChatMessage[],
};

// Attractions for trips
export const seedAttractions: Record<string, Attraction[]> = {
  'trip-tokyo-001': [
    {
      id: 'attr-tokyo-001',
      title: 'Sensō-ji Temple',
      description: 'Najstarsze buddyjskie sanktuarium w Tokio. Spektakularna brama Kaminarimon i tłumy turystów na Nakamise Street.',
      imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
      category: 'Culture',
      rating: 3,
      status: 'rated'
    },
    {
      id: 'attr-tokyo-002',
      title: 'Tsukiji Outer Market',
      description: 'Słynny rynek rybny z najświeższymi sushi i sashimi. Must dla foodie lovers!',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
      category: 'Food',
      rating: 3,
      status: 'rated'
    },
    {
      id: 'attr-tokyo-003',
      title: 'Meiji Shrine & Forest Trail',
      description: '70-hektarowy las w centrum Tokio z tradycyjną świątynią. Relaksujący 2h spacer wśród natury.',
      imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800',
      category: 'Nature',
      rating: 2,
      status: 'rated'
    },
    {
      id: 'attr-tokyo-004',
      title: 'teamLab Borderless',
      description: 'Interaktywne digital art museum z immersive instalacjami. Instagram heaven!',
      imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800',
      category: 'Art',
      rating: 3,
      status: 'rated'
    },
    {
      id: 'attr-tokyo-005',
      title: 'Harajuku & Takeshita Street',
      description: 'Centrum kawaii culture, vintage shopping i indie fashion. Plus Togo Shrine trail dla aktywnych.',
      imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800',
      category: 'Shopping',
      rating: 2,
      status: 'rated'
    },
    {
      id: 'attr-tokyo-006',
      title: 'Shibuya Crossing',
      description: 'Najbardziej ruchliwy skrzyżowanie świata. Najlepszy widok z Starbucks na 2. piętrze!',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      category: 'Landmarks',
      status: 'pending'
    }
  ]
};

// Trips for projects
export const seedTrips: Trip[] = [
  {
    id: 'trip-tokyo-001',
    projectId: 'proj-japan-dream',
    locationId: 'loc-tokyo',
    locationName: 'Tokyo, Japan',
    title: 'Tokyo Adventure',
    createdAt: '2024-12-10T10:10:00Z',
    updatedAt: '2024-12-10T17:00:00Z',
    lastMessagePreview: 'Anna: Togo Shrine trail? Perfect! 🥾'
  }
];

// Helper: Get user by ID
export function getSeedUserById(userId: string): SeedUser | undefined {
  return seedUsers.find(u => u.id === userId);
}

// Helper: Get projects for user
export function getSeedProjectsForUser(userId: string): SeedProject[] {
  return seedProjects.filter(p => p.participants.includes(userId));
}

// Helper: Get conversation for project
export function getSeedConversation(projectId: string): ChatMessage[] {
  return seedConversations[projectId] || [];
}

// Helper: Get trip conversation
export function getSeedTripConversation(tripId: string): ChatMessage[] {
  return seedTripConversations[tripId] || [];
}

// Helper: Get attractions for trip
export function getSeedAttractions(tripId: string): Attraction[] {
  return seedAttractions[tripId] || [];
}
