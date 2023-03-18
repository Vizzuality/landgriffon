import toast from 'react-hot-toast';

import type { ErrorResponse } from 'types';

export const handleResponseError = (error: ErrorResponse) => {
  const { errors } = error.response?.data;
  errors.forEach(({ meta, title }) => {
    if (!!meta.rawError.response) {
      const { message } = meta.rawError.response;
      if (Array.isArray(message)) {
        message.forEach((message: string) => toast.error(message));
      } else {
        toast.error(message);
      }
    } else {
      toast.error(title);
    }
  });
};
