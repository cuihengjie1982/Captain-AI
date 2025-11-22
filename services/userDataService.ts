

import { UserUpload, AdminNote, WatchedLesson, ReadArticle, User } from '../types';

const UPLOADS_KEY = 'captain_user_uploads';
const NOTES_KEY = 'captain_admin_notes';
const HISTORY_KEY = 'captain_user_history';
const ARTICLE_HISTORY_KEY = 'captain_read_articles';
const USERS_DB_KEY = 'captain_users_db';

// Mock Data for Uploads
const MOCK_UPLOADS: UserUpload[] = [
  {
    id: 'u1',
    fileName: 'Q1_Ops_Data.xlsx',
    fileType: 'xlsx',
    size: '2.4 MB',
    uploadDate: '2024-05-20 14:30',
    status: 'completed',
    userName: '张经理',
    userEmail: 'zhang@example.com'
  },
  {
    id: 'u2',
    fileName: 'Team_Roster_May.pdf',
    fileType: 'pdf',
    size: '1.1 MB',
    uploadDate: '2024-05-21 09:15',
    status: 'pending',
    userName: '李主管',
    userEmail: 'li@example.com'
  }
];

// Mock Data for Users
const MOCK_USERS: User[] = [
    { id: 'u1', name: '张经理', email: 'zhang@example.com', role: 'user', plan: 'pro', phone: '13800138000', isAuthenticated: true },
    { id: 'u2', name: '李主管', email: 'li@example.com', role: 'user', plan: 'free', phone: '13900139000', isAuthenticated: true },
    { id: 'admin', name: 'Captain Admin', email: 'admin@captain.ai', role: 'admin', plan: 'pro', phone: '18888888888', isAuthenticated: true },
    { id: 'u3', name: '王专员', email: 'wang@example.com', role: 'user', plan: 'free', phone: '15000150000', isAuthenticated: true }
];

// --- User Uploads Logic ---

export const getUserUploads = (): UserUpload[] => {
  try {
    const stored = localStorage.getItem(UPLOADS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error(e); }
  
  // Initialize with mock data if empty
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(MOCK_UPLOADS));
  return MOCK_UPLOADS;
};

export const saveUserUpload = (upload: UserUpload): void => {
  const items = getUserUploads();
  items.unshift(upload);
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(items));
};

export const updateUserUploadStatus = (id: string, status: UserUpload['status']): void => {
  const items = getUserUploads();
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) {
    items[idx].status = status;
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(items));
  }
};

export const deleteUserUpload = (id: string): void => {
  const items = getUserUploads();
  const newItems = items.filter(i => i.id !== id);
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(newItems));
};

// --- Admin Notes Logic ---

export const getAdminNotes = (): AdminNote[] => {
  try {
    const stored = localStorage.getItem(NOTES_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error(e); }
  return [];
};

export const saveAdminNote = (note: AdminNote): void => {
  const items = getAdminNotes();
  items.unshift(note);
  localStorage.setItem(NOTES_KEY, JSON.stringify(items));
};

export const deleteAdminNote = (id: string): void => {
  const items = getAdminNotes();
  const newItems = items.filter(i => i.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(newItems));
};

// --- User Video History Logic ---

export const getWatchedHistory = (): WatchedLesson[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error(e); }
  
  // Mock some history
  const mockHistory: WatchedLesson[] = [
     { lessonId: '1', watchedAt: '2024-05-20 10:30', progress: 85 },
     { lessonId: '2', watchedAt: '2024-05-18 15:20', progress: 40 }
  ];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(mockHistory));
  return mockHistory;
};

export const saveWatchedLesson = (lessonId: string): void => {
  const history = getWatchedHistory();
  const existingIdx = history.findIndex(h => h.lessonId === lessonId);
  
  const newItem: WatchedLesson = {
    lessonId,
    watchedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    progress: Math.floor(Math.random() * 30) + 70 // Mock progress
  };

  if (existingIdx >= 0) {
    history[existingIdx] = newItem; // Update timestamp
  } else {
    history.unshift(newItem);
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

// --- User Article History Logic ---

export const getReadHistory = (): ReadArticle[] => {
  try {
    const stored = localStorage.getItem(ARTICLE_HISTORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error(e); }
  return [];
};

export const saveReadArticle = (articleId: string): void => {
  const history = getReadHistory();
  const existingIdx = history.findIndex(h => h.articleId === articleId);
  
  const newItem: ReadArticle = {
    articleId,
    readAt: new Date().toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric' }),
  };

  if (existingIdx >= 0) {
    history[existingIdx] = newItem; // Update timestamp
  } else {
    history.unshift(newItem);
  }
  localStorage.setItem(ARTICLE_HISTORY_KEY, JSON.stringify(history));
};

// --- User Account Management Logic ---

export const getAllUsers = (): User[] => {
    try {
        const stored = localStorage.getItem(USERS_DB_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { console.error(e); }
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
};

export const saveUser = (user: User): void => {
    const users = getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
        users[idx] = user;
    } else {
        users.push(user);
    }
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

export const deleteUser = (id: string): void => {
    const users = getAllUsers();
    const newUsers = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(newUsers));
};