import type { FC } from 'react';
import { useCallback } from 'react';
import { useAppDispatch } from 'store/hooks';
import { setSubContentCollapsed } from 'store/features/analysis/ui';

import Button from 'components/button';

import GrowthFormContent from './content';

const GrowthForm: FC = () => {
  const dispatch = useAppDispatch();

  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
  }, [dispatch]);

  return (
    <form className="space-y-8">
      <GrowthFormContent />
      <div className="pt-5">
        <div className="flex justify-end">
          <Button type="button" onClick={handleCancel} theme="secondary">
            Cancel
          </Button>
          <Button
            type="button"
            //type="submit"
            className="ml-3"
          >
            Add growth rate
          </Button>
        </div>
      </div>
    </form>
  );
};

export default GrowthForm;
