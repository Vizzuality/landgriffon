import { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';

import Logo from 'components/logo';
import Cookie from 'components/cookie';

function Hero() {
  return (
    <div className="space-y-4">
      <Logo className="m-auto fill-secondary" />

      <h1 className="text-[112px] leading-[101px] font-display font-extrabold text-center uppercase">
        Where does my <br /> cookie come
        <br /> from?
      </h1>

      <div className="w-full h-[140px]">
        <Canvas
          camera={{
            position: [2.5, 6.75, 7.5],
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
            position={[0, 5, -2.5]}
            intensity={2}
            castShadow
            shadow-camera-far={10}
            shadow-camera-left={-3}
            shadow-camera-right={3}
            shadow-camera-top={3}
            shadow-camera-bottom={-3}
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
