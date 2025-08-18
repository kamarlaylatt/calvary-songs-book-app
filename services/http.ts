import axios, { AxiosInstance } from 'axios';

// Prefer EXPO_PUBLIC_ env for Expo apps; fallback to the current hardcoded URL
export const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://calvary-api.laravel.cloud/api';

console.log('Using API_BASE_URL:', API_BASE_URL);

export const http: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        Accept: 'application/json',
    },
});

// Basic response error logging in development
http.interceptors.response.use(
    (res) => res,
    (err) => {
        if (process.env.NODE_ENV !== 'production') {
            const cfg = err?.config ?? {};
            // eslint-disable-next-line no-console
            console.error('HTTP Error', {
                url: `${cfg.baseURL ?? ''}${cfg.url ?? ''}`,
                method: cfg.method,
                status: err?.response?.status,
                data: err?.response?.data,
            });
        }
        return Promise.reject(err);
    }
);

export default http;