/* eslint-disable @next/next/no-img-element */
import { FC } from 'react';

export interface BlogProps {
  title: string;
  description: string;
  url: string;
  image?: string;
}

const BlogCard: FC<BlogProps> = ({ title, description, url }: BlogProps) => {
  return (
    <div
      data-testid="blog-card-item"
      className="bg-blue-900 h-96 w-96 border-1 border-solid border-blue-900"
    >
      <a href={url} target="_blank" rel="noreferrer noopener">
        <div className="w-full overflow-hidden">
          <img
            src={description.toString().match(/<img[^>]+src="([^">]+)"/)[1]}
            alt={title}
            className="w-full h-[178px] object-cover"
          />
        </div>
        <div className="p-5">
          <h3
            className="text-white font-light text-2xl tracking-tight mb-2 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <div
            className="font-light text-base text-white mb-3 line-clamp-4"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </a>
    </div>
  );
};

export default BlogCard;
