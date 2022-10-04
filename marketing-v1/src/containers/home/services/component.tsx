import React from 'react';

import Wrapper from 'containers/wrapper';

import AnimationPlayer from 'components/animation-player';

import animationData from './animation.json';

const HomeServices: React.FC = () => (
  <section id="services">
    <div className="py-28">
      <Wrapper>
        <h2 className="pb-12 font-heading-4 font-semibold text-green">Services</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <p className="font-heading-2 col-span-2">Measure and manage supply chain impacts.</p>
          <p className="col-span-1 flex items-center">
            LandGriffon is a powerful modeling tool backed by a team of experts to empower you to
            change your business for the better.
          </p>
        </div>
      </Wrapper>
    </div>
    <div className="bg-beige py-28">
      <Wrapper>
        <div className="relative grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7">
            <div>
              <AnimationPlayer animationData={animationData} loop />
            </div>
          </div>

          <nav className="md:col-span-4 md:col-start-9 self-center space-y-10">
            <div className="border-b border-black">
              <h3>
                <a
                  className="font-heading-4 font-semibold underline hover:no-underline"
                  href="/services/measure"
                >
                  01 Measure
                </a>
              </h3>
              <p className="py-9 md:py-4 lg:py-9">
                Turn procurement data into accurate estimates of environmental impacts.
              </p>
            </div>
            <div className="border-b border-black">
              <h3>
                <a
                  className="font-heading-4 font-semibold underline hover:no-underline"
                  href="/services/analyze"
                >
                  02 Analyze
                </a>
              </h3>
              <p className="py-9 md:py-5 lg:py-9">
                Identify where your supply chain impacts are and uncover the key drivers.{' '}
              </p>
            </div>
            <div className="border-b border-black">
              <h3>
                <a
                  className="font-heading-4 font-semibold underline hover:no-underline"
                  href="/services/forecast"
                >
                  03 Forecast
                </a>
              </h3>
              <p className="py-9 md:py-5 lg:py-9">
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
