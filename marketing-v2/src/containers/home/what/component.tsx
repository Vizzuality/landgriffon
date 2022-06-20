import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

const What: React.FC = () => {
  return (
    <section className="relative py-32 bg-blue-500">
      <div className="relative z-10">
        <Wrapper>
          <div className="space-y-20">
            <div className="w-5/12">
              <FadeIn>
                <div>
                  <h2 className="text-6xl font-black text-white uppercase font-display">
                    What can Landgriffon do for you?
                  </h2>
                </div>
              </FadeIn>
            </div>
          </div>
        </Wrapper>
      </div>
      <div className="absolute left-0 z-0 w-full bg-red-500 top-1/2 h-1/2"></div>
    </section>
  );
};

export default What;
