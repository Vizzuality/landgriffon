import Intro from 'containers/repository/intro';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Link from 'next/link';
import Icon from 'components/icon';

import ARROW_SVG from 'svgs/ui/arrow-right.svg?sprite';
import Image from 'next/image';

const Webinar: React.FC = () => (
  <section className="relative bg-white">
    <Wrapper>
      <FadeIn>
        <Intro
          title="Podcast with Innovation Forum"
          intro={
            <>
              Francis Gassert, strategy and impact lead at Vizzuality, talks with Innovation
              Forum&apos;s Ian Welsh about{' '}
              <span className="font-bold">
                measuring impact and how to ensure credibility when doing so.
              </span>
              They discuss the importance of companies considering their land, carbon and
              biodiversity impacts and incoming regulatory changes driving this action.
            </>
          }
        >
          <div className="md:grid md:grid-cols-3 gap-14 pb-56 flex flex-col">
            <div className="md:col-span-1 w-full max-w-[297px] h-[365px] flex relative m-auto">
              <Image
                layout="fill"
                objectFit="cover"
                alt="wheat"
                src="/images/repository/wheat.png"
                className="object-center"
              />
            </div>
            <div className="col-span-2 flex flex-col justify-between">
              <p className="italic">
                “Agriculture is the source of civilization, the way we are tied to the earth, and
                the way we are most directly using and affecting nature. If you manage sourcing for
                a Fortune 500 food company, aside from a few government ministers, you probably have
                more influence over the future of Earth’s biodiversity than almost any other
                individual in the world.
              </p>
              <p className="italic">
                Few people are lucky enough to have this kind of influence over the future of our
                planet. This is where companies can truly innovate and shape the future of humanity,
                to choose to thrive in the world that we wish to see, rather than to get by in the
                one we are left with.”
              </p>
              <Link href="https://www.podbean.com/media/share/pb-4nqcj-1526415?utm_campaign=au_share_ep&utm_medium=dlink&utm_source=au_share">
                <a
                  className="flex space-x-5 items-center font-bold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="underline">Listen to the full episode.</span>
                  <Icon icon={ARROW_SVG} className="w-5 h-5 -rotate-45 font-bold" />
                </a>
              </Link>
            </div>
          </div>
        </Intro>
      </FadeIn>
    </Wrapper>
  </section>
);

export default Webinar;
