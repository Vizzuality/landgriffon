import Link from 'next/link';

import Icon from 'components/icon';

import Wrapper from 'containers/wrapper';

import TWITTER_SVG from 'svgs/social/twitter.svg?sprite';
import LINKEDIN_SVG from 'svgs/social/linkedin.svg?sprite';
import MEDIUM_SVG from 'svgs/social/medium.svg?sprite';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white ">
      <Wrapper>
        <nav className="py-12 md:py-32">
          <ul className="flex flex-col">
            <li>
              <Link href="/about">
                <a className="text-5xl font-black uppercase font-display md:text-7xl lg:text-9xl">
                  About us
                </a>
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <a className="text-5xl font-black uppercase font-display md:text-7xl lg:text-9xl">
                  Contact us
                </a>
              </Link>
            </li>
            <li>
              <a
                href="https://medium.com/vizzuality-blog/tagged/sustainable-supply-chain"
                target="_blank"
                rel="noopener noreferrer"
                className="text-5xl font-black uppercase font-display md:text-7xl lg:text-9xl"
              >
                Blog
              </a>
            </li>
          </ul>
        </nav>
      </Wrapper>

      <Wrapper>
        <div className="pb-6 space-y-5 md:flex md:justify-between md:pb-32 md:space-y-0">
          <ul className="flex items-center justify-start space-x-10">
            <li>
              <a href="https://twitter.com/LandGriffon_" target="_blank" rel="noreferrer noopener">
                <Icon icon={TWITTER_SVG} className="w-5 h-5 fill-black" />
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/company/landgriffon/ "
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon icon={LINKEDIN_SVG} className="w-5 h-5 fill-black" />
              </a>
            </li>
            <li>
              <a
                href="https://medium.com/vizzuality-blog/tagged/sustainable-supply-chain"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon icon={MEDIUM_SVG} className="w-5 h-5 fill-black" />
              </a>
            </li>
          </ul>
          <div>
            <Image width={299} height={48} alt="EU" src="/images/footer/eu_logo.png" />
          </div>
        </div>
      </Wrapper>

      <div className="border-t border-black py-2.5">
        <Wrapper>
          <div className="flex space-x-5">
            <p>@LandGriffon 2021</p>
            <Link href="/privacy-policy">Privacy policy</Link>
          </div>
        </Wrapper>
      </div>
    </footer>
  );
};

export default Footer;
