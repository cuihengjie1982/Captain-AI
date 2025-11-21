
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user'; // Added role
  email?: string;
  phone?: string;
  isAuthenticated: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  readTime: string;
  date: string;
  author: string;
  content: string; // HTML content for the article
}

export interface Note {
  id: string;
  timestamp: number; // Seconds
  content: string;
}

export interface KPIRecord {
  month: string;
  value: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// Moved from Solution.tsx
export interface TranscriptLine {
  time: number; // seconds
  text: string;
}

export interface Highlight {
  label: string;
  time: number;
  color: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string; // display string e.g. "10:24"
  durationSec: number;
  thumbnail: string;
  highlights: Highlight[];
  transcript: TranscriptLine[];
}

// Moved from Diagnosis.tsx
export interface KnowledgeItem {
  title: string; 
  type: 'xlsx' | 'pdf' | 'ppt' | 'doc'; 
  size: string;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  color: string;
  items: KnowledgeItem[];
  isAiRepository?: boolean; // Added to distinguish AI Reply Library
}

export interface DashboardProject {
  id: string;
  name: string;
  category: string;
  content: string; // HTML content
  updatedAt: string;
  kpi: {
    label: string;
    value: number;
    unit: string;
    trend: number;
    riskLabel: string;
    riskValue: string;
    riskIconName: 'Users' | 'Smile' | 'Clock' | 'Activity' | 'Zap';
    riskColor: string;
  };
  chartData: KPIRecord[];
}

export enum AppRoute {
  LOGIN = '/login',
  BLOG = '/',
  BLOG_DETAIL = '/blog/:id',
  DIAGNOSIS = '/diagnosis',
  SOLUTION = '/solution',
  DASHBOARD = '/dashboard',
  ADMIN = '/admin' // Added Admin Route
}