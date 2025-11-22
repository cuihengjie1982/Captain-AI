

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

export interface IntroVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  isVisible: boolean;
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
  category?: string; // Added category for filtering
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
  isProjectReports?: boolean; // Added for Dashboard Project Reports
}

export interface RiskDetailItem {
  id: string;
  name: string;     // e.g., Employee Name / Call ID / User ID
  desc: string;     // e.g., Risk Factor / Comment / Reason
  metric: string;   // e.g., Risk Score / Duration / Rating
  status: 'critical' | 'warning' | 'info';
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
  // Added for Project Improvement Reports
  actionPlanFile?: string; 
  meetingRecordFile?: string;
  // Added for Risk Drill-down
  riskDetails?: RiskDetailItem[];
}

// New Interfaces for User Data Management
export interface UserUpload {
  id: string;
  fileName: string;
  fileType: string;
  size: string;
  uploadDate: string;
  status: 'pending' | 'analyzing' | 'completed';
  userName: string;
  userEmail?: string;
}

export interface AdminNote {
  id: string;
  content: string;
  lessonTitle: string;
  timestampDisplay: string;
  createdAt: string;
  userName: string;
}

// User History Interface
export interface WatchedLesson {
  lessonId: string;
  watchedAt: string;
  progress: number; // 0-100
}

// New Interface for Diagnosis Issues Management
export interface DiagnosisIssue {
  id: string;
  title: string;       // Dropdown Label
  userText: string;    // Simulated User Message
  aiResponse: string;  // Initial AI Response
}

export enum AppRoute {
  LOGIN = '/login',
  BLOG = '/',
  BLOG_DETAIL = '/blog/:id',
  DIAGNOSIS = '/diagnosis',
  SOLUTION = '/solution',
  SOLUTION_DETAIL = '/solution/:id',
  DASHBOARD = '/dashboard',
  ADMIN = '/admin',
  // New User Center Routes
  MY_VIDEOS = '/my-videos',
  MY_NOTES = '/my-notes',
  SETTINGS = '/settings',
  PLANS = '/plans'
}