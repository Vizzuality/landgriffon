import { FC } from 'react';

const Webinar: FC = () => (
  <div
    className="relative w-full max-w-[993px] min-h-[495px] space-y-12 py-12 px-14 mx-auto text-white bg-blue-900 bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: 'url(/images/methodology/webinar-bg.png)',
    }}
  >
    <div className="space-y-2">
      <div className="uppercase text-xl font-display font-black">Coming soon</div>
      <h2 className="uppercase text-3xl xl:text-[55px] leading-tight font-display font-black">
        5 New, <span className="bg-orange-500 text-blue-900">Open-Access Datasets</span>
        <br /> and our SBTN-Aligned
        <br /> Methodology.
      </h2>
    </div>
    <div className="lg-flex justify-between items-end space-y-4">
      <div className="space-y-4">
        <p className="text-xl lg:text-2xl">Join our webinar to find out more.</p>
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
);

export default Webinar;
