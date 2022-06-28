import { ReactNode, useState } from 'react';

import cx from 'classnames';

import Icon from 'components/icon';

import PLUS_SVG from 'svgs/ui/icn_plus.svg?sprite';
import MINUS_SVG from 'svgs/ui/icn_minus.svg?sprite';

interface FAQItemProps {
  question: string | ReactNode;
  answer: string | ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }: FAQItemProps) => {
  const [open, setOpen] = useState(false);

  return (
    <article
      className={cx({
        'p-12': true,
        'bg-white': !open,
        'bg-gray-100': open,
      })}
    >
      <button
        type="button"
        className="flex items-center justify-between w-full space-x-5"
        onClick={() => setOpen(!open)}
      >
        <h2 className="text-xl font-bold">{question}</h2>
        {!open && <Icon icon={PLUS_SVG} className="w-4 h-4 fill-black shrink-0" />}
        {open && <Icon icon={MINUS_SVG} className="w-4 h-4 fill-black shrink-0" />}
      </button>

      {open && (
        <div className="pr-10 mt-5">
          <div className="font-light">{answer}</div>
        </div>
      )}
    </article>
  );
};

export default FAQItem;
