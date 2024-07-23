import FadeIn from 'components/fade';

type IntroType = Readonly<{
  title: string;
  intro: string | JSX.Element;
  children?: React.ReactNode;
}>;

const Intro: React.FC<IntroType> = ({ title, intro, children }: IntroType) => {
  return (
    <div className="relative py-5 border-t border-black/10">
      <FadeIn>
        <div className="space-y-9">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-xl font-black uppercase font-display">{title}</h2>
            <p className="text-[25px] font-light leading-8">{intro}</p>
          </div>
          {children}
        </div>
      </FadeIn>
    </div>
  );
};

export default Intro;
