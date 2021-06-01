import { ButtonHTMLAttributes, FC } from 'react';
import cx from 'classnames';

export interface AvatarProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  bgImage?: string;
}

export const Avatar: FC<AvatarProps> = ({
  children,
  className,
  bgImage,
}: AvatarProps) => (
  <div
    className={cx({
      'relative z-0 hover:z-10 flex items-center justify-center bg-transparent bg-cover bg-no-repeat bg-center border-2 border-gray-700 w-10 h-10 rounded-full': true,
      [className]: !!className,
    })}
    style={{
      ...bgImage && { backgroundImage: `url(${bgImage})` },
    }}
  >
    {children}
  </div>
);

export default Avatar;
