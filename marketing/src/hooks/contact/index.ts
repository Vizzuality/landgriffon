import axios from 'axios';
import { useMutation } from 'react-query';
import { SaveContactProps, UseSaveContactProps } from './types';

// SAVE
export function useSaveContact({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveContactProps) {
  const saveContact = ({ data }: SaveContactProps) => {
    return axios.request({
      url: '/api/contact',
      data,
      ...requestConfig,
    });
  };

  return useMutation(saveContact, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
