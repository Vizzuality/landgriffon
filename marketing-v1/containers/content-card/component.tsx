import React from 'react';

import cx from 'classnames';

import Image from 'next/image';
import Link from 'next/link';

export interface ContentCardProps {
  description: string;
  imageURL: string;
  title: string;
  hyperlink?: string;
  orientation: 'vertical' | 'horizontal';
  reverse?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({
  description,
  imageURL,
  title,
  hyperlink,
  orientation = 'vertical',
  reverse = false,
}: ContentCardProps) => (
  <>
    {orientation === 'vertical' && (
      <div>
        <Image width="466px" height="575px" src={imageURL} />
        <div className="flex flex-col py-8 space-y-4 md:w-96">
          <h6 className="text-xl md:text-5xl font-sans-semibold">{title}</h6>
          <p className="text-base md:text-xl">{description}</p>
          {hyperlink && (
            <Link href={hyperlink}>
              <a
                className="text-2xl text-black underline font-sans-semibold hover:no-underline"
                target="_blank"
                href={hyperlink}
                rel="noreferrer"
              >
                Learn more
              </a>
            </Link>
          )}
        </div>
      </div>
    )}
    {orientation === 'horizontal' && (
      <div
        className={cx({
          'lg:flex': true,
          'lg:flex flex-row-reverse': reverse,
          'lg:space-x-12 xl:space-x-0': !reverse,
        })}
      >
        <Image width="657px" height="351px" src={imageURL} />
        <div
          className={cx({
            'flex flex-col py-4 space-y-4 xl:px-20 lg:w-2/4': true,
            'lg:mr-12 xl:mr-0': reverse,
          })}
        >
          <h6 className="text-xl md:text-5xl font-sans-semibold">{title}</h6>
          <p className="text-base md:text-xl">{description}</p>
          {hyperlink && (
            <Link href={hyperlink}>
              <a
                className="text-2xl text-black underline font-sans-semibold hover:no-underline"
                target="_blank"
                href={hyperlink}
                rel="noreferrer"
              >
                Learn more
              </a>
            </Link>
          )}
        </div>
      </div>
    )}
  </>
);

export default ContentCard;
