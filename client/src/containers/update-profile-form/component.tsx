import { useCallback } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useProfile, useUpdateProfile } from 'hooks/profile';
import { Label, Input } from 'components/forms';
import { Button } from 'components/button';

import type { ProfilePayload, ErrorResponse } from 'types';

const schemaValidation = yup.object({
  fname: yup.string(),
  lname: yup.string(),
  // email: yup.string().email().optional().nullable(), API DOES NOT SUPPORT EMAIL
  companyTitle: yup.string().optional().nullable(),
});

const UserDataForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<yup.InferType<typeof schemaValidation>>({
    resolver: yupResolver(schemaValidation),
  });

  const user = useProfile();
  const updateProfile = useUpdateProfile();

  const handleEditUserData = useCallback(
    (data: ProfilePayload) => {
      updateProfile.mutate(data, {
        onSuccess: () => {
          toast.success('Your changes were successfully saved.');
        },
        onError: (error: ErrorResponse) => {
          const { errors } = error.response?.data;
          errors.forEach(({ title }) => toast.error(title));
        },
      });
    },
    [updateProfile],
  );

  return (
    <section className="mt-14">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <h1 className="text-lg ">Personal information</h1>
          <p className="text-sm text-gray-500">
            Use a permanent address where you can receive mail.
          </p>
        </div>

        <div className="col-span-8 bg-white rounded-md shadow-lg">
          {user.data && !user.isLoading && (
            <form onSubmit={handleSubmit(handleEditUserData)}>
              <div className="grid grid-cols-2 gap-6 p-6 pb-8">
                <div>
                  <Label htmlFor="fname">First name</Label>
                  <Input
                    {...register('fname')}
                    defaultValue={user.data.fname}
                    error={errors.fname?.message as string}
                  />
                </div>
                <div>
                  <Label htmlFor="lname">Last name</Label>
                  <Input
                    {...register('lname')}
                    defaultValue={user.data.lname}
                    error={errors.lname?.message as string}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    // error={errors.email?.message as string}
                    // {...register('email')} API DOES NOT SUPPORT EMAIL
                    defaultValue={user.data.email}
                    type="email"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="companyTitle">Company title</Label>
                  <Input
                    {...register('companyTitle')}
                    defaultValue={user.data.companyTitle}
                    error={errors.companyTitle?.message as string}
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-end h-16 py-3 pr-6 rounded-md bg-gray-50">
                <Button type="submit" variant="primary" loading={updateProfile.isLoading}>
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
