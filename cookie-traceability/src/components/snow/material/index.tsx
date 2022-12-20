//@ts-ignore
import glslify from 'glslify';

import VERTEX from './vertex.glsl';
import FRAGMENT from './fragment.glsl';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, ShaderMaterial } from 'three';
import { useFrame, useThree } from '@react-three/fiber';

function CustomPointsMaterial() {
  const materialRef = useRef<ShaderMaterial>(null);

  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_vwidth: {
        value: viewport.width,
      },
      u_vheight: {
        value: viewport.height,
      },
      // Add any other attributes here
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame(({ clock, viewport: v }) => {
    materialRef.current!.uniforms.u_time.value = clock.getElapsedTime();
    materialRef.current!.uniforms.u_vwidth.value = v.width;
    materialRef.current!.uniforms.u_vheight.value = v.height;
  });

  // define your uniforms
  return (
    <shaderMaterial
      blending={AdditiveBlending}
      ref={materialRef}
      fragmentShader={glslify(FRAGMENT)}
      vertexShader={glslify(VERTEX)}
      uniforms={uniforms}
      transparent
      alphaTest={0.5}
      depthWrite={false}
    />
  );
}

export default CustomPointsMaterial;
