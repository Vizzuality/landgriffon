import axios from 'axios';

import { env } from '@/env.mjs';

export const authService = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/auth`,
  headers: { 'Content-Type': 'application/json' },
});

export const nextAuthService = axios.create({
  baseURL: '/api/auth',
  headers: { 'Content-Type': 'application/json' },
});
