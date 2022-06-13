import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

const Features: React.FC = () => {
  return (
    <section className="relative py-32 bg-white">
      <Wrapper>
        <div className="space-y-20 py">
          <FadeIn>
            <h2 className="w-5/12 text-6xl font-black uppercase font-display">
              LandGriffon is built with you in mind.
            </h2>
          </FadeIn>

          <ul className="grid grid-cols-2 gap-y-20 gap-x-64">
            <li>
              <FadeIn className="space-y-10">
                <h3 className="text-3xl font-medium font-display">Flexible to your needs.</h3>
                <p>
                  LandGriffon is designed to adapt to each company&apos;s unique context and
                  ambitions. Regardless of the amount or detail of your existing data, we can work
                  with you.
                </p>
              </FadeIn>
            </li>
            <li>
              <FadeIn className="space-y-10">
                <h3 className="text-3xl font-medium font-display">Community powered.</h3>
                <p>
                  LandGriffon brings together the most trusted indicator data from across the
                  sustainability community. Learn more about the indicators we use.
                </p>
              </FadeIn>
            </li>
            <li>
              <FadeIn className="space-y-10">
                <h3 className="text-3xl font-medium font-display">An ethos of transparency.</h3>
                <p>
                  We’re confident in our technology, and you should be too. Our methods and code are
                  open for all to see, use, and verify.
                </p>
              </FadeIn>
            </li>
          </ul>
        </div>
      </Wrapper>
    </section>
  );
};

export default Features;
