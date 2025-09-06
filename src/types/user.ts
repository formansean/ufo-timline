export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  error?: string;
}