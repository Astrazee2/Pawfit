import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, ContactShadows, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Breed } from '../types';

interface DogAvatar3DProps {
  breed: Breed;
  apparelColor?: string;
  bodyModelUrl?: string;
  productModelUrl?: string;
}

function GlbModel({ url, position = [0, 0, 0], scale = 1 }: { url: string; position?: [number, number, number]; scale?: number }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} position={position} scale={scale} />;
}

function LoadingModel() {
  return (
    <Html center>
      <div className="rounded-lg bg-white/95 px-4 py-2 text-sm text-[#6B5D56] shadow-sm">
        Loading 3D model...
      </div>
    </Html>
  );
}

function PlaceholderPreview({ breed, apparelColor }: { breed: Breed; apparelColor: string }) {
  const breedSizes: Record<Breed, string> = {
    'Labrador Retriever': 'Large',
    'Shih Tzu': 'Small',
    'Dachshund': 'Medium',
    'Pomeranian': 'Small',
    'Aspin/Mixed': 'Medium',
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FAF7F2] via-[#F5EFE7] to-[#F0E8DD] rounded-2xl relative overflow-hidden shadow-inner">
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-5">
        {[...Array(64)].map((_, i) => (
          <div key={i} className="border border-[#5C3D2E]"></div>
        ))}
      </div>

      <div className="relative z-10 text-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-[#E8E4DF]">
          <p className="font-semibold text-lg text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>{breed}</p>
          <p className="text-sm text-[#6B5D56]">{breedSizes[breed]} Dog</p>
          <div className="mt-3 flex items-center justify-center gap-2 bg-[#F5EFE7] rounded-lg px-3 py-1.5">
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: apparelColor }}></div>
            <span className="text-xs text-[#6B5D56] font-medium">Upload body/product GLB assets to preview models</span>
          </div>
        </div>
        <div className="mt-4 text-xs text-[#6B5D56] bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 inline-block shadow-sm border border-[#E8E4DF]">
          3D Preview Mode
        </div>
      </div>
    </div>
  );
}

export function DogAvatar3D({ breed, apparelColor = '#3B82F6', bodyModelUrl, productModelUrl }: DogAvatar3DProps) {
  if (!bodyModelUrl && !productModelUrl) {
    return <PlaceholderPreview breed={breed} apparelColor={apparelColor} />;
  }

  return (
    <div className="w-full h-full bg-[#F5EFE7] rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 1.4, 4], fov: 42 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
        <Suspense fallback={<LoadingModel />}>
          <Center>
            {bodyModelUrl && <GlbModel url={bodyModelUrl} scale={1.4} />}
            {productModelUrl && <GlbModel url={productModelUrl} position={[0, 0.08, 0]} scale={1.4} />}
          </Center>
          <ContactShadows opacity={0.28} blur={2.5} position={[0, -1, 0]} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={7} />
      </Canvas>
    </div>
  );
}
