import React from 'react';

import cx from 'classnames';

import Image from 'next/image';

export interface CardProps {
  className?: string;
  role?: string;
  name?: string;
  photo?: string;
}

const Card: React.FC<CardProps> = ({ role, name, photo, className }: CardProps) => (
  <div
    className={cx({
      'flex flex-col justify-between bg-white font-sans-semibold w-72 h-max rounded-3xl': true,
      [className]: !!className,
    })}
  >
    <div className="p-5">
      <p className="text-sm text-green">{role}</p>
      <p className="text-xl text-black">{name}</p>
    </div>
    <Image className="rounded-b-3xl" alt="Susana Romão" src={photo} height="288px" width="266px" />
  </div>
);

export default Card;
