import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { OnboardingQuestion, OnboardingAnswerResponse } from '@/types';

export function useOnboardingQuestions() {
  return useQuery({
    queryKey: ['onboarding', 'questions'],
    queryFn: () => apiClient.get<OnboardingQuestion[]>('/onboarding/questions'),
    staleTime: Infinity, // Questions don't change
  });
}

export function useAnswerQuestion() {
  return useMutation({
    mutationFn: (data: { questionId: string; answerText: string }) =>
      apiClient.post<OnboardingAnswerResponse>('/onboarding/answer', data),
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { createInitialProject: boolean }) =>
      apiClient.post<{ projectId: string }>('/onboarding/complete', data),
    onSuccess: () => {
      // Update user's onboarding status in localStorage
      const storedUser = localStorage.getItem('travelai_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.onboardingCompleted = true;
        localStorage.setItem('travelai_user', JSON.stringify(user));
      }
      
      // Invalidate cache to trigger re-render
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
