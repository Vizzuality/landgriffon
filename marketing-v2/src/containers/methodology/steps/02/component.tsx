import cx from 'classnames';
import Icon from 'components/icon';
import Modal from 'components/modal';
import MethodologyForm from 'containers/methodology-form';
import useModal from 'hooks/modals';
import Image from 'next/image';

import DOWNLOAD_SVG from 'svgs/ui/icn_download.svg?sprite';
import DOCUMENT_SVG from 'svgs/ui/document.svg?sprite';

const Step02: React.FC = () => {
  const {
    isOpen: isMethodologyFormModalOpen,
    open: openMethodologyFormModal,
    close: closeMethodologyFormModal,
  } = useModal();

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
              Land scape level
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

        <div
          className="relative h-56 pl-8 overflow-hidden font-semibold text-white border-2 border-blue-900 cursor-pointer group pt-7 w-96"
          style={{
            backgroundImage: `url('/images/methodology/methodology_bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
          }}
          onClick={openMethodologyFormModal}
        >
          <div className="absolute flex items-center justify-center transition-colors bg-white h-9 top-3 right-3 w-9 group-hover:bg-orange-500">
            <Icon icon={DOCUMENT_SVG} className="w-5 h-5" />
          </div>

          <div className="w-4/5">
            <p className="text-2xl font-black uppercase font-display">
              Learn more about the science behind
            </p>
          </div>

          <div className="absolute bottom-0 left-0 flex items-center justify-between w-full px-8 py-3 space-x-5 transition-opacity opacity-0 group-hover:opacity-100 bg-white/10">
            <p className="font-bold">Read our methodology document to find out how it works.</p>
            <Icon icon={DOWNLOAD_SVG} className="w-5 h-5 fill-white" />
          </div>
        </div>

        <Modal
          title="To download our Methodology, please fill in the following fields"
          size="wide"
          open={isMethodologyFormModalOpen}
          onDismiss={closeMethodologyFormModal}
          dismissable
        >
          <MethodologyForm close={closeMethodologyFormModal} />
        </Modal>
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
              <p className="font-semibold">Deforestation. </p>
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
