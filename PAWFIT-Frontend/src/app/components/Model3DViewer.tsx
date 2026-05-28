import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';
import { AlertCircle } from 'lucide-react';

interface Model3DViewerProps {
  modelUrl: string;
  scale?: number;
  autoRotate?: boolean;
  className?: string;
}

function Model({ url, scale = 1 }: { url: string; scale: number }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={scale} />;
}

export function Model3DViewer({
  modelUrl,
  scale = 1,
  autoRotate = true,
  className = 'w-full h-96'
}: Model3DViewerProps) {
  if (!modelUrl) {
    return (
      <div className={`${className} border border-[#E8E4DF] rounded-lg flex items-center justify-center bg-[#FAF7F2]`}>
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#C4714A]" />
          <p className="text-sm text-[#6B5D56]">Enter a model URL to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} border border-[#E8E4DF] rounded-lg overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#F5F1ED]`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#C4714A" />
            </mesh>
          }
        >
          <Model url={modelUrl} scale={scale} />
        </Suspense>

        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={4}
          enableZoom={true}
          enablePan={true}
        />
      </Canvas>
    </div>
  );
}
