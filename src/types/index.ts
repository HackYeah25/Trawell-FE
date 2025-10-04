export type ID = string;

export type Role = 'system' | 'assistant' | 'user';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ChoiceOption {
  value: string;
  label: string;
}

export interface QuickReply {
  id: ID;
  label: string;
  payload?: unknown;
}

export type UIHint =
  | { type: 'form'; fields: FormField[] }
  | { type: 'choices'; options: ChoiceOption[] };

export interface ChatMessage {
  id: ID;
  role: Role;
  markdown?: string;
  createdAt: string;
  quickReplies?: QuickReply[];
  uiHints?: UIHint[];
  status?: 'sending' | 'sent' | 'error';
}

export interface User {
  id: ID;
  name: string;
  email?: string;
  onboardingCompleted: boolean;
}

export interface OnboardingQuestion {
  id: ID;
  markdownQuestion: string;
}

export interface OnboardingAnswerResponse {
  status: 'ok' | 'needs_clarification';
  followupMarkdown?: string;
}

export interface Project {
  id: ID;
  title: string;
  createdAt: string;
  lastMessagePreview?: string;
  updatedAt?: string;
}

export interface Location {
  id: ID;
  name: string;
  country: string;
  teaser: string;
  imageUrl?: string;
}

export interface Trip {
  id: ID;
  projectId: ID;
  locationId: ID;
  locationName: string;
  title: string;
  createdAt: string;
  lastMessagePreview?: string;
  updatedAt?: string;
}

export interface Attraction {
  id: ID;
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  decision?: 'accepted' | 'rejected' | null;
}

export type SummaryCategory =
  | 'Pogoda'
  | 'Bezpieczeństwo'
  | 'Budżet/koszty'
  | 'Transport/Dojezdność'
  | 'Sezonowość/Tłok'
  | 'Formalności'
  | 'Kultura/Obyczaje'
  | 'Noclegi'
  | 'Jedzenie'
  | 'Aktywności/atrakcje';

export interface TripSummarySection {
  category: SummaryCategory;
  title: string;
  markdown: string;
  important?: boolean;
  tags?: string[];
}

export interface TripSummary {
  sections: TripSummarySection[];
}
