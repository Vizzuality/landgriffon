import cx from 'classnames';
import Image from 'next/image';

const AppScreens: React.FC = () => {
  return (
    <section className="py-32 bg-orange-500 h-[50vh]">
      <div
        className={cx({
          'flex flex-wrap gap-10 justify-center rotate-[-30deg]': true,
        })}
      >
        <div className="w-[calc(33.33%_-_40px)]">
          <Image
            alt="Screen 01"
            src="/images/service/example/01.png"
            width={1005}
            height={714}
            layout="responsive"
          />
        </div>
        <div className="w-[calc(33.33%_-_40px)] opacity-80">
          <Image
            alt="Screen 02"
            src="/images/service/example/02.png"
            width={1005}
            height={714}
            layout="responsive"
          />
        </div>
        <div className="w-[calc(33.33%_-_40px)] opacity-30">
          <Image
            alt="Screen 03"
            src="/images/service/example/03.png"
            width={1005}
            height={714}
            layout="responsive"
          />
        </div>
        <div className="w-[calc(33.33%_-_40px)] opacity-20">
          <Image
            alt="Screen 04"
            src="/images/service/example/04.png"
            width={1005}
            height={714}
            layout="responsive"
          />
        </div>
        <div className="w-[calc(33.33%_-_40px)] opacity-20">
          <Image
            alt="Screen 05"
            src="/images/service/example/05.png"
            width={1005}
            height={714}
            layout="responsive"
          />
        </div>
      </div>
    </section>
  );
};

export default AppScreens;
