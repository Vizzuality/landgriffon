import axios from 'axios';
import { useMutation } from 'react-query';
import { SaveContactProps, UseSaveContactProps } from './types';

// SAVE IN SENDGRID
export function useSaveContactMethodologySendgrid({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveContactProps) {
  const saveContact = ({ data }: SaveContactProps) => {
    return axios.request({
      url: '/api/methodology',
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
