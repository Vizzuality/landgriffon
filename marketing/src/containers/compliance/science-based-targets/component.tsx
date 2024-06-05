import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Link from 'next/link';
import Icon from 'components/icon';
import Image from 'next/image';
import { TARGETS } from './constants';
const ScienceBasedTargets: React.FC = () => {
  return (
    <section className="relative space-y-12 bg-blue-600 md:py-8 overflow-hidden">
      <Wrapper>
        <div className="space-y-10 text-white md:space-y-20 md:py-32 py-12">
          <FadeIn>
            <h2 className="text-5xl font-black text-white uppercase font-display md:text-7xl">
              Implement Science-Based <span className="text-orange-500">Targets for Nature: </span>
            </h2>
          </FadeIn>

          <div className="md:grid md:grid-cols-2 flex flex-col space-y-12 md:space-y-0">
            <FadeIn>
              <div className="space-y-8 max-w-[420px]">
                <p className="inline-block text-2xl">
                  You can read more about how to set Science-Based Targets for Nature with
                  LandGriffon.
                </p>

                <p className="text-white inline-block">
                  Contact us now and elevate your nature impact assessment.
                </p>

                <Link href="/contact">
                  <a className="px-7 py-5 border-2 border-white inline-block leading-8 hover:bg-white/10 font-semibold">
                    <span>Contact us now</span>
                  </a>
                </Link>
              </div>
            </FadeIn>

            <FadeIn>
              <ul className="flex flex-col space-y-5">
                {TARGETS.map(({ title, icon, text }) => (
                  <li key={title} className="space-x-4 flex items-start">
                    <span className="rounded-full bg-orange-500 p-2">
                      <Icon icon={icon} className="w-5 h-5 shrink-0" />
                    </span>
                    <p>
                      <span className="font-bold">{title}</span>
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </Wrapper>
      <FadeIn>
        <div className="w-screen min-h-[459px] h-auto relative aspect-auto">
          <Image
            src="/images/compliance/forest.jpg"
            alt="Forest"
            layout="fill"
            objectFit="cover"
            objectPosition="top"
            draggable={false}
          />
        </div>
      </FadeIn>
    </section>
  );
};

export default ScienceBasedTargets;
