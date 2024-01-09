import { useState } from 'react';

import UserForm from './user-form';

import { Button } from 'components/button';
import Modal from 'components/modal';
import DeleteUser from 'containers/delete-user-modal';
import getUserFullName from 'utils/user-full-name';
import { usePermissions } from 'hooks/permissions';
import { RoleName } from 'hooks/permissions/enums';

import type { User } from 'types';

type EditUserProps = {
  user: User;
};

const EditUser = ({ user }: EditUserProps) => {
  const [open, setOpenModal] = useState(false);
  const userName = getUserFullName(user, { replaceByEmail: true });

  const closeModal = () => setOpenModal(false);
  const { hasRole } = usePermissions();
  const isAdmin = hasRole(RoleName.ADMIN);
  return (
    <>
      <Button
        size="xs"
        variant="white"
        className="!text-sm"
        disabled={!isAdmin}
        onClick={() => setOpenModal(true)}
      >
        Edit
      </Button>
      <Modal size="narrow" open={open} title={`Edit user ${userName}`} onDismiss={closeModal}>
        <UserForm user={user} onSubmit={closeModal}>
          <div className="mr-2.5 flex flex-1 justify-between px-0.5">
            <DeleteUser id={user.id} userName={userName} />
            <Button size="xs" variant="white" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </UserForm>
      </Modal>
    </>
  );
};

export default EditUser;
