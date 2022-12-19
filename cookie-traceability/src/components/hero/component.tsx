import { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';

import Logo from 'components/logo';
import Cookie from 'components/cookie';

function Hero() {
  return (
    <div className="relative px-4 pt-32 pb-60 space-y-14">
      <Logo className="m-auto fill-secondary" />

      <h1 className="text-[112px] leading-[101px] font-display font-extrabold text-center uppercase">
        Where does my <br /> cookie come
        <br /> from?
      </h1>

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
          <ambientLight intensity={1} />
          <directionalLight
            color="white"
            position={[0, 5, -1]}
            intensity={2}
            castShadow
            shadow-camera-far={10}
            shadow-camera-left={-3}
            shadow-camera-right={3}
            shadow-camera-top={3}
            shadow-camera-bottom={-3}
          />
          <directionalLight
            color="white"
            position={[5, 1, 0]}
            intensity={2}
            // castShadow
            // shadow-camera-far={10}
            // shadow-camera-left={-3}
            // shadow-camera-right={3}
            // shadow-camera-top={3}
            // shadow-camera-bottom={-3}
          />

          <Suspense fallback={null}>
            <Cookie />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default Hero;
