import React, { useState } from 'react';

import cx from 'classnames';

import Image from 'next/image';
import Link from 'next/link';

import { motion, AnimatePresence } from 'framer-motion';

export interface CardProps {
  className?: string;
  role?: string;
  name?: string;
  photo?: string;
  profileURL?: string;
}

const Card: React.FC<CardProps> = ({ role, name, photo, profileURL, className }: CardProps) => {
  const [isHovered, setHovered] = useState(false);
  return (
    <div
      className={cx({
        'cursor-pointer relative flex flex-col justify-between bg-white font-sans-semibold w-72 h-max rounded-3xl':
          true,
        [className]: !!className,
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex flex-col px-5 pt-5 h-28">
        <p style={{ fontSize: '12px', lineHeight: '1.4rem' }} className="text-green">
          {role}
        </p>
        <p className="text-xl text-black">{name}</p>
      </div>
      <Image
        className="rounded-b-3xl"
        alt="Susana Romão"
        src={photo}
        height="288px"
        width="266px"
      />
      <AnimatePresence>
        {profileURL && (
          <motion.div
            className="absolute z-50 w-full p-5 bg-white -bottom-1 rounded-b-3xl"
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Card;
