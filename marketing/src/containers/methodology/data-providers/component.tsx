import { FC } from 'react';
import Image from 'next/image';

import Wrapper from 'containers/wrapper';

const DataProviders: FC = () => {
  return (
    <section className="bg-white ">
      <Wrapper>
        <div className="space-y-5">
          <h3 className="text-xl font-black text-black uppercase font-display">
            BUILT ON TRUSTED SCIENTIFIC DATA:
          </h3>
          <p className="pb-3 text-2xl font-light">
            Landgriffon is built on open access data produced by leading researchers, NGOs, and
            government programs such as Copernicus, making it easier for you to take advantage of
            this scientific knowledge.
          </p>
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
                  width={120}
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
      </Wrapper>
    </section>
  );
};

export default DataProviders;
