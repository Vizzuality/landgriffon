import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Image from 'next/image';

const Developed: React.FC = () => {
  return (
    <section className="relative py-32 bg-white bg-cover">
      <Wrapper>
        <div className="space-y-10 md:space-y-20">
          <FadeIn>
            <div className="space-y-10">
              <h2 className="text-6xl font-black uppercase font-display">Powered by Vizzuality</h2>
              <p className="text-2xl font-light">
                Sustainable transformation requires whole systems thinking. That&apos;s why
                LandGriffon is made up of experts combining the disciplines of design, science,
                technology, sustainability, and business.
              </p>

              <p className="text-2xl font-light">
                <strong className="font-bold">
                  For over a decade,{' '}
                  <a
                    href="https://vizzuality.com"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vizzuality
                  </a>{' '}
                </strong>
                has helped companies access, understand, and easily use the data and recommendations
                of the sustainability community.
              </p>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="grid grid-cols-4 gap-x-20 gap-y-14 items-center">
              <div>
                <a href="https://www.google.com/" target="_blank" rel="noreferrer noopener">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/google_color.png"
                    alt="Google"
                    width={145.66}
                    height={84}
                  />
                </a>
              </div>
              <div>
                <a href="https://www.mars.com/" target="_blank" rel="noreferrer noopener">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/Mars.png"
                    alt="Mars"
                    width={111.69}
                    height={33}
                  />
                </a>
              </div>

              <div>
                <a
                  href="https://www.microsoft.com/es-es/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Image
                    layout="intrinsic"
                    src="/images/logos/Microsoft.png"
                    alt="Microsoft"
                    width={168.59}
                    height={36}
                  />
                </a>
              </div>

              <div>
                <a href="https://www.wri.org/" target="_blank" rel="noreferrer noopener">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/WRI.png"
                    alt="WRI"
                    width={157.12}
                    height={61}
                  />
                </a>
              </div>
              <div>
                <a href="https://www.worldwildlife.org/" target="_blank" rel="noreferrer noopener">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/WWF.png"
                    alt="WWD"
                    width={90}
                    height={97}
                  />
                </a>
              </div>

              <div>
                <a href="https://www.nasa.gov/" target="_blank" rel="noreferrer noopener">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/NASA_color.png"
                    alt="NASA"
                    width={104.86}
                    height={97}
                  />
                </a>
              </div>

              <div>
                <a href="https://www.esa.int/" target="_blank" rel="noreferrer noopener">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/ESA_logo.png"
                    alt="ESA"
                    width={145.6}
                    height={64}
                  />
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </Wrapper>
    </section>
  );
};

export default Developed;
