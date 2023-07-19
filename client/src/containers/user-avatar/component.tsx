import Avatar from 'components/avatar/component';
import StringAvatar from 'components/string-avatar/component';

import type { User } from 'types';

type UserAvatarProps = {
  user: User;
  userFullName: string;
  className?: string;
};

export const UserAvatar = ({ user, userFullName, className = '' }: UserAvatarProps) => {
  if (user?.avatarDataUrl)
    return <Avatar alt="user avatar" src={user?.avatarDataUrl} className={className} />;
  return <StringAvatar fullName={userFullName} className={className} />;
};

export default UserAvatar;
