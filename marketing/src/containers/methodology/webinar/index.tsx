import { FC } from 'react';

import Wrapper from 'containers/wrapper';

import WebinarContent from './component';

const Webinar: FC = () => (
  <section className="bg-white" id="stay-up-to-date">
    <div className="relative z-20">
      <Wrapper>
        <WebinarContent />
      </Wrapper>
    </div>

    <div className="flex flex-col justify-end overflow-hidden relative z-10 aspect-[1440/580] -mt-80">
      <video src="/videos/earth.mp4" className="w-full aspect-auto" loop muted />
    </div>
  </section>
);

export default Webinar;
