import { useState, FC } from 'react';
import cx from 'classnames';

import Carousel from 'components/carousel';
import FadeIn from 'components/fade';
import BlogCard from 'components/blog-card';
import usePosts from 'hooks/posts';

const BlogPosts: FC = () => {
  const [slide, setSlide] = useState(1);
  const { data, isFetched } = usePosts();

  const posts = data?.items?.slice(0, 4); // Taking the first 4 posts

  return (
    <section className="relative py-12 bg-blue-600 border-t border-white/10 md:py-32">
      <div className="flex flex-col m-4 md:m-0">
        <FadeIn>
          <div className="flex justify-center pb-16 space-y-5 md:space-y-20">
            <h2 className="text-4xl font-black text-white uppercase md:text-6xl font-display">
              Discover our journey
            </h2>
          </div>
        </FadeIn>
        {isFetched && data && (
          <>
            <FadeIn>
              <div className="relative h-96 blog-carousel">
                <div className="absolute top-0 left-0 z-10 h-full w-96 md:bg-gradient-to-r md:from-blue-600" />
                <Carousel
                  slide={slide}
                  slides={posts.map(({ guid, title, description, thumbnail }) => ({
                    id: guid,
                    content: (
                      <div className="mr-4">
                        <BlogCard
                          key={guid}
                          title={title}
                          description={description}
                          image={thumbnail}
                          url={guid}
                        />
                      </div>
                    ),
                  }))}
                  autoplay={0}
                  options={{ circular: true, bound: false }}
                  onChange={setSlide}
                />
                <div className="absolute top-0 right-0 z-10 h-full w-96 md:bg-gradient-to-l md:from-blue-600" />
              </div>
              <div className="flex justify-center py-5 mt-10">
                {posts.map((post, i) => {
                  return (
                    <button
                      key={post.guid}
                      type="button"
                      aria-label="line-element"
                      onClick={() => {
                        setSlide(i);
                      }}
                      className={cx({
                        'relative w-28 h-0.5 border border-white/20': true,
                      })}
                    >
                      {slide === i && (
                        <div className="absolute w-28 h-0.5 transform -translate-y-1/2 bg-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </FadeIn>
          </>
        )}
      </div>
    </section>
  );
};

export default BlogPosts;
