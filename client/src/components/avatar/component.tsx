import cx from 'classnames';

export type AvatarProps = React.ImgHTMLAttributes<HTMLImageElement>;

export const Avatar: React.FC<AvatarProps> = ({ className, ...props }: AvatarProps) => (
  <img
    alt={props.alt || 'Profile avatar'}
    className={cx('inline-block h-10 w-10 rounded-full', className)}
    {...props}
  />
);

export default Avatar;
