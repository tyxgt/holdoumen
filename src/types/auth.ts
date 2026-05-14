export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  is_new_user: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}
