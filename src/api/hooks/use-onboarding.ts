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
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
