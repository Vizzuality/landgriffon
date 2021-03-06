import Wrapper from 'containers/wrapper';

import FAQS from './constants';
import FAQItem from './item';

const FAQList: React.FC = () => {
  return (
    <section className="bg-white">
      <div className="relative z-10">
        <Wrapper>
          <div className="space-y-px border-t border-gray-100 divide-y divide-gray-100">
            {FAQS.map((f) => {
              return <FAQItem key={f.id} {...f} />;
            })}
          </div>
        </Wrapper>
      </div>
    </section>
  );
};

export default FAQList;
