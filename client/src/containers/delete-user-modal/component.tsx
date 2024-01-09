import { useCallback, useState } from 'react';
import { ExclamationIcon } from '@heroicons/react/outline';
import toast from 'react-hot-toast';

import { Button } from 'components/button';
import Modal from 'components/modal/component';
import { useDeleteUser } from 'hooks/users';

type DeleteUserProps = {
  userName: string;
  id: string;
};

const DeleteUserModal = ({ id, userName }: DeleteUserProps) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteUser, isLoading } = useDeleteUser();

  const handleDeleteUser = useCallback(() => {
    deleteUser(id, {
      onSettled: () => setOpen(false),
      onError: () => toast.error('There was an error deleting the user. Try again later.'),
      onSuccess: () => toast.success('User deleted successfully'),
    });
  }, [deleteUser, id]);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <Button size="xs" variant="secondary" danger onClick={() => setOpen(true)}>
        Delete user
      </Button>
      <Modal
        theme="minimal"
        title={`Delete user "${userName}"`}
        open={open}
        onDismiss={closeModal}
        size="fit"
        dismissible={false}
      >
        <div className="flex gap-6 p-6 pb-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-50">
            <ExclamationIcon className="h-6 stroke-red-400" />
          </div>
          <div>
            <h1 className="mb-1 text-base font-semibold leading-7 text-gray-900">
              Delete user &quot;{userName}&quot;
            </h1>
            <p className="mb-4 text-sm text-gray-500">
              All of this user data will be permanently removed from our servers forever. This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="white" onClick={closeModal}>
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

export default DeleteUserModal;
