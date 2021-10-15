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
        <div className="grid md:grid-cols-3 gap-10">
          <p className="text-5xl font-light md:text-6xl lg:text-6xl xl:text-7xl col-span-2">
            Measure and manage supply chain impacts.
          </p>
          <p className="text-base md:text-lg xl:text-xl col-span-1 flex items-center">
            LandGriffon is a powerful modeling tool backed by a team of experts to empower you to
            change your business for the better.
          </p>
        </div>
      </Wrapper>
    </div>
    <div className="bg-beige py-28">
      <Wrapper>
        <div className="relative grid md:grid-cols-3 gap-10">
          <div className="col-span-2">
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

          <nav className="self-center space-y-10">
            <div className="border-b border-black">
              <h3>
                <a
                  className="text-xl underline xl:text-5xl font-semibold hover:no-underline"
                  href="/services/measure"
                >
                  01 Measure
                </a>
              </h3>
              <p className="font-sans text-xl md:text-base lg:text-xl py-9 md:py-4 lg:py-9">
                Turn procurement data into accurate estimates of environmental impacts.
              </p>
            </div>
            <div className="border-b border-black">
              <h3>
                <a
                  className="text-xl underline xl:text-5xl font-semibold hover:no-underline"
                  href="/services/analyze"
                >
                  02 Analyze
                </a>
              </h3>
              <p className="font-sans text-xl md:text-base lg:text-xl py-9 md:py-5 lg:py-9">
                Identify where your supply chain impacts are and uncover the key drivers.{' '}
              </p>
            </div>
            <div className="border-b border-black">
              <h3>
                <a
                  className="text-xl underline xl:text-5xl font-semibold hover:no-underline"
                  href="/services/forecast"
                >
                  03 Forecast
                </a>
              </h3>
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
