import { useCallback } from 'react';
import { useAppDispatch } from 'store/hooks';
import { setSubContentCollapsed } from 'store/features/analysis';

import GrowthFormContent from './content';

const GrowthForm = () => {
  const dispatch = useAppDispatch();

  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
  }, []);

  return (
    <form className="space-y-8">
        <GrowthFormContent />
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add growth rate
            </button>
          </div>
        </div>
      </form>
  );
};

export default GrowthForm;
