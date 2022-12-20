import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { Group, LinearEncoding, MeshStandardMaterial, sRGBEncoding } from 'three';

import { useMotionValue, useSpring } from 'framer-motion';
import { motion } from 'framer-motion-3d';

import useBreakpoint from 'use-breakpoint';

import { BREAKPOINTS } from '../../constants';

const POSITIONS = {
  xs: { x: 0, y: -2, z: 0, scale: 1.25 },
  sm: { x: 0, y: -2, z: 0, scale: 1.25 },
  md: { x: 0, y: -2.25, z: 0, scale: 1.125 },
  lg: { x: 0, y: -2.25, z: 0, scale: 1.125 },
  xl: { x: 0, y: -2.23, z: 0, scale: 1.125 },
  '2xl': { x: 0, y: -2.2, z: 0, scale: 1 },
};

interface CookieProps {
  nodes: any;
  materials: any;
}

function Cookie(props: any) {
  const [selected, setSelected] = useState(false);

  const cookieRef = useRef<Group>();

  const DURATION = 0.9;
  const { breakpoint } = useBreakpoint(BREAKPOINTS, 'xs', false);

  // Model
  const { nodes }: CookieProps = useGLTF('/models/cookie/cookie.gltf');

  // Model Textures
  const texture = useTexture({
    map: '/models/cookie/galleta_4px_adjusted.jpg',
    normalMap: '/models/cookie/galleta_normal_4px_adjusted.jpg',
  });

  // Model Materials
  const chipMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: '#5b210f',
      emissive: '#5b210f',
      emissiveIntensity: 0.5,
      metalness: 0,
      roughness: 0,
    });
  }, []);

  // Animations
  const rotationX = useMotionValue(0);
  const rotationY = useMotionValue(0);

  const rX = useSpring(rotationX, {
    damping: 100,
    stiffness: 1000,
  });
  const rY = useSpring(rotationY, {
    damping: 100,
    stiffness: 1000,
  });

  const handleClick = useCallback(
    (e: ThreeEvent<globalThis.MouseEvent>) => {
      e.stopPropagation();

      if (!selected) {
        setSelected(true);
      }
    },
    [selected],
  );

  useFrame(({ mouse }) => {
    rotationX.set(Math.max(-1, mouse.y) * 0.25);
    rotationY.set(-mouse.x * 0.5);
  });

  return (
    <motion.group
      {...props}
      ref={cookieRef}
      dispose={null}
      initial={{
        y: POSITIONS[breakpoint].y,
        scale: 0,
        rotateY: Math.PI,
      }}
      animate={{
        y: POSITIONS[breakpoint].y,
        scale: POSITIONS[breakpoint].scale || 1,
        rotateY: 0,
      }}
      transition={{
        duration: 0.4,
        ease: 'easeInOut',
      }}
      rotation-x={rX}
      rotation-y={rY}
      onClick={handleClick}
      // onPointerEnter={() => {
      //   if (!selected) {
      //     setSelected(true);
      //   }
      // }}
    >
      <motion.mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[5, 0.1, 5]} />
        <shadowMaterial opacity={0.25} />
      </motion.mesh>

      <motion.mesh
        castShadow
        receiveShadow
        geometry={nodes.Cookie.geometry}
        rotation={[Math.PI, Math.PI / 2, 0]}
        initial={false}
        animate={{
          y: selected ? [0, 0.5, 0] : 0,
        }}
        transition={{
          duration: DURATION,
          ease: selected ? ['backIn', 'backOut'] : 'anticipate',
        }}
        onAnimationComplete={() => {
          if (selected) {
            setTimeout(() => {
              setSelected(false);
            }, DURATION * 0.25 * 1000);
          }

          // scrollTo #ingredients
          const ingredients = document.querySelector('#ingredients');

          if (ingredients) {
            ingredients.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }}
      >
        <meshStandardMaterial
          {...texture}
          color={'#CCAA88'}
          map-flipY={false}
          map-encoding={sRGBEncoding}
          normalMap-flipY={false}
          normalMap-encoding={LinearEncoding}
          roughness={0.75}
        />

        {Object.keys(nodes).map((node) => {
          if (node.includes('chip')) {
            const n = nodes[node];

            return (
              <motion.mesh
                key={node}
                {...n}
                geometry={n.geometry}
                material={chipMaterial}
                initial={false}
                animate={{
                  y: selected
                    ? [n.position.y, n.position.y - (0.3 + Math.random() * 0.7), n.position.y]
                    : n.position.y,
                }}
                transition={{
                  duration: DURATION * 0.5,
                  delay: DURATION * 0.33,
                  ease: selected ? ['easeIn', 'easeOut'] : 'anticipate',
                }}
                castShadow
                receiveShadow
              />
            );
          }

          return null;
        })}
      </motion.mesh>
    </motion.group>
  );
}

export default Cookie;
