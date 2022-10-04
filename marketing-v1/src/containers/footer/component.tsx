import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import Wrapper from 'containers/wrapper';

const Footer: React.FC = () => (
  <footer>
    <Wrapper>
      <div className="py-28">
        <nav>
          <ul className="space-y-10 md:space-y-16 font-heading-2">
            <li>
              <Link href="/about-us">
                <a className="hover:opacity-40">About Us</a>
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <a className="hover:opacity-40">Contact Us</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </Wrapper>
    <Wrapper>
      <div className="py-10 md:flex md:justify-between">
        <nav className="flex items-center mb-10 md:my-0 space-x-6 text-sm xl:text-base md:space-x-14">
          <span>&copy; LandGriffon 2021</span>
          <Link href="/privacy-policy">
            <a className="cursor-pointer hover:font-semibold">
              <p>Privacy policy</p>
            </a>
          </Link>
        </nav>
        <div className="flex items-center">
          <Image alt="UE Flag" src="/images/footer/UE_flag.jpg" height={43} width={62} />
          <span className="w-56 pl-3 font-medium text-ue">
            This project has received funding from the European Union&apos;s Horizon 2020 research
            and innovation programme under grant agreement No 101004174
          </span>
        </div>
      </div>
    </Wrapper>
  </footer>
);

export default Footer;
