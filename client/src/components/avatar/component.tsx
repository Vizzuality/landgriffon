import cx from 'classnames';
import Image, { ImageProps } from 'next/image';

export type AvatarProps = ImageProps;

export const Avatar: React.FC<AvatarProps> = ({ className, ...props }: AvatarProps) => (
  <Image
    alt={props.alt || 'Profile avatar'}
    className={cx('inline-block h-10 w-10 rounded-full', className)}
    {...props}
  />
);

export default Avatar;
