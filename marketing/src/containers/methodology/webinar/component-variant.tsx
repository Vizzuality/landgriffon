import { FC } from 'react';

const Webinar: FC = () => (
  <div
    className="relative w-full max-w-[993px] min-h-[495px] space-y-12 py-12 px-14 mx-auto text-white bg-blue-900 bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: 'url(/images/methodology/webinar-bg.png)',
    }}
  >
    <div className="space-y-2">
      <div className="uppercase text-xl font-display font-black">Dataset release</div>
      <h2 className="uppercase text-3xl xl:text-[55px] leading-tight font-display font-black">
        5 New, <span className="bg-orange-500 text-blue-900">Open-Access Datasets</span>
        <br /> for carbon and nature
        <br /> accounting.
      </h2>
    </div>
    <div className="lg:flex justify-between items-end space-y-4">
      <div className="space-y-4">
        <p className="text-xl lg:text-2xl">
          Data aligned with SBTN,
          <br /> TNFD and GHG Protocol.
        </p>
      </div>
      <a
        href="https://bit.ly/3uxNHTp"
        className="font-semibold block w-[195px] h-[82px] flex items-center hover:cursor-pointer justify-center border-2 border-white"
      >
        Download data
      </a>
    </div>
  </div>
);

export default Webinar;
