

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user'; 
  plan: 'free' | 'pro'; // Added plan
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
  tags?: string[]; // New: Multi-tags
  originalUrl?: string; // New: Import source URL
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
  quote?: string; // Selected text from source
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
  videoUrl?: string; // Added video URL for real playback
  highlights: Highlight[];
  transcript: TranscriptLine[];
  category?: string; // Added category for filtering
  tags?: string[]; // New: Multi-tags
}

// Moved from Diagnosis.tsx
export interface KnowledgeItem {
  id?: string; // Make optional for backward compatibility or generate on fly
  title: string; 
  type: 'xlsx' | 'pdf' | 'ppt' | 'doc'; 
  size: string;
  tags?: string[]; // New: Tags for the file
  url?: string; // New: File URL
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
  quote?: string; // Selected text from source
  lessonTitle: string; // Used as Source Title
  timestampDisplay: string; // Used for timestamp OR context (e.g. "Section 1")
  createdAt: string;
  userName: string;
  sourceType?: 'video' | 'article'; // New field to distinguish source
  sourceId?: string; // ID of the video or article
}

// User History Interface
export interface WatchedLesson {
  lessonId: string;
  watchedAt: string;
  progress: number; // 0-100
}

export interface ReadArticle {
  articleId: string;
  readAt: string;
}

// New Interface for Diagnosis Issues Management
export interface DiagnosisIssue {
  id: string;
  title: string;       // Dropdown Label
  userText: string;    // Simulated User Message
  aiResponse: string;  // Initial AI Response
}

// New Interface for Blog Comments
export interface CommentReply {
  id: string;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
  likes: number;
  isLiked: boolean;
  replyToName?: string; 
}

export interface BlogPostComment {
  id: string;
  postId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
  likes: number;
  isLiked: boolean;
  replies: CommentReply[];
  isTop?: boolean; // For "Featured/Pinned" comments
}

// Permission System Types
export type PermissionKey = 
  | 'download_resources'   // Download files in Diagnosis/Dashboard
  | 'expert_diagnosis'     // Access Expert Diagnosis tab actions
  | 'export_transcript'    // Export video transcripts
  | 'advanced_analytics';  // View advanced charts (placeholder for future)

export interface PermissionConfig {
  free: Record<PermissionKey, boolean>;
  pro: Record<PermissionKey, boolean>;
}

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  'download_resources': '下载专业资源/报告',
  'expert_diagnosis': '使用专家人工诊断',
  'export_transcript': '导出课程字幕/文稿',
  'advanced_analytics': '查看高级数据分析'
};

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
  MY_ARTICLES = '/my-articles',
  MY_NOTES = '/my-notes',
  SETTINGS = '/settings',
  PLANS = '/plans'
}