import ApplicationLayout from 'layouts/application';
import Head from 'next/head';
import { Label, Input } from 'components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useCallback } from 'react';
import { apiService } from 'services/api';

type UserProfilePayload = {
  fname?: string;
  lname?: string;
  email?: string;
  password?: string;
};

const schemaValidation = yup.object({
  fname: yup.string().required('first name is required'),
  lname: yup.string().required('last name is required'),
  email: yup.string().email().required(),
  currentPassword: yup.string().min(8).required('password is required'),
  newPassword: yup.string().min(8).required('password is required'),
  passwordConfirmation: yup
    .string()
    .required('password confirmation is required')
    .oneOf([yup.ref('password'), null], 'passwords must match'),
});

const editUserData = (data: UserProfilePayload) => apiService.patch('/users/me', data);
const editPassword = (data: UserProfilePayload) => apiService.patch('/users/password', data);

const UserProfile: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPaaaword },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const mutation = useMutation(editUserData, {
    /* onSuccess: () => {}, */
  });

  const mutationPassword = useMutation(editPassword, {
    /*   onSuccess: () => {}, */
  });

  const handleEditUserData = useCallback(
    (data: UserProfilePayload) => {
      mutation.mutate(data);
    },
    [mutation],
  );

  const handleEditPassword = useCallback(
    (data: UserProfilePayload) => {
      mutationPassword.mutate(data);
    },
    [mutationPassword],
  );
  return (
    <ApplicationLayout>
      <Head>
        <title>UserProfile - Landgriffon</title>
      </Head>

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
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-800 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="mt-8 ml-6 mb-44">
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
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-800 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </ApplicationLayout>
  );
};

export default UserProfile;
