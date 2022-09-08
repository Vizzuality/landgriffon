import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

import Icon from 'components/icon';

import ARROW_TOP_RIGHT_SVG from 'svgs/ui/arrow-top-right.svg?sprite';
import Image from 'next/image';

const Rason: React.FC = () => {
  return (
    <section className="relative py-12 space-y-12 bg-blue-600 bg-cover md:space-y-64 md:py-64">
      <Wrapper>
        <div className="space-y-10 text-white md:space-y-20">
          <FadeIn>
            <h2 className="text-5xl font-black text-white uppercase font-display md:text-7xl">
              Sustainability is <span className="text-orange-500">more than a buzzword. </span>
            </h2>
          </FadeIn>
          <FadeIn>
            <p className="text-2xl font-light leading-relaxed">
              We urgently need to move towards a zero-carbon and nature positive future. LandGriffon
              is one part of a much wider sustainable revolution.
            </p>
          </FadeIn>
          <FadeIn>
            <div className="flex flex-col space-y-10 lg:flex-row lg:justify-between lg:space-x-20 lg:space-y-0">
              <div className="w-full">
                <p className="text-2xl font-light leading-relaxed">
                  The world needs innovation, prioritization and action across the spectrum, from
                  NGOs to corporates, farmers to consumers.
                </p>
              </div>

              <div className="w-full space-y-5">
                <p className="font-bold">
                  As a community, we aim to transform agricultural supply chains to achieve:{' '}
                </p>

                <ul className="space-y-5 font-light">
                  <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                    Sector wide net zero GHG emissions.
                  </li>
                  <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                    Biodiversity preservation.
                  </li>
                  <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                    Deforestation and conversion free supply chains.
                  </li>
                  <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                    Sustainable use of freshwater resources.
                  </li>
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </Wrapper>

      <Wrapper>
        <div className="space-y-10 text-white md:space-y-20">
          <FadeIn>
            <h2 className="text-5xl font-black text-white uppercase font-display md:text-7xl">
              The LandGriffon ecosystem:
              <span className="text-blue-500"> a consortium of experts. </span>
            </h2>
          </FadeIn>
          <FadeIn>
            <p className="inline-block text-2xl font-bold leading-relaxed text-black bg-blue-500 px-2.5 -mx-2.5 mb-5">
              We combine design, science, technology, sustainability, and business.
            </p>
            <p className="text-2xl font-light leading-relaxed">
              LandGriffon builds on our expertise in environmental data, user-centric design, and
              artificial intelligence-based satellite monitoring. We help companies access,
              understand, and efficiently use the data and recommendations of the sustainability
              community. Together we can transform sustainable ambitions into action.
              <strong className="font-bold">
                Together we can transform sustainable ambitions into action.
              </strong>
            </p>
          </FadeIn>
        </div>
      </Wrapper>

      <Wrapper>
        <div className="space-y-20 text-white md:space-y-32">
          <FadeIn>
            <div className="space-y-10">
              <h3 className="text-2xl font-bold text-white">Vizzuality</h3>
              <p className="text-xl font-light">
                Vizzuality is a change-driven design and technology agency creating bespoke,
                science-based data visualizations and digital tools that inspire learning, catalyze
                decisions and improve our world.
              </p>
              <p className="text-xl font-light">
                We work together with proactive organizations to create a better future for our
                planet and society. We have over 10 years of experience working with world-changing
                organizations building platforms like Global Forest Watch, Aqueduct and Trase.
              </p>
              <p>
                <a
                  href="https://www.vizzuality.com/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex text-xl justify-center items-center space-x-2.5 text-orange-500"
                >
                  <span>Discover Vizzuality</span>
                  <Icon icon={ARROW_TOP_RIGHT_SVG} className="w-3 h-3" />
                </a>
              </p>
              <ul className="grid grid-cols-2 gap-10 xs:grid-cols-3 md:grid-cols-5">
                <li>
                  <a href="https://www.sei.org/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/sei-logo.png"
                      alt="SEI"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a href="https://www.un.org/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/UN_logo.png"
                      alt="UN"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a href="https://www.nasa.gov/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/nasa_logo.png"
                      alt="NASA"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a href="https://www.google.com/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/Google_logo.png"
                      alt="Google"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a href="https://www.wri.org/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/WRI_logo.png"
                      alt="WRI"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
              </ul>
            </div>
          </FadeIn>
          <FadeIn>
            <div className="space-y-10">
              <h3 className="text-2xl font-bold text-white">Satelligence</h3>
              <p className="text-xl font-light">
                Satelligience is a remote sensing company on a mission to protect the planet and
                businesses from risk by helping their clients achieve net-zero supply chains.
              </p>
              <p className="text-xl font-light">
                We do this by providing realistic information about what’s happening on our planet,
                from space. Our team combines local knowledge, field trips, AI-powered predictive
                modeling and remote sensing to monitor what’s happening on the ground. We monitor
                change in real-time and alert to risks swiftly.
              </p>
              <p>
                <a
                  href="https://satelligence.com/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex text-xl justify-center items-center space-x-2.5 text-orange-500"
                >
                  <span>Discover Satelligence</span>
                  <Icon icon={ARROW_TOP_RIGHT_SVG} className="w-3 h-3" />
                </a>
              </p>

              <ul className="grid grid-cols-2 gap-10 xs:grid-cols-3 md:grid-cols-5">
                <li>
                  <a href="https://www.olamgroup.com/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/OLAM_logo.png"
                      alt="OLAM"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.mondelezinternational.com/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Image
                      layout="intrinsic"
                      src="/images/logos/Mondelez_logo.png"
                      alt="Mondelez"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a href="https://www.bmw.com/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/BMW_logo.png"
                      alt="BMW"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a href="https://tonyschocolonely.com/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/Tony_s_logo.png"
                      alt="Tony's"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
                <li>
                  <a href="https://www.bunge.com/" target="_blank" rel="noreferrer noopener">
                    <Image
                      layout="intrinsic"
                      src="/images/logos/Bunge_logo.png"
                      alt="Bunge"
                      width={338}
                      height={338}
                    />
                  </a>
                </li>
              </ul>
            </div>
          </FadeIn>
        </div>
      </Wrapper>

      <div>
        <div className="pt-12 border-t md:pt-32 md:-mt-32 border-white/10">
          <Wrapper>
            <div className="space-y-32 text-white md:space-y-32">
              <FadeIn>
                <div className="flex flex-col space-y-10 lg:flex-row lg:justify-between lg:space-x-20 lg:space-y-0">
                  <div className="w-full space-y-5">
                    <h4 className="relative font-bold pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                      Stockholm Environment Institute (SEI)
                    </h4>
                    <p className="pl-5">
                      SEI are an international non-profit research and policy organization that
                      tackles environment and development challenges. We connect science and
                      decision-making to develop solutions for a sustainable future for all.
                    </p>
                    <p className="pl-5">
                      Our work spans climate, water, air and land-use issues, governance, the
                      economy, gender and health. Stakeholder involvement is at the heart of our
                      efforts to build capacity, strengthen institutions and equip partners for
                      long-term change.
                    </p>

                    <div className="pl-5">
                      <a
                        href="https://www.sei.org/"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex text-xl justify-center items-center space-x-2.5 text-orange-500"
                      >
                        <span>Discover SEI</span>
                        <Icon icon={ARROW_TOP_RIGHT_SVG} className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="w-full space-y-5">
                    <h4 className="relative font-bold pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-white">
                      Kickstarted by the European Commission
                    </h4>
                    <p className="pl-5">
                      The sustainable business market is expanding rapidly as regulators and
                      consumers pressure businesses to account for the impacts of their operations.
                    </p>
                    <p className="pl-5">
                      To encourage the development at the pace needed, the European Commission
                      granted the LandGriffon consortium US$2 million from the Horizon 2020 research
                      and innovation programme to develop tools to assist food industry companies to
                      manage environmental impacts and risks in their supply chains.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </Wrapper>
        </div>
      </div>
    </section>
  );
};

export default Rason;
