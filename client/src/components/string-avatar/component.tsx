import cx from 'classnames';

import type { stringAvatarProps } from './type';

const renderUserInitials = (name: string) => {
  const userNames = name?.split(' ');
  if (!name || userNames?.length === 0) return 'LG'; // Default
  if (userNames?.length === 1) return `${userNames[0][0]}${userNames[0][1]}`;
  return `${userNames[0][0]}${userNames[1][0]}`;
};

export const StringAvatar: React.FC<stringAvatarProps> = ({
  className,
  fullName,
}: stringAvatarProps) => (
  <div
    className={cx(
      `flex h-10 w-10 rounded-full text-lg items-center bg-navy-400 uppercase text-white justify-center font-semibold`,
      className,
    )}
  >
    {renderUserInitials(fullName)}
  </div>
);

export default StringAvatar;
