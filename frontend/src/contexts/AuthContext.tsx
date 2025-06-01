import React, { createContext, useState, useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { AuthState, User } from '../types';

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
};

const AuthContext = createContext<AuthContextType>({
  authState: initialState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {}
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const navigate = useNavigate();

  // Load user from localStorage when component mounts
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify if token is expired
          const decodedToken: any = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired
            localStorage.removeItem('token');
            setAuthState({
              ...initialState,
              loading: false
            });
            return;
          }
          
          // Extract user data from token
          const user: User = {
            id: decodedToken.userId,
            firstName: decodedToken.firstName || '',
            lastName: decodedToken.lastName || '',
            email: decodedToken.email,
            role: decodedToken.role
          };
          
          setAuthState({
            isAuthenticated: true,
            user,
            token,
            loading: false,
            error: null
          });
        } catch (error) {
          localStorage.removeItem('token');
          setAuthState({
            ...initialState,
            loading: false
          });
        }
      } else {
        setAuthState({
          ...initialState,
          loading: false
        });
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      setAuthState({
        ...authState,
        error: error.response?.data?.message || 'Login failed',
        loading: false
      });
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      setAuthState({
        ...authState,
        error: error.response?.data?.message || 'Registration failed',
        loading: false
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null
    });
    navigate('/login');
  };

  const clearError = () => {
    setAuthState({
      ...authState,
      error: null
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;