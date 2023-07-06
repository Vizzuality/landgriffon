import Image from 'next/image';
import Link from 'next/link';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

const Regulations: React.FC = () => {
  return (
    <section className="relative hidden bg-white lg:block">
      <Wrapper>
        <div className="h-[400vh] relative py-12 border-t border-black/10">
          <div className="sticky top-0 flex items-center py-12 ">
            <div className="">
              <div className="space-y-10">
                <FadeIn>
                  <h2 className="w-5/12 text-4xl font-black uppercase md:text-6xl font-display">
                    Prepare for regulations.
                  </h2>
                </FadeIn>

                <FadeIn>
                  <div className="space-y-6">
                    <p className="text-2xl font-light leading-relaxed">
                      Regulators and sustainability leaders agree that location is essential. We are
                      participating in the SBTN & TNFD process to ensure our data analysis meets
                      their regulations and guidance.
                    </p>

                    <div className="grid grid-cols-2 gap-12 border-b border-gray-300 p-4 pb-10">
                      <div className="space-y-8">
                        <div>
                          <a
                            href="https://sciencebasedtargetsnetwork.org/"
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <Image
                              layout="intrinsic"
                              src="/images/methodology/regulations/SBTN.png"
                              alt="SBTN"
                              width={180}
                              height={100}
                            />
                          </a>
                        </div>

                        <ul className="font-bold">
                          <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                            The Science Based Targets Network gives companies and cities a clear
                            pathway to competitiveness and resilience by using science to define
                            their role in restoring nature.
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <a href="https://tnfd.global/" target="_blank" rel="noreferrer noopener">
                            <Image
                              layout="intrinsic"
                              src="/images/methodology/regulations/tnfd_logo.png"
                              alt="TNFD"
                              width={355}
                              height={100}
                            />
                          </a>
                        </div>

                        <ul className="font-bold">
                          <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                            The Taskforce on Nature-related Financial Disclosures develops and
                            delivers a risk management and disclosure framework for organisations to
                            report and act on evolving nature-related risks.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn>
                  <div className="space-y-8">
                    <p className="text-2xl font-light leading-relaxed">
                      LandGriffon supports you in meeting your Climate, Nature and SDG targets:
                    </p>

                    <div className="flex space-x-2 justify-start">
                      <div>
                        <Image
                          layout="intrinsic"
                          src="/images/methodology/regulations/SDG_06.png"
                          alt="SDG 06"
                          width={136}
                          height={136}
                        />
                      </div>

                      <div>
                        <Image
                          layout="intrinsic"
                          src="/images/methodology/regulations/SDG_08.png"
                          alt="SDG 08"
                          width={136}
                          height={136}
                        />
                      </div>

                      <div>
                        <Image
                          layout="intrinsic"
                          src="/images/methodology/regulations/SDG_12.png"
                          alt="SDG 12"
                          width={136}
                          height={136}
                        />
                      </div>

                      <div>
                        <Image
                          layout="intrinsic"
                          src="/images/methodology/regulations/SDG_13.png"
                          alt="SDG 13"
                          width={136}
                          height={136}
                        />
                      </div>

                      <div>
                        <Image
                          layout="intrinsic"
                          src="/images/methodology/regulations/SDG_14.png"
                          alt="SDG 14"
                          width={136}
                          height={136}
                        />
                      </div>

                      <div>
                        <Image
                          layout="intrinsic"
                          src="/images/methodology/regulations/SDG_15.png"
                          alt="SDG 15"
                          width={136}
                          height={136}
                        />
                      </div>
                    </div>

                    <p>
                      Want to know more about how we can help you align with emerging nature
                      standards and regulations?{' '}
                      <Link href="/contact">
                        <a className="underline font-bold">Contact us</a>
                      </Link>
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default Regulations;
