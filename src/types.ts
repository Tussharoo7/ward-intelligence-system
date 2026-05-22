export type LanguageCode = 'en' | 'hi' | 'hng';

export interface User {
  id: string;
  name: string;
  phone: string;
  wardId: number; // 1-85
  points: number;
  streak: number;
  badges: string[];
  language: LanguageCode;
}

export interface Issue {
  id: string;
  wardId: number;
  title: string;
  category: string; // 'Water', 'Roads', 'Waste', 'Traffic', 'Electricity', 'Security'
  severity: 'High' | 'Medium' | 'Low';
  upvotes: number;
  status: 'Open' | 'In Progress' | 'Resolved';
}

export interface Comment {
  id: string;
  authorName: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: string;
}

export interface Candidate {
  id: string;
  wardId: number;
  name: string;
  party: 'BJP' | 'INC' | 'AAP' | 'IND';
  photoUrl: string;
  bio: string;
  supportPercent: number;
  trend: number[]; // Sparkline data: 5 numbers
  comments: Comment[];
}

export interface Ward {
  id: number; // number 1-85 to represent Indore ward number
  number: number;
  name: string;
  population: number;
  issues: Issue[];
  candidateIds: string[];
  supportData: Record<string, number>; // candidateId -> support percentage
  lastUpdated: string;
}

export interface FeedbackEntry {
  id: string;
  userId: string;
  wardId: number;
  candidateId: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  text: string;
  verified: boolean;
  voterId?: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  wardId: number;
  points: number;
  rank: number;
  avatarSeed: string;
}
