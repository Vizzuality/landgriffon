import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Image from 'next/image';

const ImpactBeyondCompliance: React.FC = () => {
  return (
    <section className="relative pt-12 pb-36 space-y-12 bg-blue-600 md:space-y-64 md:pt-36 md:pb-[320px]">
      <Wrapper>
        <div className="space-y-10 text-white md:space-y-20">
          <FadeIn>
            <h2 className="text-5xl font-black text-white uppercase font-display md:text-7xl">
              <span className="text-blue-500">Impact</span> beyond compliance
            </h2>
          </FadeIn>

          <FadeIn>
            <div className="space-y-12 relative text-2xl">
              <p>
                Sustainability leaders recognize that compliance for compliance&apos;s sake falls
                short of realizing the full potential for positive change. Embracing sustainability
                not only helps in tackling climate change and ecological challenges but also
                provides distinct business benefits such as innovative land management, biodiversity
                promotion, and efficient water usage.
              </p>

              <p>
                As investors increasingly prioritize sustainability, there&apos;s a clear financial
                advantage in adopting sustainable practices. Our platform, LandGriffon, provides
                smart and comprehensive data that enables businesses to make informed decisions,
                anticipate regulatory shifts, and gain a thorough understanding of sustainable risks
                and opportunities within their supply chains.
              </p>

              <p>
                Time to harness technology to develop holistic sustainability strategies and
                confidently showcase your company&apos;s impactful contributions to a better world. 
              </p>
            </div>
          </FadeIn>
        </div>
      </Wrapper>
      <div className="absolute bottom-0 left-0 w-1/2 h-80">
        <div className="w-full h-80 relative">
          <Image
            src="/images/compliance/waves.png"
            alt="Waves"
            layout="fill"
            className="absolute left-0 bottom-0 top-0"
          />
        </div>
      </div>
    </section>
  );
};

export default ImpactBeyondCompliance;
