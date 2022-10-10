import { Button } from 'components/button';
import type { Target } from 'types';

import useModal from 'hooks/modals';
import AdminEditTargetModal from 'containers/admin/edit-target-modal';

const TARGET_PILL_TITLE_CLASSNAMES = 'text-green-700 text-sm uppercase font-bold';
const TARGET_PILL_VALUE_CLASSNAMES = '';

const TargetItem: React.FC<Target> = ({ id, name, years }) => {
  const {
    isOpen: isUploadEditTargetModalOpen,
    open: openEditTargetModal,
    close: closeEditTargetModal,
  } = useModal();

  return (
    <div className="grid grid-cols-12 gap-4 items-center justify-between rounded-md bg-white shadow-sm p-4">
      <div className="col-span-3">{name}</div>
      <div className="col-span-9 flex items-center justify-between">
        <div className="bg-green-50 rounded-md py-4 px-6 text-center">
          <div className={TARGET_PILL_TITLE_CLASSNAMES}>Baseline</div>
          <div className={TARGET_PILL_VALUE_CLASSNAMES}>2.37Mt</div>
        </div>
        {years.map(({ year, value }) => (
          <div key={`${id}-${year}`} className="py-4 text-center">
            <div className={TARGET_PILL_TITLE_CLASSNAMES}>{year}</div>
            <div className={TARGET_PILL_VALUE_CLASSNAMES}>{value}</div>
          </div>
        ))}
        <Button variant="secondary" onClick={openEditTargetModal}>
          Edit
        </Button>
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
