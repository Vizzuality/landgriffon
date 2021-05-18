import axios from 'axios';

const AUTHENTICATION = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
  headers: { 'Content-Type': 'application/json' },
});

export default AUTHENTICATION;
