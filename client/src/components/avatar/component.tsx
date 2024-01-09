import cx from 'classnames';
import Image from 'next/image';

import type { ImageProps } from 'next/image';

export type AvatarProps = ImageProps;

export const Avatar: React.FC<AvatarProps> = ({ className, ...props }: AvatarProps) => (
  <div className={cx('relative inline-block h-10 w-10 overflow-hidden rounded-full', className)}>
    <Image alt={props.alt || 'Profile avatar'} width={40} height={40} {...props} priority />
  </div>
);

export default Avatar;
