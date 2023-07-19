import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { omit, pick } from 'lodash-es';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from 'components/button';
import Input from 'components/forms/input';
import Select from 'components/forms/select';
import { RoleName } from 'hooks/permissions/enums';
import { useCreateUser, useEditUser } from 'hooks/users';

import type { User } from 'types';
import type { Option } from 'components/forms/select';

const schemaValidation = yup.object({
  fname: yup.string().optional().nullable(),
  lname: yup.string().optional().nullable(),
  title: yup.string().optional().nullable(),
  email: yup.string().email().required('email is required'),
  roles: yup
    .array()
    .of(yup.string())
    .min(1, 'Select at least one role')
    .required('role is required'),
});

type UserFormData = Pick<User, 'fname' | 'lname' | 'email' | 'title'> & {
  roles: RoleName[];
};

type UserFormProps = {
  user?: User;
  onSubmit?: () => void;
  children?: React.ReactNode;
};

const UserForm = ({ user, onSubmit, children }: UserFormProps) => {
  const roleOptions = Object.values(RoleName).map((role) => ({ label: role, value: role }));

  const {
    register,
    control,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      ...pick(user, 'fname', 'lname', 'email', 'title'),
      // Set a default role option 'User' if the user has no roles
      roles: user?.roles.length ? user.roles.map((role) => role.name) : [RoleName.USER],
    },
    resolver: yupResolver(schemaValidation),
  });

  const updateUser = useEditUser();
  const createUser = useCreateUser();

  const { roles } = watch();

  const roleValue = useMemo(() => {
    return roles.map((role) => ({ label: role, value: role }));
  }, [roles]);

  const createOrUpdateOptions = {
    onSuccess: () => {
      toast.success(`User was ${!!user ? 'updated' : 'created'} successfully`);
    },
    onError: () => {
      toast.error(`Failed to ${!!user ? 'update' : 'create'} user`);
    },
    onSettled: () => {
      onSubmit?.();
    },
  };

  const createOrUpdateUser = (data: UserFormData) => {
    if (!user?.id) {
      createUser.mutate(data, createOrUpdateOptions);
    } else {
      updateUser.mutate({ id: user.id, ...omit(data, 'email') }, createOrUpdateOptions); // API doesn't allow updating email
    }
  };

  return (
    <form onSubmit={handleSubmit(createOrUpdateUser)}>
      <div className="grid grid-cols-2 gap-6 my-6">
        <div>
          <label htmlFor="fname">First Name</label>
          <Input {...register('fname')} />
        </div>
        <div>
          <label htmlFor="lname">Last Name</label>
          <Input {...register('lname')} />
        </div>
        <div>
          <label htmlFor="title">Title</label>
          <Input {...register('title')} />
        </div>
        <div>
          <label htmlFor="roles">Role</label>
          <Controller
            name="roles"
            control={control}
            render={({ field: { value, ...field } }) => {
              return (
                <Select
                  id="roles"
                  {...omit(field, 'ref')}
                  value={roleValue}
                  defaultValue={roleOptions[0]}
                  options={roleOptions}
                  placeholder="Select a role"
                  onChange={(v: Option<string>[]) => {
                    setValue(
                      'roles',
                      v.map((option) => option.value as RoleName),
                    );
                  }}
                  multiple
                  error={errors?.roles?.message as string}
                  showHint
                />
              );
            }}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="email">Email</label>
          <Input
            {...register('email')}
            disabled={!!user?.id}
            error={errors?.email?.message as string}
            showHint
          />
        </div>
      </div>
      <div className="flex">
        {children}
        <Button size="xs" variant="primary" type="submit">
          Save
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
