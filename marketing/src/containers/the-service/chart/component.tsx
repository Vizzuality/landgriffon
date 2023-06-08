import FadeIn from 'components/fade';
import Wrapper from 'containers/wrapper';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const FEATURES_METADATA = [
  {
    id: '01',
    title: 'Platform instalment',
  },
  {
    id: '02',
    title: 'User Management',
  },
  {
    id: '03',
    title: 'User Roles and Permissions',
  },
  {
    id: '04',
    title: 'Data Management',
  },
  {
    id: '05',
    title: 'Data logging',
  },
  {
    id: '06',
    title: 'Data Auditability',
  },
  {
    id: '07',
    title: 'Data versioning',
  },
  {
    id: '08',
    title: 'Events and campaigns',
  },
  {
    id: '09',
    title: 'Reporting tools',
  },
  {
    id: '10',
    title: 'Specific features',
  },
];

const Chart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartRect, setChartRect] = useState<DOMRect | null>(null);

  const FEATURES = useMemo(() => {
    if (!chartRect) return [];

    const { width, height } = chartRect;
    const xCenter = width / 2;
    const yCenter = height / 2;

    const radius = width / 2 - 95;

    return FEATURES_METADATA.map((c, i) => {
      const radian = (i / FEATURES_METADATA.length) * 2 * Math.PI - Math.PI * 0.5;

      const x = xCenter + radius * Math.cos(radian);
      const y = yCenter + radius * Math.sin(radian);

      return {
        ...c,
        options: {
          x,
          y,
        },
      };
    });
  }, [chartRect]);

  const onWindowResize = useCallback(() => {
    if (chartRef.current) {
      setChartRect(chartRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      setChartRect(rect);
    }

    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="relative z-10 hidden py-16 bg-white lg:block">
      <Wrapper>
        <div className="space-y-10">
          <FadeIn>
            <h2 className="text-4xl font-black uppercase md:text-6xl font-display">
              The LandGriffon platform is designed for evolution and customization
            </h2>
          </FadeIn>
          <FadeIn>
            <div className="relative z-10 space-y-1 text-center translate-y-5">
              <h4 className="text-xl font-black uppercase font-display">Custom features</h4>
            </div>
            <div className="relative z-0 w-full pb-[100%]">
              <div
                ref={chartRef}
                className="absolute flex items-center justify-center w-full h-full bg-gray-100 rounded-full"
              >
                {/* FEATURES */}
                {FEATURES.map((f) => {
                  return (
                    <div
                      key={f.id}
                      className="absolute top-0 left-0 flex items-center justify-center"
                      style={{
                        transform: `translate(${f.options.x}px, ${f.options.y}px)`,
                      }}
                    >
                      <div className="-translate-x-1/2 -translate-y-1/2 max-w-[120px]">
                        <div className="font-bold text-center text-black">{f.title}</div>
                      </div>
                    </div>
                  );
                })}
                {/* INNER CIRCLE */}
                <div className="w-[65%] h-[65%] border border-gray-300 border-dashed rounded-full p-5">
                  <div className="space-y-10">
                    <div className="w-[72.5%] mx-auto">
                      <div className="w-full pb-[100%] relative">
                        <div className="absolute flex flex-col items-center justify-center w-full h-full space-y-5 bg-green-500 rounded-full">
                          <div className="space-y-1 text-center px-28">
                            <h4 className="text-xl font-black text-white uppercase font-display">
                              Core methodology
                            </h4>
                          </div>

                          <div className="w-[55%] mx-auto">
                            <div className="w-full pb-[100%] relative">
                              <div className="absolute flex flex-col items-center justify-center w-full h-full border border-white border-dashed rounded-full">
                                <div className="px-10 space-y-1 text-center">
                                  <h4 className="text-xl font-black text-white uppercase font-display">
                                    Base Platform
                                  </h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-center">
                      <h4 className="text-xl font-black uppercase font-display">
                        Analysis and Impact calculation
                      </h4>
                      <p className="italic font-light px-28">
                        Part of Landgriffon platform, customizable to fit new sustainability project
                        needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Wrapper>
    </section>
  );
};

export default Chart;
