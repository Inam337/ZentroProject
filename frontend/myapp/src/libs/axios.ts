import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

const TOKEN_KEYS = ['access_token', 'token'] as const;

export const getToken = (): string | null => {
  for (const key of TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }
  return null;
};

export const clearTokens = (): void => {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
};

const onRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
};

const onRequestError = (error: unknown): Promise<never> => Promise.reject(error);

const onResponse = (response: AxiosResponse): AxiosResponse => response;

const onResponseError = (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    clearTokens();
    window.location.assign('/login');
  }
  return Promise.reject(error);
};

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BACKEND_BASE_URL,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(onRequest, onRequestError);
  instance.interceptors.response.use(onResponse, onResponseError);

  return instance;
};

export const apiClient = createAxiosInstance();