import { Button } from 'components/button';
import useModal from 'hooks/modals';
import AdminEditTargetModal from 'containers/admin/edit-target-modal';

import type { Target } from 'types';

const TargetItem: React.FC<Target> = ({ id, name, years, unit }) => {
  const {
    isOpen: isUploadEditTargetModalOpen,
    open: openEditTargetModal,
    close: closeEditTargetModal,
  } = useModal();

  return (
    <div className="grid grid-cols-12 items-center gap-4 bg-white p-4 text-sm shadow-sm">
      <div className="col-span-3">{name}</div>
      <div className="col-span-2">
        <div className="flex justify-center">
          <div className="rounded-md bg-green-50 p-4 text-center text-sm font-semibold text-green-800">
            2.37Mt
          </div>
        </div>
      </div>
      <div className="col-span-7">
        <div className="grid grid-cols-4 gap-4">
          {years.map(({ year, value }) => (
            <div key={`target-item-${id}-${year}`} className="py-4 text-center">
              {value} <span>{unit}</span>
            </div>
          ))}
          <div className="flex items-center justify-end">
            <Button
              variant="white"
              size="xs"
              onClick={openEditTargetModal}
              disabled
              className="h-8"
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
      <AdminEditTargetModal
        title={name}
        open={isUploadEditTargetModalOpen}
        onDismiss={closeEditTargetModal}
      />
    </div>
  );
};

export default TargetItem;
