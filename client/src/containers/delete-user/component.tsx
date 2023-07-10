import { useState } from 'react';
import { ExclamationIcon } from '@heroicons/react/outline';
import toast from 'react-hot-toast';

import { Button } from 'components/button';
import Modal from 'components/modal/component';
import { useDeleteUser } from 'hooks/users';

type DeleteUserProps = {
  userName: string;
  id: string;
};

const DeleteUser = ({ id, userName }: DeleteUserProps) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteUser, isLoading } = useDeleteUser();

  const handleDeleteUser = () => {
    deleteUser(id, {
      onSettled: () => setOpen(false),
      onError: () => toast.error('There was an error deleting the user. Try again later.'),
      onSuccess: () => toast.success('User deleted successfully'),
    });
  };

  return (
    <>
      <Button size="xs" variant="secondary" danger onClick={() => setOpen(true)}>
        Delete user
      </Button>
      <Modal
        theme="minimal"
        title={`Delete user "${userName}"`}
        open={open}
        onDismiss={() => setOpen(false)}
        size="fit"
        dismissible={false}
      >
        <div className="flex p-6 pb-8 gap-6">
          <div className="w-14 shrink-0 h-14 flex justify-center items-center rounded-full bg-red-50">
            <ExclamationIcon className="h-6 stroke-red-400" />
          </div>
          <div>
            <h1 className="text-base leading-7 font-semibold text-gray-900 mb-1">
              Delete user &quot;{userName}&quot;
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              All of this user data will be permanently removed from our servers forever. This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="white" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button loading={isLoading} danger onClick={handleDeleteUser} disabled={!id}>
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DeleteUser;
