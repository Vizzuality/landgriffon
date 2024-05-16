import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Link from 'next/link';
import Icon from 'components/icon';
import Image from 'next/image';

import NATURE_SVG from 'svgs/compliance/nature.svg?sprite';
import GLOBE_SVG from 'svgs/compliance/globe.svg?sprite';
import GOALS_SVG from 'svgs/compliance/goals.svg?sprite';
import DOCUMENTS_SVG from 'svgs/compliance/documents.svg?sprite';
import CHART_SVG from 'svgs/compliance/chart.svg?sprite';

const constants = [
  {
    icon: NATURE_SVG,
    title: 'Assess Impact on Nature:',
    text: 'Use LandGriffon’s methodology to appraise nature impacts against SBTN-aligned indicators.',
  },
  {
    icon: GLOBE_SVG,
    title: 'Prioritize High-Risk Areas: ',
    text: 'Allocate resources based on environmental materiality screening.',
  },
  {
    icon: GOALS_SVG,
    title: 'Set Impactful Science-Based Targets: ',
    text: 'Establish specific targets across freshwater, land, climate, and biodiversity.',
  },
  {
    icon: DOCUMENTS_SVG,
    title: 'Make Informed Interventions: ',
    text: "Follow SBTN's Action Framework (AR3T) for positive impact.",
  },
  {
    icon: CHART_SVG,
    title: 'Track Progress:',
    text: 'Report publicly on progress using LandGriffon’s streamlined reporting tools.',
  },
];

const ScienceBasedTargets: React.FC = () => {
  return (
    <section className="relative py-12 space-y-12 bg-blue-600 md:space-y-64 md:py-36 overflow-hidden">
      <Wrapper>
        <div className="space-y-10 text-white md:space-y-20">
          <FadeIn>
            <h2 className="text-5xl font-black text-white uppercase font-display md:text-7xl">
              Implement Science-Based <span className="text-orange-500">Targets for Nature: </span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-2">
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
                  <a className="px-7 py-5 border-2 border-white inline-block leading-8">
                    <span>Contact us now</span>
                  </a>
                </Link>
              </div>
            </FadeIn>

            <FadeIn>
              <ul className="flex flex-col space-y-5">
                {constants.map(({ title, icon, text }) => (
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
            <div className="relative w-full h-full aspect-auto"></div>
            <Image
              src="/images/compliance/forest.png"
              alt="Forest"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default ScienceBasedTargets;
