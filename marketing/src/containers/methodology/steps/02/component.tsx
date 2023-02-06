import cx from 'classnames';
import Image from 'next/image';

const Step02: React.FC = () => {
  // const { isOpen: isMethodologyFormModalOpen, close: closeMethodologyFormModal } = useModal();

  return (
    <article
      className={cx({
        'flex flex-col lg:flex-row-reverse justify-between space-y-10 lg:space-x-20 lg:space-x-reverse lg:space-y-0':
          true,
      })}
    >
      <div className="w-full space-y-10">
        <header className="relative">
          <div className="relative z-10 space-y-5">
            <h3 className="font-black md:leading-[100px] uppercase text-7xl md:text-9xl font-display">
              Land- scape level
            </h3>
          </div>
        </header>

        <div className="max-w-sm space-y-5">
          <p className="text-xl">
            Landscape level indicators include impacts resulting from the conversion of natural
            ecosystems to productive agriculture.
          </p>
          <p className="text-xl">
            As direct attribution of ecosystem conversion is difficult to track at large scales,
            landscape level indicators are measured as an indirect risk of land conversion that
            occurs within 50 km of a supplier aggregation point (e.g. Silo, Mill) or within a
            weighted 50 km buffer around commodity agricultural areas within the jurisdiction you
            source from.
          </p>
        </div>

        {/* <div
          className="relative h-56 pt-5 pl-5 overflow-hidden text-white bg-blue-400 cursor-pointer group w-96"
          onClick={openMethodologyFormModal}
        >
          <div className="absolute bottom-0 right-5 w-[125px] pointer-events-none">
            <div
              className="rounded-lg absolute -bottom-12 left-0 w-[125px] h-[177px] z-10 bg-contain transform group-hover:-translate-y-2 transition duration-500 ease-in-out"
              style={{
                backgroundImage: `url('/images/methodology/methodology_front.png')`,
              }}
            />
            <div
              className="rounded-lg absolute -bottom-14 left-2 w-[125px] h-[177px] z-0 bg-contain transform group-hover:translate-y-2 group-hover:translate-x-1 transition duration-500 ease-in-out"
              style={{
                backgroundImage: `url('/images/methodology/methodology_front.png')`,
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full rounded-lg bg-blue-900/80"></div>
            </div>
          </div>
          <div className="absolute flex items-center justify-center w-10 h-10 transition-colors bg-white rounded-full top-3 right-3 group-hover:bg-orange-500 group-hover:border group-hover:border-white ">
            <Icon icon={DOWNLOAD_SVG} className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <p className="text-blue-600">Download our methodology</p>
            <p className="w-2/4 text-2xl font-bold text-blue-600">
              Learn more about our science-based approach
            </p>
          </div>
        </div> */}

        {/* <Modal
          size="wide"
          open={isMethodologyFormModalOpen}
          onDismiss={closeMethodologyFormModal}
          dismissable
        >
          <MethodologyForm />
        </Modal> */}
      </div>

      <div className="w-full space-y-20">
        <div className="space-y-10">
          <div className="border-2 border-white shadow-2xl">
            <Image
              layout="responsive"
              src="/images/home/what/screen_1.jpg"
              width={966}
              height={433}
              alt="Farm level"
            />
          </div>

          <ul className="space-y-5 font-light">
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Deforestation.</p>
              <p>
                Hectares of forest loss within 50km of sourcing regions scaled by land use impact.
              </p>
              <p>Source: Satelligence, Global Forest Watch, land use.</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Biodiversity.</p>
              <p>
                Hectares of high biodiversity habitat converted within 50km of sourcing regions.
              </p>
              <p>Source: WWF, deforestation.</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Land carbon.</p>
              <p>Tons of carbon associated with forest loss within 50km of sourcing regions.</p>
              <p>Source: Satelligence, Global Forest Watch, deforestation.</p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Future deforestation risk.</p>
              <p>Index of areas likely to be deforested within 50km of sourcing regions.</p>
              <p>
                Source: <strong className="font-semibold">Satelligence.</strong>
              </p>
            </li>
            <li className="relative pl-5 before:absolute before:top-2 before:left-0 before:w-1.5 before:h-1.5 before:bg-black">
              <p className="font-semibold">Custom landscape level indicators.</p>
              <p>Add data sources or adjust metrics to better measure your business impacts.</p>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default Step02;
