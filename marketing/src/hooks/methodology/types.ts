import { AxiosRequestConfig } from 'axios';

export interface UseSaveContactProps {
  requestConfig?: AxiosRequestConfig;
}

export interface SaveContactProps {
  data: {
    // name: string;
    email: string;
    // message: string;
    // company: string;
    // topic: string;
  };
}
