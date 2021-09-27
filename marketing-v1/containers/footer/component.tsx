import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import FACEBOOK_SVG from 'svgs/social-media/facebook.svg';
import LINKEDIN_SVG from 'svgs/social-media/linkedin.svg';
import MEDIUM_SVG from 'svgs/social-media/medium.svg';
import TWITTER_SVG from 'svgs/social-media/twitter.svg';

export const Footer = () => (
  <footer className="w-full row-auto pb-12 md:px-16 pt-28">
    <nav className="relative flex flex-col flex-wrap justify-between mb-16 space-y-6 font-sans text-6xl cursor-pointer md:space-y-14 items-left md:text-7xl md:mt-0 navbar-expand-lg">
      <Link href="/about-us">
        <p className="hover:opacity-40">About Us</p>
      </Link>
      <Link href="https://landgriffon.com/">
        <a
          className="hover:opacity-40"
          target="_blank"
          href="https://landgriffon.com"
          rel="noreferrer"
        >
          Contact Us
        </a>
      </Link>
      <Link href="/">
        <p className="hover:opacity-40">Blog</p>
      </Link>
    </nav>

    <div className="items-center justify-between mt-10 space-y-10 md:space-y-0 md:flex">
      <nav className="flex space-x-11">
        <Link href="https://twitter.com/vizzuality">
          <Image alt="twitter" className="text-black" height={20} width={20} src={TWITTER_SVG} />
        </Link>
        <Link href="https://www.facebook.com/vizzuality">
          <Image alt="twitter" className="text-black" height={20} width={20} src={FACEBOOK_SVG} />
        </Link>
        <Link href="https://www.linkedin.com/company/vizzuality">
          <Image alt="twitter" className="text-black" height={20} width={20} src={LINKEDIN_SVG} />
        </Link>
        <Link href="https://medium.com/vizzuality-blog">
          <Image alt="twitter" className="text-black" height={20} width={20} src={MEDIUM_SVG} />
        </Link>
      </nav>

      <div className="flex">
        <Image alt="UE Flag" src="/images/footer/UE_flag.jpg" height="43px" width="62px" />
        <p className="w-56 pl-3 font-medium text-xxs">
          This project has received funding from the European Union&apos;s Horizon 2020 research and
          innovation programme under grant agreement No 101004174
        </p>
      </div>
    </div>
    <nav className="flex text-base mt-28 space-x-14">
      <p>@LandGriffon 2021</p>
      <Link href="https://landgriffon.com/privacy-policy">
        <a
          className="cursor-pointer hover:font-semibold"
          href="https://landgriffon.com/privacy-policy"
        >
          <p>Privacy policy</p>
        </a>
      </Link>
    </nav>
  </footer>
);

export default Footer;
