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
      <button type="button" className="px-0 py-0" onClick={() => setOpen(true)}>
        <InformationCircleIcon className="h-4 w-4" />
      </button>
      <Modal onDismiss={() => setOpen(false)} title={title || NO_DATA} open={open} size="narrow">
        <div>
          <p className="mb-4 text-sm text-gray-500">{description}</p>
          {!!source && (
            <p className="mb-2 text-sm font-semibold">
              Data layer source{Array.isArray(source) && source.length > 1 ? 's' : ''}:
            </p>
          )}
          {Array.isArray(source) ? (
            <ul className="space-y-2">
              {source.map((s) => (
                <li key={s} className="text-sm text-gray-500">
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">{source}</p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default InfoModal;
