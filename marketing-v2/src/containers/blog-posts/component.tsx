import { useState, FC } from 'react';
import cx from 'classnames';

import Carousel from 'components/carousel';
import FadeIn from 'components/fade';
import BlogCard from 'components/blog-card';

const BLOGPOSTS = [
  {
    id: '1',
    content: (
      <div className="mr-4">
        <BlogCard
          title="Supply chain management."
          subtitle="Measure, manage and anticipate impacts and risks from the raw materials in your companies supply chain."
          url="https://medium.com/vizzuality-blog/seeking-early-users-for-better-supply-chain-management-with-landgriffon-53bc175a2fe6"
          image="/images/service/blogpost/01.png"
        />
      </div>
    ),
  },
  {
    id: '2',
    content: (
      <div className="mr-4">
        <BlogCard
          title="Optimize use of data."
          subtitle="Map supply chains, benchmark data, and estimate potential environmental risks into one accessible dashboard."
          url="https://medium.com/vizzuality-blog/tmi-dont-let-too-much-data-leave-you-in-the-dark-ecb7b206c291"
          image="/images/service/blogpost/02.png"
        />
      </div>
    ),
  },
  {
    id: '3',
    content: (
      <div className="mr-4">
        <BlogCard
          title="Fashions environmental impacts."
          subtitle="From water scarcity to deforestation, companies can now harness their supply chain information to build more sustainable businesses for the future."
          url="https://medium.com/vizzuality-blog/lifting-the-veil-from-fashion-brands-environmental-supply-chain-impacts-842563eab978"
          image="/images/service/blogpost/03.png"
        />
      </div>
    ),
  },
];

const BlogPosts: FC = () => {
  const [slide, setSlide] = useState(0);

  return (
    <section className="relative py-12 bg-blue-600 md:py-32">
      <div className="flex flex-col m-4 md:m-0">
        <FadeIn>
          <div className="flex justify-center space-y-5 pb-16 md:space-y-20">
            <h2 className="text-4xl font-black text-white uppercase md:text-6xl font-display">
              Discover our journey
            </h2>
          </div>
        </FadeIn>
        <FadeIn>
          <div className="relative h-96 blog-carousel">
            <div className="absolute z-10 h-full w-96 left-0 top-0 md:bg-gradient-to-r md:from-blue-600" />
            <Carousel
              slide={slide}
              slides={BLOGPOSTS}
              autoplay={0}
              options={{ circular: true, bound: false }}
              onChange={(i) => {
                setSlide(i);
              }}
            />
            <div className="absolute z-10 h-full w-96 right-0 top-0 md:bg-gradient-to-l md:from-blue-600" />
          </div>
          <div className="flex justify-center py-5 mt-10">
            {BLOGPOSTS.map((post, i) => {
              return (
                <button
                  key={post.id}
                  type="button"
                  aria-label="line-element"
                  onClick={() => {
                    setSlide(i);
                  }}
                  className={cx({
                    'relative w-28 h-0.5 border border-white': true,
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
      </div>
    </section>
  );
};

export default BlogPosts;
