
export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  xp: number;
  level: number;
  badges: string[];
  bio: string;
  followers: number;
  following: number;
  reputation: 'Novice' | 'Analyst' | 'Guru' | 'Market Wizard';
  location?: string;
  website?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string | null;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: Date;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  tags: string[];
  type: 'view' | 'idea' | 'strategy';
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  poll?: Poll;
  recentComments?: Comment[];
}

export interface ChatMessage {
  id: string;
  user: User;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  members: number;
  icon: string;
  category: string;
}

export enum View {
  FEED = 'FEED',
  CHARCHA = 'CHARCHA',
  CLUBS = 'CLUBS',
  PROFILE = 'PROFILE',
  LEADERBOARD = 'LEADERBOARD'
}