import { useCallback, useEffect } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useProfile, useUpdateProfile } from 'hooks/profile';

import { Label, Input } from 'components/forms';
import { Button } from 'components/button';
import { UserProfilePayload } from './types';

const schemaValidation = yup.object({
  fname: yup.string(),
  lname: yup.string(),
  email: yup.string().email().required(),
});

const UserDataForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const user = useProfile();
  const updateProfile = useUpdateProfile();

  const handleEditUserData = useCallback(
    (data: UserProfilePayload) => {
      updateProfile.mutate({ data });
    },
    [updateProfile],
  );

  useEffect(() => {
    if (updateProfile.isSuccess) toast.success('Your changes were successfully saved.');
    if (updateProfile.isError) {
      if (updateProfile.error.response?.data) {
        const { errors } = updateProfile.error.response?.data;
        errors.forEach(({ title }) => toast.error(title));
      } else {
        toast.error(
          updateProfile.error.message ||
            'An error has occurred while saving. Please try again later',
        );
      }
    }
  }, [updateProfile]);

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
          {!user.isLoading && (
            <form onSubmit={handleSubmit(handleEditUserData)}>
              <div className="grid grid-cols-2 gap-6 p-6 pb-8">
                <div>
                  <Label htmlFor="fname">First name</Label>
                  <Input
                    {...register('fname')}
                    defaultValue={user.data.fname}
                    error={errors.fname?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="lname">Last name</Label>
                  <Input
                    {...register('lname')}
                    defaultValue={user.data.lname}
                    error={errors.lname?.message}
                  />
                </div>

                <div className="">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register('email')}
                    defaultValue={user.data.email}
                    type="email"
                    error={errors.email?.message}
                  />
                </div>
              </div>
              <div className="flex justify-end h-16 py-3 pr-6 rounded-md bg-gray-50">
                <Button type="submit" theme="primary" loading={updateProfile.isLoading}>
                  Save
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserDataForm;
