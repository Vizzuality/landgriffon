import cx from 'classnames';
import { stringAvatarProps } from './type';

const stringAvatarFn = (name: string) => {
  const stringAvatar = `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`;
  return stringAvatar;
};

export const StringAvatar: React.FC<stringAvatarProps> = ({
  className,
  fullName,
}: stringAvatarProps) => (
  <div
    className={cx(
      `flex h-10 w-10 rounded-full items-center bg-green-600 uppercase text-white justify-center font-semibold`,
      className,
    )}
  >
    {stringAvatarFn(fullName)}
  </div>
);

export default StringAvatar;
