import { extend, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Float32BufferAttribute, MathUtils, Points } from 'three';

import SnowMaterial from './material';

extend({ SnowMaterial });

function Snow() {
  const pointsRef = useRef<Points>(null);

  const { viewport } = useThree();

  const count = 10000;
  const particles = useMemo(() => {
    // Create a Float32Array of count*3 length
    // -> we are going to generate the x, y, and z values for n particles
    // -> thus we need n * 3 items in this array
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const speed = new Float32Array(count);

    const minSpeed = 0.1;
    const maxSpeed = 0.4;

    for (let i = 0; i < count; i++) {
      // Positions
      let x = MathUtils.randFloatSpread(viewport.width);
      let y = MathUtils.randFloat(viewport.height / 2, viewport.height / 2 + 2);
      let z = MathUtils.randFloat(-5, 5);

      positions.set([x, y, z], i * 3);
      randoms.set([MathUtils.randFloat(0, 1)], i);
      speed.set([MathUtils.randFloat(minSpeed, maxSpeed)], i);
    }

    return {
      positions,
      randoms,
      speed,
    };
  }, [count, viewport]);

  useFrame(() => {
    pointsRef.current!.geometry.setAttribute(
      'position',
      new Float32BufferAttribute(particles.positions, 3),
    );
    pointsRef.current!.geometry.setAttribute(
      'a_random',
      new Float32BufferAttribute(particles.randoms, 1),
    );
    pointsRef.current!.geometry.setAttribute(
      'a_speed',
      new Float32BufferAttribute(particles.speed, 1),
    );
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-a_random"
            count={particles.randoms.length}
            array={particles.randoms}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-a_speed"
            count={particles.speed.length}
            array={particles.speed}
            itemSize={1}
          />
        </bufferGeometry>

        <SnowMaterial />
        {/* <pointsMaterial color="#FFFFFF" size={0.05} sizeAttenuation /> */}
      </points>
    </>
  );
}

export default Snow;
