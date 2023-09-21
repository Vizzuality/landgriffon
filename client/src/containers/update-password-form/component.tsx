import { useCallback } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useUpdatePassword } from 'hooks/profile';
import { Label, Input } from 'components/forms';
import { Button } from 'components/button';

import type { PasswordPayload, ErrorResponse } from 'types';

const passwordSchemaValidation = yup.object({
  currentPassword: yup.string().min(8).required('password is required'),
  newPassword: yup.string().min(8).required('password is required'),
  passwordConfirmation: yup
    .string()
    .required('password confirmation is required')
    .oneOf([yup.ref('newPassword'), null], 'passwords must match'),
});

const UserPasswordForm: React.FC = () => {
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors },
  } = useForm<yup.InferType<typeof passwordSchemaValidation>>({
    resolver: yupResolver(passwordSchemaValidation),
  });

  const updatePassword = useUpdatePassword();

  const handleEditPassword = useCallback(
    (data: PasswordPayload) => {
      updatePassword.mutate(
        {
          // avoid passing passwordConfirmation to the API
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          onSuccess: () => {
            toast.success('Your changes were successfully saved.');
          },
          onError: (error: ErrorResponse) => {
            const { errors } = error.response?.data;
            errors.forEach(({ title }) => toast.error(title));
          },
        },
      );
    },
    [updatePassword],
  );

  return (
    <section className="mt-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <h1 className="text-lg">Password</h1>
          <p className="text-sm text-gray-500">Update your password.</p>
        </div>

        <div className="col-span-8 bg-white rounded-md shadow-lg">
          <form onSubmit={handleSubmitPassword(handleEditPassword)}>
            <div className="grid grid-cols-2 gap-6 p-6 pb-8">
              <div className="col-span-2">
                <Label htmlFor="password">Current password</Label>
                <Input
                  {...registerPassword('currentPassword')}
                  type="password"
                  error={errors.currentPassword?.message as string}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  {...registerPassword('newPassword')}
                  type="password"
                  error={errors.newPassword?.message as string}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="passwordConfirmation">Confirm password</Label>
                <Input
                  {...registerPassword('passwordConfirmation')}
                  type="password"
                  error={errors.passwordConfirmation?.message as string}
                />
              </div>
            </div>
            <div className="flex justify-end h-16 py-3 pr-6 rounded-md bg-gray-50">
              <Button
                type="submit"
                variant="primary"
                loading={updatePassword.isLoading}
                data-testid="submit-update-password"
              >
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
