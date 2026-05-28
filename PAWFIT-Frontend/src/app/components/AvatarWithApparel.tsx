import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { Group } from 'three';

interface AvatarWithApparelProps {
  avatarUrl?: string;
  apparelUrl?: string;
  breed?: string;
  scale?: number;
  apparelScale?: number;
  className?: string;
}

function Avatar({ url, scale = 1 }: { url: string; scale: number }) {
  const { scene } = useGLTF(url);
  const ref = useRef<Group>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
    }
  });

  return <primitive ref={ref} object={scene} scale={scale} />;
}

function Apparel({ url, scale = 1 }: { url: string; scale: number }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={scale} />;
}

export function AvatarWithApparel({
  avatarUrl,
  apparelUrl,
  breed = 'Unknown',
  scale = 1,
  apparelScale = 1,
  className = 'w-full h-96'
}: AvatarWithApparelProps) {
  if (!avatarUrl) {
    return (
      <div className={`${className} border border-[#E8E4DF] rounded-lg flex flex-col items-center justify-center bg-[#FAF7F2]`}>
        <AlertCircle className="w-8 h-8 mb-2 text-[#C4714A]" />
        <p className="text-sm text-[#6B5D56]">No avatar available</p>
        <p className="text-xs text-[#8B7B74]">Breed: {breed}</p>
      </div>
    );
  }

  return (
    <div className={`${className} border border-[#E8E4DF] rounded-lg overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#F5F1ED]`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 3, 5]} intensity={0.4} color="#FFB6C1" />
        
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#C4714A" wireframe />
            </mesh>
          }
        >
          {/* Avatar */}
          <Avatar url={avatarUrl} scale={scale} />
          
          {/* Apparel overlay */}
          {apparelUrl && (
            <Apparel url={apparelUrl} scale={apparelScale} />
          )}
        </Suspense>

        <OrbitControls
          autoRotate={!apparelUrl}
          autoRotateSpeed={2}
          enableZoom={true}
          enablePan={true}
        />
      </Canvas>
    </div>
  );
}
