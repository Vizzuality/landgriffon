import FadeIn from 'components/fade';
import Scale from 'components/scale';
import Wrapper from 'containers/wrapper';

const Values: React.FC = () => {
  return (
    <section className="relative z-10 overflow-hidden bg-white">
      <Wrapper>
        <FadeIn className="relative flex flex-col items-center justify-center py-32 space-y-20">
          <div className="space-y-10">
            <h2 className="font-black text-black uppercase lg:w-8/12 font-display text-7xl">
              Sustainability is <span className="text-green-500">an ecosystem. </span>
            </h2>
            <h3 className="text-3xl font-medium text-black font-display">
              The impacts from interconnected supply chains are never isolated, so we believe the
              approach to making them sustainable shouldn’t be either.
            </h3>
            <p className="leading-relaxed">
              Corporate sustainability is many things, from high-level goals and metrics to
              simplifying complex information and balancing competing priorities. It’s taking action
              based on what you have while simultaneously working towards more accurate data and
              information. It’s seeing the connection between the workforce, the supply chain, the
              environment it depends on, and the climate that affects it.{' '}
              <strong className="font-semibold">
                Collaboration will ensure a future where this ecosystem can thrive, from the
                environment it relies on to the businesses that keep it evolving.
              </strong>
            </p>
          </div>
        </FadeIn>
      </Wrapper>

      <Wrapper>
        <FadeIn className="relative flex flex-col items-center justify-center pb-32 space-y-20">
          <div className="space-y-10">
            <h3 className="text-xl font-black text-center text-black uppercase font-display">
              That&apos;s why we value:
            </h3>

            <ul className="space-y-20">
              <li className="relative">
                <div className="relative z-10 space-y-10">
                  <h3 className="text-3xl font-black text-center text-black uppercase lg:text-10xl font-display">
                    Transparency
                  </h3>
                  <p className="max-w-4xl mx-auto text-2xl font-light text-center">
                    To ensure our methods and program are trusted by all key players in the field.
                  </p>
                </div>
                <Scale className="absolute top-0 right-0 z-0 w-32 h-32">
                  <div className="w-full h-full translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full" />
                </Scale>
              </li>
              <li className="relative">
                <div className="relative z-10 space-y-10">
                  <h3 className="text-3xl font-black text-center text-black uppercase lg:text-10xl font-display">
                    Innovation
                  </h3>
                  <p className="max-w-4xl mx-auto text-2xl font-light text-center">
                    Allow the technology to do the pedantic labor while you focus on the important
                    work; taking action.
                  </p>
                </div>
                <Scale className="absolute top-0 left-0 z-0 w-52 h-52">
                  <div className="w-full h-full -translate-x-1/2 translate-y-5 bg-orange-500 rounded-full" />
                </Scale>
              </li>
              <li className="relative">
                <div className="relative z-10 space-y-10">
                  <h3 className="text-3xl font-black text-center text-black uppercase lg:text-10xl font-display">
                    Adaptability
                  </h3>
                  <p className="max-w-4xl mx-auto text-2xl font-light text-center">
                    Designed to fit your business needs, now and as they evolve.
                  </p>
                </div>
                <Scale className="absolute top-0 right-0 z-0 w-40 h-40">
                  <div className="w-full h-full -translate-x-5 translate-y-0 bg-blue-500 rounded-full" />
                </Scale>
              </li>
            </ul>
          </div>
        </FadeIn>
      </Wrapper>
    </section>
  );
};

export default Values;
