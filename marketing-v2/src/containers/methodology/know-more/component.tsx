import FadeIn from 'components/fade';
import Wrapper from 'containers/wrapper';
import Link from 'next/link';

const KnowMore: React.FC = () => {
  return (
    <section className="relative z-10 bg-white">
      <Wrapper>
        <FadeIn className="relative flex flex-col items-center justify-center py-32 space-y-20">
          <div className="space-y-10">
            <h2 className="text-5xl font-black text-center text-black uppercase font-display md:text-7xl">
              Would you like to know more about landgriffon?
            </h2>
            <h3 className="text-3xl font-medium text-center text-black font-display">
              Contact us and let&apos;s figure out how we can work together.
            </h3>
          </div>

          <Link href="/contact?topic=demo">
            <a className="inline-block py-5 font-semibold text-black border-2 border-black px-9">
              Set up a free call now
            </a>
          </Link>
        </FadeIn>
      </Wrapper>
    </section>
  );
};

export default KnowMore;
