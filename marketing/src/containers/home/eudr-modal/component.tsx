import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTimeout } from 'rooks';

import Modal from 'components/modal';

export const EUDRModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { start, stop } = useTimeout(() => {
    setIsOpen(true);
  }, 20000);

  const handleDismissModal = useCallback(() => {
    setIsOpen(!isOpen);
    stop();
  }, [isOpen, stop]);

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal open={isOpen} onDismiss={handleDismissModal}>
      <div
        className="relative w-full min-h-[495px] space-y-12 py-12 px-14 mx-auto text-white bg-blue-900 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/methodology/webinar-bg.png)',
        }}
      >
        <div className="space-y-2">
          <div className="uppercase text-xl font-display font-black">
            EU Deforestation Regulation
          </div>
          <h2 className="uppercase text-3xl xl:text-[55px] leading-tight font-display font-black">
            Our New <span className="bg-orange-500 text-blue-900">EUDR</span>
            <br /> Compliance Tool.
          </h2>
        </div>
        <div className="flex items-center space-x-6 mt-4">
          <div>
            <Image
              src="/images/landgriffon-vizz-logo.png"
              width={200}
              height={45}
              alt="LandGriffon by Vizz logo"
            />
          </div>
          <div>
            <Image src="/images/carto-logo.svg" width={80} height={31} alt="Carto logo" />
          </div>
        </div>
        <div className="lg:flex justify-between items-end space-y-4">
          <div className="space-y-4">
            <div className="text-xl lg:text-2xl">Find out how it will work for you.</div>
          </div>
          <Link href="/contact">
            <a className="font-semibold w-[195px] h-[82px] flex items-center hover:cursor-pointer justify-center border-2 border-white focus-visible:ring-0 focus-visible:outline-0">
              Contact us now
            </a>
          </Link>
        </div>
      </div>
    </Modal>
  );
};

export default EUDRModal;
