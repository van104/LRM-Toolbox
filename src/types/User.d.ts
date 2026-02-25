export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
  role?: 'admin' | 'user';
  createdAt?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
}
