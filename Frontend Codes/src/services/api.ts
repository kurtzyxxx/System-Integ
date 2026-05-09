import axios from 'axios';

// Use environment variable for backend URL, fallback to localhost for development
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15s timeout for slow connections
});

// ─── Type Definitions ────────────────────────────────────────
export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email?: string;
  username?: string;
  password: string;
}

export interface ProfileData {
  bio?: string;
  major?: string;
  school?: string;
}

export interface ChangePasswordData {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

export interface UpdateNameData {
  userId: number;
  newName: string;
}

// ─── API Functions ───────────────────────────────────────────
export const register = (data: RegisterData) => api.post("/auth/register", data);
export const login = (data: LoginData) => api.post("/auth/login", data);

export const getProfile = (userId: number) => api.get(`/profile/${userId}`);
export const updateProfile = (userId: number, data: ProfileData) => api.post(`/profile/${userId}`, data);
export const changePassword = (data: ChangePasswordData) => api.post("/auth/change-password", data);
export const updateName = (data: UpdateNameData) => api.post("/auth/update-name", data);
export const uploadAvatar = (userId: number, formData: FormData) =>
  api.post(`/profile/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000, // Allow longer timeout for file uploads
  });

// Health check helper
export const checkHealth = () => api.get('/health');

export default api;
