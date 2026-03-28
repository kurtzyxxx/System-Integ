import axios from 'axios';

export const BACKEND_URL = 'http://localhost:5001';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export interface RegisterData {
  fullName: string;
  username: string; 
  email: string;
  password: string;
}

export const register = (data: RegisterData) => api.post("/auth/register", data);
export const login = (data: any) => api.post("/auth/login", data);

export const getProfile = (userId: number) => api.get(`/profile/${userId}`);
export const updateProfile = (userId: number, data: any) => api.post(`/profile/${userId}`, data);
export const changePassword = (data: any) => api.post("/auth/change-password", data);
export const updateName = (data: any) => api.post("/auth/update-name", data);
export const uploadAvatar = (userId: number, formData: FormData) => 
  api.post(`/profile/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export default api;
