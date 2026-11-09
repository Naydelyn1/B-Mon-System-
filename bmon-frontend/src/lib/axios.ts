import axios, { isAxiosError } from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('montufar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('montufar_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/** Mensaje de error que devuelve la API, o el texto por defecto. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const msg = isAxiosError<{ message?: unknown }>(err) ? err.response?.data?.message : undefined;
  if (typeof msg === 'string') return msg;
  // Los errores de validación de NestJS llegan como lista
  if (Array.isArray(msg) && typeof msg[0] === 'string') return msg[0];
  return fallback;
}

export default api;
