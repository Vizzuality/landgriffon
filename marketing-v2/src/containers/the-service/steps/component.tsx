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
        'relative pt-64 pb-32': true,
        'bg-green-500': theme === 'green',
        'bg-orange-500': theme === 'orange',
        'bg-blue-500': theme === 'blue',
      })}
    >
      {theme === 'orange' && (
        <div
          className="absolute z-0 w-full h-full pointer-events-none"
          style={{
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% auto',
            backgroundPosition: '50% 100%',
            backgroundImage: `url('/images/service/example/composition.png')`,
          }}
        />
      )}
      <Wrapper>
        <div className="relative z-10 space-y-64">
          {Children.map(children, (c) => {
            return <FadeIn>{c}</FadeIn>;
          })}
        </div>
      </Wrapper>
    </section>
  );
};

export default Steps;
