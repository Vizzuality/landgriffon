import React from 'react';

import Image from 'next/image';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

import VideoPlayer from 'components/video-player';

const HomeServices: React.FC = () => (
  <section id="services">
    <div className="py-28">
      <Wrapper>
        <h2 className="pb-12 text-xl md:text-5xl font-semibold text-green">Services</h2>
        <div className="flex flex-col items-center justify-between space-y-4 font-sans md:items-baseline xl:flex-row xl:space-y-0">
          <h3 className="text-5xl font-light md:text-6xl xl:w-4/6 lg:text-6xl xl:text-7xl">
            Measure and manage supply chain impacts.
          </h3>
          <p className="text-base md:text-lg xl:text-xl xl:w-2/6">
            LandGriffon is a powerful modeling tool backed by a team of experts to empower you to
            change your business for the better.
          </p>
        </div>
      </Wrapper>
    </div>
    <div className="bg-beige py-28">
      <Wrapper>
        <div className="relative flex flex-col justify-between w-full md:space-x-16 lg:space-x-10 xl:space-x-20 md:flex-row">
          <div className="w-full">
            <Media lessThan="md">
              <Image
                alt="plantation from the sky"
                height="381px"
                width="285px"
                src="/images/home/home-2.jpg"
              />
              <div
                style={{ height: 'auto', width: '85%', top: '13%' }}
                className="absolute right-0 overflow-hidden rounded-xl"
              >
                <VideoPlayer url="video/servicesLG.mp4" />
              </div>
            </Media>

            <Media at="md">
              <Image
                alt="plantation from the sky"
                height="812px"
                width="588px"
                src="/images/home/home-2.jpg"
              />
              <div
                style={{ height: '251px', width: '320px', top: '30%' }}
                className="absolute overflow-hidden left-10 rounded-xl"
              >
                <VideoPlayer url="video/servicesLG.mp4" />
              </div>
            </Media>

            <Media between={['lg', 'xl']}>
              <Image
                alt="plantation from the sky"
                height="942px"
                width="588px"
                src="/images/home/home-2.jpg"
              />
              <div
                style={{ height: '330px', width: '320px', top: '27%' }}
                className="absolute overflow-hidden left-10 lg:rounded-2xl xl:rounded-3xl"
              >
                <VideoPlayer url="video/servicesLG.mp4" />
              </div>
            </Media>

            <Media at="xl">
              <Image
                alt="plantation from the sky"
                height="942px"
                width="588px"
                src="/images/home/home-2.jpg"
              />
              <div
                style={{ borderRadius: '1.8rem', height: '504px', width: '640px', top: '25%' }}
                className="absolute overflow-hidden left-18"
              >
                <VideoPlayer url="video/servicesLG.mp4" />
              </div>
            </Media>

            <Media greaterThanOrEqual="2xl">
              <Image
                alt="plantation from the sky"
                height="942px"
                width="588px"
                src="/images/home/home-2.jpg"
              />
              <div
                style={{ borderRadius: '2rem', height: '581px', width: '740px', top: '25%' }}
                className="absolute overflow-hidden left-18"
              >
                <VideoPlayer url="video/servicesLG.mp4" />
              </div>
            </Media>
          </div>

          <nav className="flex flex-col self-center h-full space-y-10 pt-18 md:pt-0">
            <div className="border-b border-black">
              <a
                className="text-xl underline xl:text-5xl font-semibold hover:no-underline"
                href="/measure"
              >
                01 Measure
              </a>
              <p className="font-sans text-xl md:text-base lg:text-xl py-9 md:py-4 lg:py-9">
                Turn procurement data into accurate estimates of environmental impacts.
              </p>
            </div>
            <div className="border-b border-black">
              <a
                className="text-xl underline xl:text-5xl font-semibold hover:no-underline"
                href="/analyze"
              >
                02 Analyze
              </a>
              <p className="font-sans text-xl md:text-base lg:text-xl py-9 md:py-5 lg:py-9">
                Identify where your supply chain impacts are and uncover the key drivers.{' '}
              </p>
            </div>
            <div className="border-b border-black">
              <a
                className="text-xl underline xl:text-5xl font-semibold hover:no-underline"
                href="/forecast"
              >
                03 Forecast
              </a>
              <p className="font-sans text-xl md:text-base lg:text-xl py-9 md:py-5 lg:py-9">
                Prioritize areas for change and plot a path to sustainability.
              </p>
            </div>
          </nav>
        </div>
      </Wrapper>
    </div>
  </section>
);

export default HomeServices;
