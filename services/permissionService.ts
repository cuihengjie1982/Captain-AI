
import { User, PermissionConfig, PermissionKey } from '../types';

const CONFIG_KEY = 'captain_permission_config';

const DEFAULT_CONFIG: PermissionConfig = {
  free: {
    'download_resources': false,
    'expert_diagnosis': false,
    'export_transcript': false,
    'advanced_analytics': false
  },
  pro: {
    'download_resources': true,
    'expert_diagnosis': true,
    'export_transcript': true,
    'advanced_analytics': true
  }
};

export const getPermissionConfig = (): PermissionConfig => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load permissions", e);
  }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
  return DEFAULT_CONFIG;
};

export const savePermissionConfig = (config: PermissionConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const hasPermission = (user: User | null, key: PermissionKey): boolean => {
  if (!user) return false;
  
  // Admin always has access
  if (user.role === 'admin') return true;
  
  const config = getPermissionConfig();
  const userPlan = user.plan || 'free'; // Default to free if undefined
  
  return config[userPlan][key];
};

// Helper to get user plan for display
export const getUserPlanLabel = (user: User | null): string => {
  if (!user) return '访客';
  if (user.role === 'admin') return '管理员';
  return user.plan === 'pro' ? '专业版 (Pro)' : '免费版 (Free)';
};
