import { FC } from 'react';
import Image from 'next/image';

import Wrapper from 'containers/wrapper';

const DataProviders: FC = () => {
  return (
    <section className="bg-white ">
      <Wrapper>
        <div className="space-y-10">
          <div className="space-y-5">
            <h3 className="text-xl font-black text-black uppercase font-display">
              BUILT ON TRUSTED SCIENTIFIC DATA:
            </h3>
            <p className="pb-3 text-2xl font-light">
              Landgriffon is built on open-access data produced by leading researchers, NGOs, and
              government programs such as Copernicus, making it easier for you to take advantage of
              this scientific knowledge.
            </p>

            <ul className="space-y-5 font-light">
              <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                <p className="font-semibold">Forest loss & Land Carbon:</p>
                <p>
                  <a href="https://land.copernicus.eu/" target="_blank" rel="noreferrer noopener">
                    Copernicus
                  </a>
                  ,{' '}
                  <a
                    href="https://satelligence.com/solutions"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Satelligence
                  </a>
                  ,{' '}
                  <a
                    href="https://www.globalforestwatch.org/map/?map=eyJkYXRhc2V0cyI6W3siZGF0YXNldCI6InRyZWUtY292ZXItbG9zcyIsIm9wYWNpdHkiOjEsInZpc2liaWxpdHkiOnRydWUsImxheWVycyI6WyJ0cmVlLWNvdmVyLWxvc3MiXX0seyJkYXRhc2V0IjoicG9saXRpY2FsLWJvdW5kYXJpZXMiLCJsYXllcnMiOlsiZGlzcHV0ZWQtcG9saXRpY2FsLWJvdW5kYXJpZXMiLCJwb2xpdGljYWwtYm91bmRhcmllcyJdLCJvcGFjaXR5IjoxLCJ2aXNpYmlsaXR5Ijp0cnVlfV19&mapMenu=eyJtZW51U2VjdGlvbiI6ImRhdGFzZXRzIiwiZGF0YXNldENhdGVnb3J5IjoiZm9yZXN0Q2hhbmdlIn0%3D"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Global Forest Watch
                  </a>
                </p>
              </li>
            </ul>

            <ul className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-20 lg:grid-cols-5 lg:gap-20">
              <li className="flex items-center justify-center">
                <a
                  href="https://land.copernicus.eu/global/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    layout="intrinsic"
                    src="/images/logos/copernicus_logo.png"
                    alt="GFW"
                    width={133}
                    height={32}
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
                    src="/images/logos/gfw.png"
                    alt="GFW"
                    width={62}
                    height={62}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a
                  href="https://www.worldwildlife.org/pages/conservation-science-data-and-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    layout="intrinsic"
                    src="/images/logos/WWF.png"
                    alt="WWF"
                    width={43}
                    height={62}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a href="https://satelligence.com/" target="_blank" rel="noopener noreferrer">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/satelligence.png"
                    alt="satelligence"
                    width={198}
                    height={29}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a href="https://www.wri.org/" target="_blank" rel="noopener noreferrer">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/WRI.png"
                    alt="WRI"
                    width={186}
                    height={72}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a href="https://waterfootprint.org/en/" target="_blank" rel="noopener noreferrer">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/water-footprint-network.png"
                    alt="water-footprint-network"
                    width={111}
                    height={50}
                  />
                </a>
              </li>

              <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                <p className="font-semibold">Forest loss:</p>
                <p>Satelligence, Global Forest Watch</p>
              </li>
              <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                <p className="font-semibold">Biodiversity:</p>
                <p>
                  <a
                    href="https://www.worldwildlife.org/pages/conservation-science-data-and-tools"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    WWF Eco
                  </a>
                  ,{' '}
                  <a
                    href="https://www.ibat-alliance.org/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    IBAT
                  </a>
                </p>
              </li>
              <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                <p className="font-semibold">Water:</p>
                <p>
                  <a href="https://www.wri.org/aqueduct" target="_blank" rel="noreferrer noopener">
                    Aqueduct
                  </a>
                  ,{' '}
                  <a
                    href="https://waterfootprint.org/en/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Water Footprint Network
                  </a>
                </p>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="text-xl font-semibold">LandGriffon is designed to meet your needs</h4>

            <ul className="space-y-5 font-light">
              <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                <p>
                  Measure water, land, deforestation, and biodiversity with included open data
                  sources.
                </p>
              </li>

              <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                <p>
                  Bring in any data source or API: spatial, non-spatial, financial, social, or
                  otherwise.
                </p>
              </li>

              <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
                <p>Work with us to design custom metrics to meet specific needs or targets.</p>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="text-xs uppercase">Data providers:</h4>

            <ul className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-20 lg:grid-cols-5 lg:gap-20">
              <li className="flex items-center justify-center">
                <a
                  href="https://land.copernicus.eu/global/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    layout="intrinsic"
                    src="/images/logos/copernicus_logo.png"
                    alt="copernicus"
                    width={145.39}
                    height={62}
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
                    src="/images/logos/gfw.png"
                    alt="GFW"
                    width={62}
                    height={62}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a
                  href="https://www.ibat-alliance.org/?locale=en"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    layout="intrinsic"
                    src="/images/logos/IBAT.png"
                    alt="IBAT"
                    width={93}
                    height={62}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a
                  href="https://www.worldwildlife.org/pages/conservation-science-data-and-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    layout="intrinsic"
                    src="/images/logos/WWF.png"
                    alt="WWF"
                    width={51.67}
                    height={62}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a href="https://satelligence.com/" target="_blank" rel="noopener noreferrer">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/satelligence.png"
                    alt="satelligence"
                    width={198}
                    height={29}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a href="https://www.wri.org/" target="_blank" rel="noopener noreferrer">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/WRI.png"
                    alt="WRI"
                    width={178}
                    height={62}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a href="https://waterfootprint.org/en/" target="_blank" rel="noopener noreferrer">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/water-footprint-network.png"
                    alt="water-footprint-network"
                    width={111}
                    height={50}
                  />
                </a>
              </li>

              <li className="flex items-center justify-center">
                <a href="https://www.mapspam.info/" target="_blank" rel="noopener noreferrer">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/mapspam.png"
                    alt="mapspam"
                    width={113}
                    height={31}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a href="https://www.fao.org/faostat/en/" target="_blank" rel="noopener noreferrer">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/FAO.png"
                    alt="FAO"
                    width={62}
                    height={63}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a href="https://www.wri.org/aqueduct" target="_blank" rel="noopener noreferrer">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/aqueduct.png"
                    alt="aqueduct"
                    width={166}
                    height={34}
                  />
                </a>
              </li>
              <li className="flex items-center justify-center">
                <a href="http://www.earthstat.org/" target="_blank" rel="noopener noreferrer">
                  <Image
                    layout="intrinsic"
                    src="/images/logos/earthstat.png"
                    alt="earthstat"
                    width={149}
                    height={37}
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default DataProviders;
