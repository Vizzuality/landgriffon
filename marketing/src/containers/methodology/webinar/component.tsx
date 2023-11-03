import { FC } from 'react';

import Wrapper from 'containers/wrapper';

const Webinar: FC = () => {
  return (
    <section className="bg-white" id="stay-up-to-date">
      <div className="relative z-20">
        <Wrapper>
          <div
            className="relative max-w-[993px] h-[495px] space-y-12 py-12 px-14 mx-auto text-white bg-blue-900 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/methodology/webinar-bg.png)',
            }}
          >
            <div className="space-y-2">
              <div className="uppercase text-xl font-display font-black">Coming soon</div>
              <h2 className="uppercase text-[55px] leading-tight font-display font-black">
                5 New, <span className="bg-orange-500 text-blue-900">Open-Access Datasets</span>
                <br /> and our SBTN-Aligned
                <br /> Methodology.
              </h2>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-4">
                <p className="text-2xl">Join our webinar to find out more.</p>
                <div>
                  <strong>Date & Time:</strong> Tues 21st Nov | 3pm CEST | 9am ET
                </div>
              </div>
              <a
                href="https://us02web.zoom.us/webinar/register/3516986785955/WN_jrVPnHiySFKNXd1nDRPwNQ#/registration"
                className="font-semibold block w-[195px] h-[82px] flex items-center hover:cursor-pointer justify-center border-2 border-white"
              >
                Register now
              </a>
            </div>
          </div>
        </Wrapper>
      </div>

      <div className="flex flex-col justify-end overflow-hidden relative z-10 aspect-[1440/580] -mt-80">
        <video src="/videos/earth.mp4" className="w-full aspect-auto" loop muted />
      </div>
    </section>
  );
};

export default Webinar;
