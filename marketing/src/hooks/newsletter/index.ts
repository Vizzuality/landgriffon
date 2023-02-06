import axios from 'axios';
import { useMutation } from 'react-query';
import { SaveNewsletterProps, UseSaveNewsletterProps } from './types';

// SAVE
export function useSaveNewsletter({
  requestConfig = {
    method: 'PUT',
  },
}: UseSaveNewsletterProps) {
  const saveNewsletter = ({ data }: SaveNewsletterProps) => {
    return axios.request({
      url: '/api/newsletter',
      data,
      ...requestConfig,
    });
  };

  return useMutation(saveNewsletter, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
