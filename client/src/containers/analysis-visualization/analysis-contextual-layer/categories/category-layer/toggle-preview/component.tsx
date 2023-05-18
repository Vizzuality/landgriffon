import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import { useCallback } from 'react';

import type { Dispatch, MouseEventHandler } from 'react';

interface TogglePreviewProps {
  isPreviewActive: boolean;
  onPreviewChange: Dispatch<boolean>;
  disabled?: boolean;
}

const TogglePreview = ({
  isPreviewActive,
  onPreviewChange,
  disabled = false,
}: TogglePreviewProps) => {
  const handleToggle = useCallback<MouseEventHandler>(
    (e) => {
      e.stopPropagation();
      onPreviewChange(!isPreviewActive);
    },
    [isPreviewActive, onPreviewChange],
  );

  const className = classNames(
    'w-4 h-4',
    disabled ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer',
  );

  return (
    <div className={className} onClick={disabled ? undefined : handleToggle}>
      {isPreviewActive ? (
        <EyeIcon className="w-4 h-4 text-gray-900" />
      ) : (
        <EyeOffIcon className="w-4 h-4 text-gray-900" />
      )}
    </div>
  );
};

export default TogglePreview;
