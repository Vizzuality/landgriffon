import Wrapper from 'containers/wrapper';
import Link from 'next/link';
import List from './list';

const FAQs: React.FC = () => {
  return (
    <section className="bg-white">
      <div className="relative z-10">
        <Wrapper>
          <div className="relative z-10 pt-20 pb-10 md:pt-32 md:pb-16">
            <div className="flex flex-col justify-between space-y-10 md:flex-row md:space-x-20 md:space-y-0">
              <div className="space-y-10 md:w-8/12">
                <h2 className="font-black uppercase text-5xl md:text-7xl font-display">
                  FREQUENTLY ASKED QUESTIONS.
                </h2>
              </div>
            </div>
          </div>
        </Wrapper>

        <List />

        <Wrapper>
          <div className="relative z-10 px-5 py-20 mt-20 bg-orange-500 md:py-32">
            <div className="w-full">
              <div className="space-y-10 text-center">
                <h2 className="text-3xl font-medium font-display">Still have a question?</h2>

                <p className="text-xl font-light">
                  Please{' '}
                  <Link href="/contact">
                    <a className="underline">contact us</a>
                  </Link>
                  . We will gladly answer you as soon as we can!
                </p>
              </div>
            </div>
          </div>
        </Wrapper>
      </div>
    </section>
  );
};

export default FAQs;
