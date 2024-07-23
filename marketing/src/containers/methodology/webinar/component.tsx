import { FC } from 'react';

const Webinar: FC = () => (
  <div
    className="relative w-full max-h-[520px] space-y-12 py-12 px-14 mx-auto text-white bg-blue-900 bg-cover bg-center bg-no-repeat overflow-auto"
    style={{
      backgroundImage: 'url(/images/methodology/webinar-bg.png)',
    }}
  >
    <div className="space-y-2">
      <div className="uppercase text-md md:text-xl font-display font-black">Webinar</div>
      <h2 className="uppercase text-xl md:text-3xl xl:text-[50px] leading-tight lg:leading-[1.1] font-display font-black">
        5 New, <span className="bg-orange-500 text-blue-900">Open-Access Datasets</span>
        <br /> and our SBTN-Aligned
        <br /> Methodology for carbon
        <br /> and nature accounting.
      </h2>
    </div>
    <div className="lg:flex justify-between items-end space-y-4">
      <div className="space-y-4">
        <div className="tex-lg md:text-xl lg:text-2xl">Watch our webinar on demand.</div>
      </div>
      <a
        href="https://bit.ly/3GbWOMa"
        className="font-semibold w-[195px] h-[82px] flex items-center hover:cursor-pointer justify-center border-2 border-white focus-visible:ring-0 focus-visible:outline-0"
      >
        Watch now
      </a>
    </div>
  </div>
);

export default Webinar;
