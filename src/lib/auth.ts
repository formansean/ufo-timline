// Simple authentication system for admin access
// In production, this should be replaced with a proper authentication service

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

// Mock admin user - in production this would come from a database
const ADMIN_USER = {
  username: 'admin',
  password: 'ufo2024!', // In production, this would be hashed
};

// Simple session storage for demo purposes
// In production, use proper session management with JWT or similar
let currentUser: User | null = null;

export const authService = {
  // Login with username/password
  login: async (username: string, password: string): Promise<User> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      const user: User = {
        id: '1',
        username: ADMIN_USER.username,
        role: 'admin'
      };
      
      currentUser = user;
      
      // Store in localStorage for persistence across sessions
      if (typeof window !== 'undefined') {
        localStorage.setItem('ufo_admin_user', JSON.stringify(user));
      }
      
      return user;
    }
    
    throw new Error('Invalid username or password');
  },

  // Logout
  logout: async (): Promise<void> => {
    currentUser = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ufo_admin_user');
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (currentUser) {
      return currentUser;
    }

    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ufo_admin_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          currentUser = user;
          return user;
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('ufo_admin_user');
        }
      }
    }

    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },

  // Check if user has admin role
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  }
};

// Auth context for React components
export const useAuth = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check for existing auth on component mount
    const existingUser = authService.getCurrentUser();
    setUser(existingUser);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const user = await authService.login(username, password);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
};

// Import React for the hook
import React from 'react';