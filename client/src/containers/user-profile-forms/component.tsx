import { useCallback, useState } from 'react';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { apiService } from 'services/api';
import { Label, Input } from 'components/forms';
import { Button } from 'components/button';
import { formProps, UserProfilePayload } from './types';

const schemaValidation = yup.object({
  fname: yup.string().required('first name is required'),
  lname: yup.string().required('last name is required'),
  email: yup.string().email().required(),
});

const editUserData = (data: UserProfilePayload) => apiService.patch('/users/me', data);

const UserDataForm: React.FC<formProps> = ({ alert, showAlert }: formProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const mutation = useMutation(editUserData, {
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

  const handleEditUserData = useCallback(
    (data: UserProfilePayload) => {
      reset();
      setIsLoading(true);
      mutation.mutate(data);
      setTimeout(() => {
        showAlert(false);
      }, 3000);
    },

    [mutation, showAlert, reset],
  );
  return (
    <section className="ml-6 mt-14">
      <div className="flex">
        <div className="w-125">
          <h1 className="text-lg ">Personal information</h1>
          <p className="text-sm text-gray-500">
            Use a permanent address where you can receive mail.
          </p>
        </div>

        <div className="bg-white rounded-md shadow-lg w-250">
          <form onSubmit={handleSubmit(handleEditUserData)}>
            <div className="grid grid-cols-2 gap-6 p-6 pb-8">
              <div>
                <Label htmlFor="fname">First name</Label>
                <Input {...register('fname')} error={errors.fname?.message} />
              </div>
              <div>
                <Label htmlFor="lname">Last name</Label>
                <Input {...register('lname')} error={errors.lname?.message} />
              </div>

              <div className="">
                <Label htmlFor="email">Email</Label>
                <Input {...register('email')} type="email" error={errors.email?.message} />
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

export default UserDataForm;
