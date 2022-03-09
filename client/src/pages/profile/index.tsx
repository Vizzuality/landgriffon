import { useCallback, useState } from 'react';
import Head from 'next/head';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import ApplicationLayout from 'layouts/application';
import { apiService } from 'services/api';
import { Label, Input } from 'components/forms';
import { UserProfilePayload } from './types';
import { Button } from 'components/button';
import Alerts, { AlertsItemProps } from 'components/alerts';
import { Transition } from '@headlessui/react';

const schemaValidation = yup.object({
  fname: yup.string().required('first name is required'),
  lname: yup.string().required('last name is required'),
  email: yup.string().email().required(),
});

const passwordSchemaValidation = yup.object({
  currentPassword: yup.string().min(8).required('password is required'),
  newPassword: yup.string().min(8).required('password is required'),
  passwordConfirmation: yup
    .string()
    .required('password confirmation is required')
    .oneOf([yup.ref('newPassword'), null], 'passwords must match'),
});

const editUserData = (data: UserProfilePayload) => apiService.patch('/users/me', data);
const editPassword = (data: UserProfilePayload) => apiService.patch('/users/password', data);

const UserProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertsItemProps>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordInput,
    formState: { errors: errorsPaaaword },
  } = useForm({
    resolver: yupResolver(passwordSchemaValidation),
  });

  const mutation = useMutation(editUserData, {
    onSuccess: () => {
      setIsLoading(false);

      setAlert({
        type: 'success',
        title: 'Your changes were successfully saved.',
      });

      setShowAlert(true);
    },

    onError: () => {
      setIsLoading(false);

      setAlert({
        type: 'error',
        title: 'An error has occured while saving. Please try gain later',
      });

      setShowAlert(true);
    },
  });

  const mutationPassword = useMutation(editPassword, {
    onSuccess: () => {
      setIsLoading(false);

      setAlert({
        type: 'success',
        title: 'Your changes were successfully saved.',
      });

      setShowAlert(true);
    },

    onError: () => {
      setIsLoading(false);

      setAlert({
        type: 'error',
        title: 'An error has occured while saving. Please try gain later',
      });

      setShowAlert(true);
    },
  });

  const handleEditUserData = useCallback(
    (data: UserProfilePayload) => {
      reset();
      setIsLoading(true);
      mutation.mutate(data);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    },

    [mutation, reset],
  );

  const handleEditPassword = useCallback(
    (data: UserProfilePayload) => {
      resetPasswordInput();
      setIsLoading(true);
      mutationPassword.mutate(data);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    },
    [mutationPassword, resetPasswordInput],
  );
  return (
    <ApplicationLayout>
      <Head>
        <title>UserProfile - Landgriffon</title>
      </Head>

      <div className="flex-col">
        <h1 className="mt-6 ml-6">My profile</h1>
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

        <div className="ml-6">
          <Transition
            show={showAlert}
            enter="transition-opacity ease-in-out duration-700 delay-1000"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in-out duration-700 delay-1000"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Alerts items={alert} />
          </Transition>
        </div>
      </div>
    </ApplicationLayout>
  );
};

export default UserProfile;
