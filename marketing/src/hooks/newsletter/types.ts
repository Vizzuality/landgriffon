import { AxiosRequestConfig } from 'axios';

export interface UseSaveNewsletterProps {
  requestConfig?: AxiosRequestConfig;
}

export interface SaveNewsletterProps {
  data: {
    email: string;
    terms: boolean;
  };
}
