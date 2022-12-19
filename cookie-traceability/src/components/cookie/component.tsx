import { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { Group, LinearEncoding, MeshStandardMaterial, sRGBEncoding } from 'three';

import { useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { motion } from 'framer-motion-3d';
interface CookieProps {
  nodes: any;
  materials: any;
}

function Cookie(props: any) {
  const cookieRef = useRef<Group>();

  const texture = useTexture({
    map: '/models/cookie/cookie_4px_compressed.png',
    normalMap: '/models/cookie/cookie_normal_4px_compressed.png',
  });

  const { nodes }: CookieProps = useGLTF('/models/cookie/cookie.gltf');

  const rotationX = useMotionValue(0);
  const rotationY = useMotionValue(0);

  const rX = useSpring(useTransform(rotationX, (v) => v));
  const rY = useSpring(useTransform(rotationY, (v) => v));

  const chipMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: '#5b210f',
      emissive: '#5b210f',
      emissiveIntensity: 0.5,
      metalness: 0,
      roughness: 0,
    });
  }, []);

  useFrame(({ mouse }) => {
    rotationX.set(mouse.y * 0.1);
    rotationY.set(-mouse.x * 0.5);
  });

  return (
    <motion.group
      {...props}
      ref={cookieRef}
      dispose={null}
      position={[0, -1.25, 0]}
      rotation-x={rX}
      rotation-y={rY}
    >
      <motion.mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[5, 0.1, 5]} />
        <shadowMaterial opacity={0.25} />
      </motion.mesh>

      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cookie.geometry}
        rotation={[Math.PI, Math.PI / 2, 0]}
      >
        <meshStandardMaterial
          {...texture}
          color={'#EECDA3'}
          map-flipY={false}
          map-encoding={sRGBEncoding}
          normalMap-flipY={false}
          normalMap-encoding={LinearEncoding}
        />

        {Object.keys(nodes).map((node) => {
          if (node.includes('chip')) {
            const n = nodes[node];

            return (
              <mesh
                key={node}
                {...n}
                geometry={n.geometry}
                material={chipMaterial}
                castShadow
                receiveShadow
              />
            );
          }

          return null;
        })}
      </mesh>
    </motion.group>
  );
}

export default Cookie;
