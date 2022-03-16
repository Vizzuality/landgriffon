import { useCallback, useState } from 'react';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { apiService } from 'services/api';
import { Label, Input } from 'components/forms';
import { Button } from 'components/button';
import { formProps, UserProfilePayload } from './types';

const passwordSchemaValidation = yup.object({
  currentPassword: yup.string().min(8).required('password is required'),
  newPassword: yup.string().min(8).required('password is required'),
  passwordConfirmation: yup
    .string()
    .required('password confirmation is required')
    .oneOf([yup.ref('newPassword'), null], 'passwords must match'),
});

const editPassword = (data: UserProfilePayload) => apiService.patch('/users/password', data);

const UserPasswordForm: React.FC<formProps> = ({ alert, showAlert }: formProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordInput,
    formState: { errors: errorsPaaaword },
  } = useForm({
    resolver: yupResolver(passwordSchemaValidation),
  });

  const mutationPassword = useMutation(editPassword, {
    onSuccess: () => {
      setIsLoading(false);

      alert({
        type: 'success',
        title: 'Your changes were successfully saved.',
      });

      showAlert(true);
    },

    onError: () => {
      setIsLoading(false);

      alert({
        type: 'error',
        title: 'An error has occured while saving. Please try gain later',
      });

      showAlert(true);
    },
  });

  const handleEditPassword = useCallback(
    (data: UserProfilePayload) => {
      resetPasswordInput();
      setIsLoading(true);
      mutationPassword.mutate(data);
      setTimeout(() => {
        showAlert(false);
      }, 3000);
    },
    [mutationPassword, resetPasswordInput, showAlert],
  );
  return (
    <section className="mt-8 ml-6">
      <div className="flex">
        <div className="w-125">
          <h1 className="text-lg">Password</h1>
          <p className="text-sm text-gray-500">Update your password.</p>
        </div>

        <div className="bg-white rounded-md shadow-lg w-250">
          <form onSubmit={handleSubmitPassword(handleEditPassword)}>
            <div className="grid grid-cols-2 gap-6 p-6 pb-8">
              <div className="col-span-2">
                <Label htmlFor="password">Current password</Label>
                <Input
                  {...registerPassword('currentPassword')}
                  type="password"
                  error={errorsPaaaword.currentPassword?.message}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  {...registerPassword('newPassword')}
                  type="password"
                  error={errorsPaaaword.newPassword?.message}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="passwordConfirmation">Confirm password</Label>
                <Input
                  {...registerPassword('passwordConfirmation')}
                  type="password"
                  error={errorsPaaaword.passwordConfirmation?.message}
                />
              </div>
            </div>
            <div className="flex justify-end h-16 py-3 pr-6 rounded-md bg-gray-50">
              <Button type="submit" theme="primary" loading={isLoading}>
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default UserPasswordForm;
