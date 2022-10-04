import axios from 'axios';

export const authService = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
  headers: { 'Content-Type': 'application/json' },
});

export const nextAuthService = axios.create({
  baseURL: '/api/auth',
  headers: { 'Content-Type': 'application/json' },
});
