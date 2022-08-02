import { FC } from 'react';

import Image from 'next/image';

export interface BlogProps {
  title: string;
  subtitle: string;
  url: string;
  image: string;
}

const BlogCard: FC<BlogProps> = ({ title, subtitle, url, image }: BlogProps) => {
  return (
    <div className="bg-blue-900 h-96 w-96 border-1 border-solid border-blue-900">
      <a href={url} target="_blank" rel="noreferrer noopener">
        <Image src={image} alt="" height={178} width={384} layout="responsive" />
        <div className="p-5">
          <h5 className="text-white font-light text-2xl tracking-tight mb-2">{title}</h5>
          <p className="font-light text-base text-white mb-3">{subtitle}</p>
        </div>
      </a>
    </div>
  );
};

export default BlogCard;
