import { useState } from 'react';

import UserForm from './user-form';

import { Button } from 'components/button';
import Modal from 'components/modal';
import DeleteUser from 'containers/delete-user/component';

import type { User } from 'types';

type EditUserProps = {
  user: User;
};

const EditUser = ({ user }: EditUserProps) => {
  const [open, setOpenModal] = useState(false);
  const userName = user.fname
    ? `${user.fname} ${user.lname || ''}`
    : user.displayName ?? user.email;

  return (
    <>
      <Button size="xs" variant="white" onClick={() => setOpenModal(true)}>
        Edit
      </Button>
      <Modal open={open} title={`Edit user ${userName}`} onDismiss={() => setOpenModal(false)}>
        <UserForm user={user}>
          <div className="flex justify-between flex-1 mr-2.5 px-0.5">
            <DeleteUser id={user.id} userName={userName} />
            <Button size="xs" variant="white" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
          </div>
        </UserForm>
      </Modal>
    </>
  );
};

export default EditUser;
