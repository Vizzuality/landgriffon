import Avatar from 'components/avatar/component';
import StringAvatar from 'components/string-avatar/component';

import type { User } from 'types';

type UserAvatarProps = {
  user: User;
  className?: string;
};

export const UserAvatar = ({ user, className = '' }: UserAvatarProps) => {
  if (user?.avatarDataUrl)
    return <Avatar alt="user avatar" src={user?.avatarDataUrl} className={className} />;
  if (user?.fname)
    return <StringAvatar fullName={`${user.fname} ${user.lname ?? ''}`} className={className} />;
  return <StringAvatar fullName={user?.email} className={className} />;
};

export default UserAvatar;
