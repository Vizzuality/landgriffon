import Wrapper from 'containers/wrapper';
import List from './list';

const FAQs: React.FC = () => {
  return (
    <section className="bg-white">
      <div className="relative z-10">
        <Wrapper>
          <div className="relative z-10 py-20 md:py-32">
            <div className="flex flex-col justify-between space-y-10 md:flex-row md:space-x-20 md:space-y-0">
              <div className="space-y-10 md:w-8/12">
                <h2 className="text-6xl font-black uppercase font-display">
                  FREQUENTLY ASKED QUESTIONS.
                </h2>
              </div>
            </div>
          </div>
        </Wrapper>

        <List />
      </div>
    </section>
  );
};

export default FAQs;
