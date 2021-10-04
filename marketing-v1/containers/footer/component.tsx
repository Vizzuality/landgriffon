import React from "react";

import Image from "next/image";
import Link from "next/link";

import Wrapper from "containers/wrapper";

import SOCIAL_MEDIA from "./constants";

export const Footer = () => (
  <Wrapper>
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
      </nav>

      <div className="items-center justify-between mt-24 space-y-10 md:space-y-0 md:flex">
        <nav className="flex space-x-11">
          {SOCIAL_MEDIA.map((sm) => (
            <Link href={sm.hyperlink}>
              <a href={sm.hyperlink} target="_blank" rel="noreferrer">
                <Image
                  alt={sm.key}
                  className="text-black hover:opacity-60"
                  height={20}
                  width={20}
                  src={sm.icon}
                />
              </a>
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <Image
            alt="UE Flag"
            src="/images/footer/UE_flag.jpg"
            height={43}
            width={62}
          />
          <p className="w-56 pl-3 font-medium text-xxs">
            This project has received funding from the European Union&apos;s
            Horizon 2020 research and innovation programme under grant agreement
            No 101004174
          </p>
        </div>
      </div>
      <nav className="flex text-base mt-36 space-x-14">
        <p>@LandGriffon 2021</p>
        <Link href="https://landgriffon.com/privacy-policy">
          <a
            className="cursor-pointer hover:font-sans-semibold"
            href="https://landgriffon.com/privacy-policy"
          >
            <p>Privacy policy</p>
          </a>
        </Link>
      </nav>
    </footer>
  </Wrapper>
);

export default Footer;
