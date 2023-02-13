import { useCallback } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { capitalize, omit } from 'lodash-es';

import { useMutateOptions } from './helpers';

import { Label, Input } from 'components/forms';
import { Button } from 'components/button';
import Select from 'components/forms/select';
import { RoleName } from 'hooks/permissions/enums';
import { useUpdateUser, useCreateUser, useDeleteUser } from 'hooks/users';

import type { Option } from 'components/forms/select/types';
import type { UserFormProps } from './types';
import type { FC } from 'react';
import type { Profile } from 'types';
import { usePermissions } from 'hooks/permissions';

type UserFormData = Omit<Profile, 'id'>;

const schemaValidation: yup.SchemaOf<UserFormData> = yup.object().shape({
  email: yup.string().email().optional().nullable(),
  displayName: yup.string().optional().nullable(),
  fname: yup.string().optional().nullable(),
  lname: yup.string().optional().nullable(),
  roles: yup.array().of(yup.string()).optional().nullable(),
});

const UserForm: FC<UserFormProps> = ({ user, closeUserForm }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<UserFormData>({
    resolver: yupResolver(schemaValidation),
    defaultValues: {
      roles: user.roles.map(({ name }) => name),
      displayName: user.displayName,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
    },
  });

  const { hasRole } = usePermissions();
  const isAdmin = hasRole(RoleName.ADMIN);

  const formValues = watch();

  const updateUser = useUpdateUser();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const options = Object.values(RoleName).map((role) => ({
    label: capitalize(role),
    value: role,
  }));

  const getMutateOptions = useMutateOptions(closeUserForm);

  const onSubmit = useCallback(
    (data: UserFormData) => {
      if (!!user.id) {
        updateUser.mutate(
          {
            id: user.id,
            // Currently the API doens NOT support sending email for update
            data: omit(data, 'email'),
          },
          getMutateOptions('update'),
        );
      } else {
        createUser.mutate(data, getMutateOptions('create'));
      }
    },
    [createUser, getMutateOptions, updateUser, user.id],
  );

  const handleDeleteUser = () => {
    deleteUser.mutate(user.id, getMutateOptions('delete'));
  };

  return (
    <div className="col-span-8 bg-white rounded-md shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div>
            <Label htmlFor="fname">First name</Label>
            <Input {...register('fname')} error={errors.fname?.message as string} />
          </div>
          <div>
            <Label htmlFor="lname">Last name</Label>
            <Input {...register('lname')} error={errors.lname?.message as string} />
          </div>
          <div>
            <Label htmlFor="displayName">Title</Label>
            <Input {...register('displayName')} error={errors.fname?.message as string} />
          </div>
          <div>
            <Label htmlFor="roles">Role</Label>
            <Controller
              name="roles"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  // These props will change with MultiSelect
                  value={options.find(({ value }) => value === formValues.roles[0])}
                  options={options}
                  defaultValue={options.find(({ value }) => value === user?.roles[0]?.name)}
                  onChange={(value: Option) => setValue('roles', [value.value as RoleName])}
                  error={errors.roles?.message as string}
                  loading={!user}
                />
              )}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register('email')}
              // Currently disabled for UPDATE because API doesn't support send email
              disabled={!!user?.id}
              type="email"
              error={errors.email?.message as string}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            {user?.id && (
              <Button
                type="button"
                variant="primary"
                danger
                loading={deleteUser.isLoading}
                onClick={handleDeleteUser}
                disabled={!isAdmin}
              >
                Delete user
              </Button>
            )}
          </div>
          <div className="flex justify-between gap-2.5">
            <Button type="button" variant="white" onClick={closeUserForm}>
              Cancel
            </Button>
            <Button
              disabled // ={!isAdmin} Uncomment when endpoint is fixed
              type="submit"
              variant="primary"
              loading={updateUser.isLoading || createUser.isLoading}
            >
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
