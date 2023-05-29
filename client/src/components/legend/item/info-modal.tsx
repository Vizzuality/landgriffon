import { InformationCircleIcon } from '@heroicons/react/outline';
import { useState } from 'react';

import Modal from 'components/modal/component';

export type InfoModalProps = {
  info: { title: string; description: string; source: string | string[] };
};

const NO_DATA = 'No data available';

const InfoModal = ({ info: { title, description, source } }: InfoModalProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="py-0 px-0" onClick={() => setOpen(true)}>
        <InformationCircleIcon className="w-4 h-4" />
      </button>
      <Modal onDismiss={() => setOpen(false)} title={title || NO_DATA} open={open} size="narrow">
        <div>
          <p className="text-gray-500 text-sm mb-4">{description}</p>
          {!!source && (
            <p className="font-semibold text-sm mb-2">
              Data layer source{Array.isArray(source) && source.length > 1 ? 's' : ''}:
            </p>
          )}
          {Array.isArray(source) ? (
            <ul className="space-y-2">
              {source.map((s) => (
                <li key={s} className="text-gray-500 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">{source}</p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default InfoModal;
