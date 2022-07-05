import cx from 'classnames';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import { Children, ReactNode } from 'react';

interface StepsProps {
  theme: 'green' | 'orange' | 'blue';
  children: ReactNode | ReactNode[];
}

const Steps: React.FC<StepsProps> = ({ theme, children }: StepsProps) => {
  return (
    <section
      className={cx({
        'relative pt-24 pb-12 md:pt-64 md:pb-32': true,
        'bg-green-500': theme === 'green',
        'bg-orange-500': theme === 'orange',
        'bg-blue-500': theme === 'blue',
      })}
    >
      <Wrapper>
        <div className="relative z-10 space-y-32 lg:space-y-64">
          {Children.map(children, (c) => {
            return <FadeIn>{c}</FadeIn>;
          })}
        </div>
      </Wrapper>
    </section>
  );
};

export default Steps;
