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
    <figure
      className={cx('relative bg-white rounded-3xl overflow-hidden', {
        [className]: !!className,
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <figcaption className="p-5">
        <h4 className="font-semibold text-green text-xs mb-2">{role}</h4>
        <h3 className="font-semibold text-base">{name}</h3>
      </figcaption>
      <div className="relative" style={{ height: 266 }}>
        <Image alt={name} src={photo} layout="fill" objectFit="cover" />
      </div>
      <AnimatePresence>
        {profileURL && (
          <motion.div
            className="absolute w-full p-5 z-1 bottom-0 left-0 bg-white"
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            <Link href={profileURL}>
              <a
                className="hover:cursor-pointer font-semibold text-base hover:underline"
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
    </figure>
  );
};

export default Card;
