import Intro from 'containers/repository/intro';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Link from 'next/link';
import Icon from 'components/icon';

import ARROW_SVG from 'svgs/ui/arrow-right.svg?sprite';

const DATA = [
  {
    index: '01',
    title: 'Urgency & Transparency',
    description:
      "Openly publishing data fosters a culture of urgency, transparency, and shared responsibility for change. Let's spend more time on action and less on data prep.",
  },
  {
    index: '02',
    title: 'Learning from Nature',
    description:
      'Embrace the complexity of natural systems. Solutions should harmonize with nature, not oppose it. Nature Accounting aligns accounting solutions with the ecosystems they protect.',
  },
  {
    index: '03',
    title: 'Holistic Nature Accounting Standards',
    description:
      'SBTN and TNFD offer holistic nature accounting standards. Granular data goes beyond country-level, even measuring the nature impact of a single rice field.',
  },
  {
    index: '04',
    title: 'Continuous Improvement',
    description:
      'Our data is a work in progress. We invite your feedback and usage insights. Together, we can enhance and refine the datasets for a better future. ',
  },
  {
    index: '05',
    title: 'Transparent, Trusted, and Adaptable',
    description:
      "LandGriffon's open-source data is transparent and constantly reviewed. Our platform allows companies to measure supply chain activities against SBTN and TNFD indicators, providing valuable insights.",
  },
];

const Webinar: React.FC = () => (
  <section className="relative bg-white">
    <Wrapper>
      <FadeIn>
        <Intro
          title="Webinar & Podcast"
          intro="In our 2023 webinar we delved into the release of our new global, open-access datasets that aim to revolutionize nature accounting."
        >
          <ul className="grid grid-cols-3 gap-16">
            {DATA.map(({ index, title, description }) => (
              <li key={title} className="flex flex-col space-y-4">
                <div className="space-y-2">
                  <span className="text-orange-500 text-[56px] -tracking-[2%] font-black">
                    {index}
                  </span>
                  <h4 className="font-medium text-3xl">{title}</h4>
                </div>
                <p>{description}</p>
              </li>
            ))}
            <li key="webinar" className="flex flex-col space-y-4 bg-orange-500 p-[35px]">
              <p className="font-light">Watch our webinar on demand to learn more</p>
              <Link href="/webinar">
                <a className="underline space-x-5 font-bold flex items-center">
                  <span>Join us</span>
                  <Icon icon={ARROW_SVG} className="w-14 h-10" />
                </a>
              </Link>
            </li>
          </ul>
        </Intro>
      </FadeIn>
    </Wrapper>
  </section>
);

export default Webinar;
