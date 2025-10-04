import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@/types/profile';

// Mock data for development
const mockProfile: UserProfile = {
  id: "u_123",
  name: "Anna Kowalska",
  onboardingCompleted: true,
  completeness: 0.92,
  preferences: {
    traveler_type: "mixed",
    activity_level: "medium",
    accommodation_style: "boutique",
    environment: "mountains",
    budget_sensitivity: "medium",
    culture_interest: "high",
    food_importance: "high"
  },
  constraints: {
    dietary_restrictions: ["vegetarian"],
    mobility_limitations: [],
    climate_preferences: ["mild_temperate", "cool_cold"],
    language_preferences: ["Prefer English-friendly"]
  },
  experience: {
    past_destinations: [
      { name: "Lisbon, Portugal", highlight: "Amazing climate and cuisine" },
      { name: "Sölden, Austria", highlight: "Stunning slopes and views" }
    ],
    wishlist_regions: ["Japan", "Patagonia", "Iceland"]
  },
  insights: {
    personaLabel: "Mountain aesthete with appetite for local cuisine",
    summaryMarkdown: "You prefer **medium-intensity** trips, prioritize **boutique accommodations** and **culinary experiences**. Budget matters, but **experiences** win.",
    topTags: ["mountains", "foodie", "boutique", "culture"]
  },
  updatedAt: new Date().toISOString()
};

async function fetchProfile(): Promise<UserProfile> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // TODO: Replace with actual API call
  // const response = await fetch('/api/profile');
  // return response.json();
  
  return mockProfile;
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
