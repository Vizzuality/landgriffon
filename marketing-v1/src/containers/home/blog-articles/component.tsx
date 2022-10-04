import Wrapper from 'containers/wrapper';

import articles from './articles.json';

const BlogArticles = () => (
  <Wrapper hasPadding={false} className="my-28">
    <h2 className="font-heading-4 font-semibold mb-12">Latest news</h2>
    <div className="grid md:grid-cols-12 gap-10">
      {articles.map(({ thumbnail, slug, title, description, url }) => (
        <figure
          className="md:col-span-6 lg:col-span-4 shadow rounded-3xl overflow-hidden"
          key={slug}
        >
          <div className="relative">
            <img
              alt={title}
              src={thumbnail}
              className="object-cover w-full"
              style={{ height: 230 }}
            />
          </div>
          <figcaption className="space-y-10 p-10">
            <h3 className="font-heading-4 font-semibold text-green">
              <a href={url} className="hover:underline">
                {title}
              </a>
            </h3>
            <p className="text-sm">{description}</p>
            <a
              href={url}
              className="mt-10 block text-right text-sm underline font-semibold hover:no-underline"
            >
              Read more
            </a>
          </figcaption>
        </figure>
      ))}
    </div>
  </Wrapper>
);

export default BlogArticles;
