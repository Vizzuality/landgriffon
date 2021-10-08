import React from 'react';

import cx from 'classnames';

import Image from 'next/image';
import Link from 'next/link';

export interface CardProps {
  className?: string;
  role?: string;
  name?: string;
  photo?: string;
  profileURL?: string;
}

const Card: React.FC<CardProps> = ({ role, name, photo, profileURL, className }: CardProps) => (
  <div
    className={cx({
      'cursor-pointer group shadow-lg relative flex flex-col justify-between bg-white font-sans-semibold w-72 h-max rounded-3xl':
        true,
      [className]: !!className,
    })}
  >
    <div className="flex flex-col px-5 pt-5 h-28">
      <p style={{ fontSize: '12px', lineHeight: '1.4rem' }} className="text-green">
        {role}
      </p>
      <p className="text-xl text-black">{name}</p>
    </div>
    <Image className="rounded-b-3xl" alt="Susana Romão" src={photo} height="288px" width="266px" />
    {profileURL && (
      <div className="absolute z-50 invisible w-full p-5 bg-white group-hover:visible -bottom-1 rounded-b-3xl">
        <Link href={profileURL}>
          <a
            className="text-base text-black underline cursor-pointer font-sans-semibold"
            target="_blank"
            href={profileURL}
            rel="noreferrer"
          >
            Read bio
          </a>
        </Link>
      </div>
    )}
  </div>
);

export default Card;
