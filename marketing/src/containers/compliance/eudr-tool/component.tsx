import Image from 'next/image';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

import { EUDRToolFeatures1, EUDRToolFeatures2 } from './constants';

const Card = ({ index, title, description }) => (
  <div className="space-y-2">
    <span className="text-6xl font-bold text-blue-500 -tracking-[0.02em]">{index}</span>
    <div className="space-y-4">
      <h3 className="text-3xl font-bold text-white font-display">{title}</h3>
      <p className="text-white">{description}</p>
    </div>
  </div>
);

const EUDRTool: React.FC = () => {
  return (
    <section className="relative py-12 bg-blue-600 bg-cover md:space-y-64">
      <Wrapper>
        <div className="space-y-12 text-white md:space-y-20 md:py-32 py-12">
          <FadeIn>
            <h2 className="text-5xl font-black text-white uppercase max-w-3xl font-display md:text-7xl">
              With our EUDR tool,<span className="text-blue-500 block">you can </span>
            </h2>
          </FadeIn>

          <FadeIn>
            <div className="md:grid md:grid-cols-3 w-full md:gap-x-14 flex flex-col space-y-14 md:space-y-0">
              {EUDRToolFeatures1.map((feature) => (
                <Card key={feature.title} {...feature} />
              ))}
            </div>
          </FadeIn>

          <FadeIn>
            <div className="w-full space-y-4 md:py-16">
              <div className="relative max-w-3xl">
                <Image
                  width={728}
                  height={410}
                  layout="responsive"
                  src="/images/compliance/eudr_tool.png"
                  alt="EUDR Tool"
                />
                <div className="md:absolute md:top-0 md:right-0 md:transform md:translate-x-1/2 md:translate-y-1/2">
                  <Image
                    width={443}
                    height={221}
                    src="/images/compliance/eudr_tool_country.png"
                    alt="EUDR Tool Countries view"
                  />
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="md:grid md:grid-cols-3 w-full md:gap-x-14 flex flex-col space-y-14 md:space-y-0">
              {EUDRToolFeatures2.map((feature) => (
                <Card key={feature.title} {...feature} />
              ))}
            </div>
          </FadeIn>

          <FadeIn>
            <p className="text-2xl pb-20">
              You can use our EUDR tool by itself, or go further in nature impact assessment by
              using the entire LandGriffon offering. Utilize full features to align with broader
              nature standards and requirements in biodiversity, water and land use, such as CSRD,
              ESRS, SEC Climate, SBTN, TNFD and the evolving landscape of ESG regulations that these
              standards will inform.
            </p>
          </FadeIn>
        </div>
      </Wrapper>
    </section>
  );
};

export default EUDRTool;
