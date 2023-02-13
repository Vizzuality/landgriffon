import toast from 'react-hot-toast';

import { RoleName } from 'hooks/permissions/enums';

import type { ErrorResponse, ProfilePayload } from 'types';

export const NEW_USER: ProfilePayload = {
  email: '',
  id: '',
  roles: [{ name: RoleName.USER, permissions: [] }],
  displayName: '',
};

export const useMutateOptions = (closeUserForm: () => void) => {
  return (mutateType: 'create' | 'update' | 'delete') => {
    const successText =
      mutateType === 'create'
        ? 'User successfully created.'
        : mutateType === 'update'
        ? 'Your changes were successfully saved.'
        : 'User successfully deleted';
    return {
      onSuccess: () => {
        toast.success(successText);
        closeUserForm();
      },
      onError: (error: ErrorResponse) => {
        const { errors } = error.response?.data;
        errors.forEach(({ title }) => toast.error(title));
      },
    };
  };
};
