import { useGLTF, useTexture } from '@react-three/drei';
import { LinearEncoding, Mesh, MeshStandardMaterial, sRGBEncoding } from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface CookieProps {
  nodes: any;
  materials: any;
}

function Cookie(props: any) {
  const cookieRef = useRef<Mesh>(null);

  const texture = useTexture({
    map: '/models/cookie/cookie_4px_compressed.png',
    normalMap: '/models/cookie/cookie_normal_4px_compressed.png',
  });

  const { nodes }: CookieProps = useGLTF('/models/cookie/cookie.gltf');

  const chipMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: '#5b210f',
      metalness: 0,
      roughness: 0,
    });
  }, []);

  useFrame(({ mouse }) => {
    cookieRef.current!.rotation.x = mouse.y * 0.1;
    cookieRef.current!.rotation.y = -mouse.x * 0.1;
  });

  return (
    <group {...props} ref={cookieRef} dispose={null} position={[0, -1.25, 0]}>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[5, 0.1, 5]} />
        <shadowMaterial opacity={0.25} />
      </mesh>

      <mesh castShadow geometry={nodes.Cookie.geometry} rotation={[Math.PI, Math.PI / 2, 0]}>
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

            return <mesh key={node} {...n} geometry={n.geometry} material={chipMaterial} />;
          }

          return null;
        })}
      </mesh>
    </group>
  );
}

export default Cookie;
