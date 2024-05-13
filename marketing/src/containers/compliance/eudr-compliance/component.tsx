import Image from 'next/image';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

const EUDRCompliance: React.FC = () => {
  return (
    <section className="relative bg-white">
      <Wrapper>
        <div className="relative py-12 border-t border-black/10">
          <div className="flex items-center py-12 ">
            <div className="space-y-10">
              <FadeIn>
                <h2 className="w-5/12 text-4xl font-black uppercase md:text-6xl font-display">
                  UDR Compliance.
                </h2>
              </FadeIn>

              <FadeIn>
                <div className="space-y-6">
                  <p className="text-2xl font-light leading-relaxed">
                    <a
                      href="https://www.vizzuality.com/"
                      rel="noopener noreferrer"
                      target="_blank"
                      className="underline"
                    >
                      Vizzuality
                    </a>{' '}
                    partnered our LandGriffon tool with CARTO to leverage the power of BigQuery and
                    Google Earth Engine for a LandGriffon section specific to European Union
                    Deforestation Regulation (EUDR) assessment and compliance. Built on the
                    <a
                      href="https://www.fao.org/fileadmin/user_upload/faoweb/NFM/WhispOverview.pdf"
                      rel="noopener noreferrer"
                      target="_blank"
                      className="underline"
                    >
                      {' '}
                      WHISP
                    </a>{' '}
                    methodology from Forest Data Partnership and FAO, and verified using
                    high-resolution satellite imagery, our tool ensures accuracy and reliability in
                    deforestation assessmen and decision-making..
                  </p>

                  <div className="w-full">
                    <div className="space-y-5">
                      <h4 className="text-xs">Base data from:</h4>

                      <ul className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-20 lg:gap-20">
                        <li className="flex items-center justify-center">
                          <a href="https://www.esa.int/" target="_blank" rel="noopener noreferrer">
                            <Image
                              layout="intrinsic"
                              priority
                              src="/images/logos/ESA_logo.png"
                              alt="ESA"
                              width={160}
                              height={58.07}
                            />
                          </a>
                        </li>
                        <li className="flex items-center justify-center">
                          <a
                            href="https://www.wur.nl/en/education-programmes/wageningen-university.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              layout="intrinsic"
                              priority
                              src="/images/logos/wur_logo.png"
                              alt="Wageningen University & Reseacrh"
                              width={228}
                              height={80}
                            />
                          </a>
                        </li>
                        <li className="flex items-center justify-center">
                          <a
                            href="https://www.globalforestwatch.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              layout="intrinsic"
                              priority
                              src="/images/logos/gfw.png"
                              alt="GFW"
                              width={120}
                              height={122}
                            />
                          </a>
                        </li>
                        <li className="flex items-center justify-center">
                          <a
                            href="https://www.fao.org/faostat/en/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              layout="intrinsic"
                              priority
                              src="/images/logos/FAO.png"
                              alt="FAO"
                              width={120}
                              height={122.5}
                            />
                          </a>
                        </li>

                        <li className="flex items-center justify-center">
                          <a
                            href="https://www.unep-wcmc.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              layout="intrinsic"
                              priority
                              src="/images/logos/WCMC_logo.png"
                              alt="World Conservation Monitoring Centre"
                              width={120}
                              height={122.5}
                            />
                          </a>
                        </li>
                        <li className="flex items-center justify-center">
                          <a href="https://glad.umd.edu/" target="_blank" rel="noopener noreferrer">
                            <Image
                              layout="intrinsic"
                              priority
                              src="/images/logos/GLAD_logo.png"
                              alt="GLAD | Global Land Analysis & Discovery"
                              width={214}
                              height={49}
                            />
                          </a>
                        </li>
                        <li className="flex items-center justify-center">
                          <a
                            href="https://www.forestdatapartnership.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              layout="intrinsic"
                              priority
                              src="/images/logos/Forest_Data_Partnership_logo.png"
                              alt="Forest data Partnership"
                              width={175}
                              height={49}
                            />
                          </a>
                        </li>
                        <li className="flex items-center justify-center">
                          <a
                            href="https://www.forestdatapartnership.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              layout="intrinsic"
                              priority
                              src="/images/logos/JRC_logo.png"
                              alt="Forest data Partnership"
                              width={151}
                              height={68}
                            />
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default EUDRCompliance;
