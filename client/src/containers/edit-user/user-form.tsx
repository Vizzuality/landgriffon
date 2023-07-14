import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { omit, pick } from 'lodash-es';

import { Button } from 'components/button';
import Input from 'components/forms/input';
import Select from 'components/forms/select';
import { RoleName } from 'hooks/permissions/enums';

import type { User } from 'types';
import type { Option } from 'components/forms/select';

type UserFormData = Pick<User, 'fname' | 'lname' | 'email'> & {
  roles: RoleName[];
};

type UserFormProps = {
  user: User;
  children: React.ReactNode;
};

const UserForm = ({ user, children }: UserFormProps) => {
  const { register, control, setValue } = useForm<UserFormData>({
    defaultValues: {
      ...pick(user, 'fname', 'lname', 'email'),
      roles: user.roles.map((role) => role.name),
    },
  });

  const roleOptions = Object.values(RoleName).map((role) => ({ label: role, value: role }));

  const [roleValue, setRoleValue] = useState<Option<string>[]>(
    user.roles.map((role) => ({ label: role.name, value: role.name })),
  );

  return (
    <form>
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
                  options={roleOptions}
                  placeholder="Select a role"
                  onChange={(v: Option<string>[]) => {
                    setValue(
                      'roles',
                      v.map((option) => option.value as RoleName),
                    );
                    setRoleValue(v);
                  }}
                  multiple
                  required
                />
              );
            }}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="email">Email</label>
          <Input {...register('email')} />
        </div>
      </div>
      <div className="flex">
        {children}
        <Button size="xs" variant="primary" type="submit" disabled>
          Save
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
