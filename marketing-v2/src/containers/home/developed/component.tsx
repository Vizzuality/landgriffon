import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Image from 'next/image';

const Developed: React.FC = () => {
  return (
    <section
      className="relative py-32 bg-white bg-cover"
      style={{ backgroundImage: `url('/images/home/developed/image2_landing.jpg')` }}
    >
      <Wrapper>
        <div className="space-y-10 md:space-y-20">
          <FadeIn>
            <div className="space-y-10">
              <h3 className="text-2xl font-light text-white">
                Sustainable transformation requires whole systems thinking. That&apos;s why
                <strong className="font-semibold">
                  {' '}
                  LandGriffon is made up of a consortium of experts
                </strong>
                , combining the disciplines of design, science, technology, sustainability, and
                business.
              </h3>
              <h3 className="text-2xl font-light text-white">
                We help companies access, understand, and easily use the data and recommendations of
                the sustainability community. Together we can transform sustainable ambitions into
                action.
              </h3>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="flex flex-col justify-between space-y-5 md:items-end md:flex-row md:space-y-0">
              <div>
                <h4 className="text-xs font-light text-white uppercase">Developed by</h4>

                <div className="flex items-end mt-5 space-x-10">
                  <div>
                    <Image
                      className="inline-block"
                      width={130}
                      height={30}
                      src="/images/home/developed/vizzuality.png"
                      alt="Vizzuality"
                    />
                  </div>
                  <div>
                    <Image
                      className="inline-block"
                      width={185}
                      height={28}
                      src="/images/home/developed/satelligence.png"
                      alt="Satelligence"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-light text-white uppercase">Advised by</h4>

                <div className="flex items-end mt-5 space-x-10">
                  <div>
                    <Image
                      className="inline-block"
                      width={100}
                      height={41.8}
                      src="/images/home/developed/sei.png"
                      alt="SEI"
                    />
                  </div>
                  {/* <div>
                    <Image
                      className="inline-block"
                      width={180}
                      height={27}
                      src="/images/home/developed/trase.png"
                      alt="Trase"
                    />
                  </div> */}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Wrapper>
    </section>
  );
};

export default Developed;
