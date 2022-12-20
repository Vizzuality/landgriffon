import { Suspense } from 'react';

import cx from 'classnames';

import { Canvas } from '@react-three/fiber';

import Logo from 'components/logo';
import Cookie from 'components/cookie';

function Hero() {
  return (
    <div
      className={cx({
        'relative px-4 pt-20 xl:pt-24 xl:pb-40 2xl:pt-32 2xl:pb-60': true,
        'pb-40 md:pb-48 xl:pb-56 2xl:pb-60': true,
      })}
    >
      <div className="space-y-14">
        <Logo className="m-auto fill-secondary" />

        <h1 className="text-4xl leading-none md:text-[80px] md:leading-[80px] xl:text-[100px] xl:leading-[100px] 2xl:text-[112px] 2xl:leading-[101px] font-display font-extrabold text-center uppercase">
          Where does my <br /> cookie come
          <br /> from?
        </h1>
      </div>

      <div className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none">
        <Canvas
          camera={{
            position: [1.25, 3.5, 6.75],
            fov: 45,
            near: 0.1,
            far: 200,
          }}
          gl={{
            physicallyCorrectLights: true,
          }}
          shadows
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            color="white"
            position={[0, 5, -1]}
            intensity={2}
            castShadow
            shadow-camera-near={1}
            shadow-camera-far={10}
            shadow-camera-left={-3}
            shadow-camera-right={3}
            shadow-camera-top={3}
            shadow-camera-bottom={-3}
          />
          <pointLight color="white" position={[0, 1, -2]} intensity={5} distance={5} decay={0} />
          {/* <directionalLight
            color="white"
            position={[5, 1, 0]}
            intensity={2}
            // castShadow
            // shadow-camera-far={10}
            // shadow-camera-left={-3}
            // shadow-camera-right={3}
            // shadow-camera-top={3}
            // shadow-camera-bottom={-3}
          /> */}

          <Suspense fallback={null}>
            <Cookie />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default Hero;
