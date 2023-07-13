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
          title="LandGriffon case study."
          subtitle="An example analysis of the impact of hypothetical sourcing of 1000 tonnes of palm oil in Aceh, Indonesia, with different levels of spatial sourcing precision and exploration of scenarios."
          url="https://medium.com/vizzuality-blog/landgriffon-in-action-an-example-case-study-35b7b9b6638c"
          image="/images/service/blogpost/01.jpg"
        />
      </div>
    ),
  },
  {
    id: '2',
    content: (
      <div className="mr-4">
        <BlogCard
          title="Evolving ESG regulations."
          subtitle="Three key proposals will change the ESG regulatory landscape. The EU CSRD & ESRS, SEC Climate-Related Disclosures and EU Deforestation Law. We summarize each and identify areas companies can prepare."
          url="https://medium.com/vizzuality-blog/the-three-upcoming-esg-regulations-every-company-should-pay-attention-to-f6153553552a"
          image="/images/service/blogpost/02.jpg"
        />
      </div>
    ),
  },
  {
    id: '3',
    content: (
      <div className="mr-4">
        <BlogCard
          title="Complex data, simplified."
          subtitle="LandGriffon collates data about company supply chains into one accessible dashboard. Map supply chains, benchmark data, and estimate potential environmental risks."
          url="https://medium.com/vizzuality-blog/tmi-dont-let-too-much-data-leave-you-in-the-dark-ecb7b206c291"
          image="/images/service/blogpost/03.png"
        />
      </div>
    ),
  },
];

const BlogPosts: FC = () => {
  const [slide, setSlide] = useState(1);

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
        <FadeIn>
          <div className="relative h-96 blog-carousel">
            <div className="absolute top-0 left-0 z-10 h-full w-96 md:bg-gradient-to-r md:from-blue-600" />
            <Carousel
              slide={slide}
              slides={BLOGPOSTS}
              autoplay={0}
              options={{ circular: true, bound: false }}
              onChange={(i) => {
                setSlide(i);
              }}
            />
            <div className="absolute top-0 right-0 z-10 h-full w-96 md:bg-gradient-to-l md:from-blue-600" />
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
      </div>
    </section>
  );
};

export default BlogPosts;
