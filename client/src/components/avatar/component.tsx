import cx from 'classnames';
import Image, { ImageProps } from 'next/image';

export type AvatarProps = ImageProps;

export const Avatar: React.FC<AvatarProps> = ({ className, ...props }: AvatarProps) => (
  <div className={cx('relative h-10 w-10 rounded-full inline-block overflow-hidden', className)}>
    <Image alt={props.alt || 'Profile avatar'} layout="fill" {...props} />
  </div>
);

export default Avatar;
