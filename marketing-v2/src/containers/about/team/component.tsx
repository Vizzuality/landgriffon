import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

import Icon from 'components/icon';

import TEAM from './team';

import TEAM_SVG from 'svgs/about/icn_team.svg?sprite';
import LINKEDIN_SVG from 'svgs/social/linkedin.svg?sprite';

const Team: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-blue-600">
      <div className="relative z-10 py-32 space-y-64 md:py-64">
        <Wrapper>
          <div className="space-y-10 text-white md:space-y-20">
            <FadeIn>
              <div className="mb-10">
                <Icon icon={TEAM_SVG} className="w-16 h-16" />
              </div>
              <h3 className="text-3xl font-medium text-white font-display">
                Our team bring together diverse expertize to ensure a service that helps make this
                happen.
              </h3>
            </FadeIn>

            <FadeIn>
              <ul className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                {TEAM.map((t) => {
                  return (
                    <li key={t.name} className="relative py-5 border-t border-blue-500/30">
                      <header className="flex justify-between">
                        <div>
                          <h4 className="text-xl text-blue-500 mb-2.5">{t.name}</h4>
                          <h5 className="mb-5 font-bold">{t.company}</h5>
                        </div>
                        {t.linkedin && (
                          <a
                            href={t.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1"
                          >
                            <Icon icon={LINKEDIN_SVG} className="w-4 h-4 fill-white" />
                          </a>
                        )}
                      </header>

                      <p className="font-light">{t.role}</p>
                    </li>
                  );
                })}
              </ul>
            </FadeIn>
          </div>
        </Wrapper>
      </div>

      <div
        className="absolute bottom-0 right-0 z-0 bg-cover w-[1000px] h-[1000px] rotate-[145deg] translate-x-1/2 translate-y-1/2"
        style={{ backgroundImage: `url('/images/about/team/bg_circles.svg')` }}
      />
    </section>
  );
};

export default Team;
