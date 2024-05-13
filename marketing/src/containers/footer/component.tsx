import FadeIn from 'components/fade/component';
import Wrapper from 'containers/wrapper';

const Footer: React.FC = () => {
  return (
    <section className="bg-white ">
      <Wrapper>
        <div className="relative py-12 border-t border-black/10">
          <div className="flex items-center py-12">
            <div className="space-y-16">
              <FadeIn>
                <h2 className="text-4xl font-black uppercase md:text-6xl font-display">
                  SBTN & TNFD Alignment
                </h2>
              </FadeIn>

              <FadeIn>
                <div className="space-y-10 text-2xl font-light leading-relaxed">
                  <p>
                    The Science Based Targets Network (SBTN) and the Taskforce on Nature-related
                    Financial Disclosures (TNFD) LEAP are leading standards for the wider scope of
                    nature impact assessment beyond emissions and deforestation.
                  </p>
                  <p>
                    LandGriffon offers SBTN-aligned methodologies for nature impact assessment, even
                    for companies at the beginning of their sustainability journey. Use our
                    open-source, reliable data for accurate reporting, to spend more time on
                    transformative actions than chasing frameworks.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default Footer;
