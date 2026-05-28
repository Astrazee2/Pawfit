import { useEffect, useRef, useState } from 'react';
import { Breed } from '../types';

interface DogAvatar3DProps {
  breed: Breed;
  apparelColor?: string;
  apparelAsset?: string;
  viewAngle?: 'front' | 'side' | 'back' | 'top';
  onLoad?: () => void;
}

export function DogAvatar3D({ 
  breed, 
  apparelColor = '#3B82F6',
  apparelAsset,
  viewAngle = 'front',
  onLoad
}: DogAvatar3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamic import of Three.js to avoid SSR issues
    import('three').then((THREE) => {
      if (!containerRef.current) return;

      try {
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#FAF7F2');
        scene.fog = new THREE.Fog('#FAF7F2', 100, 1000);

        // Camera setup
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0.5, 2);
        camera.lookAt(0, 0, 0);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        containerRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Create placeholder dog body using primitives
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
          color: getBreedColor(breed),
          roughness: 0.6,
          metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0;
        body.castShadow = true;
        scene.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.7, 0.3);
        head.castShadow = true;
        scene.add(head);

        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.1, 0.6, 4, 8);
        const legs = [];
        const legPositions = [
          [-0.2, -0.4, 0.2],
          [0.2, -0.4, 0.2],
          [-0.2, -0.4, -0.2],
          [0.2, -0.4, -0.2]
        ];

        legPositions.forEach(([x, y, z]) => {
          const leg = new THREE.Mesh(legGeometry, bodyMaterial);
          leg.position.set(x, y, z);
          leg.castShadow = true;
          scene.add(leg);
          legs.push(leg);
        });

        // Tail
        const tailGeometry = new THREE.ConeGeometry(0.08, 0.5, 8);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(0, 0.1, -0.5);
        tail.rotation.z = Math.PI / 4;
        tail.castShadow = true;
        scene.add(tail);

        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshStandardMaterial({
          color: '#E8E4DF',
          roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.8;
        ground.receiveShadow = true;
        scene.add(ground);

        // Create apparel placeholder if needed
        if (apparelAsset || apparelColor) {
          const shirtGeometry = new THREE.BoxGeometry(0.7, 0.6, 0.35);
          const shirtMaterial = new THREE.MeshStandardMaterial({
            color: apparelColor,
            roughness: 0.5,
            metalness: 0.0
          });
          const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
          shirt.position.set(0, 0.15, 0.1);
          shirt.castShadow = true;
          shirt.receiveShadow = true;
          scene.add(shirt);
        }

        // Set camera position based on view angle
        const setCameraView = (angle: string) => {
          const distance = 2;
          const height = 0.8;
          switch (angle) {
            case 'front':
              camera.position.set(0, height, distance);
              break;
            case 'side':
              camera.position.set(distance, height, 0);
              break;
            case 'back':
              camera.position.set(0, height, -distance);
              break;
            case 'top':
              camera.position.set(0, distance + 1, 0.1);
              break;
          }
          camera.lookAt(0, 0.2, 0);
        };

        setCameraView(viewAngle);

        // Handle window resize
        const handleResize = () => {
          if (!containerRef.current) return;
          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        // Animation loop
        let animationId: number;
        const animate = () => {
          animationId = requestAnimationFrame(animate);

          // Gentle rotation
          body.rotation.y += 0.002;
          head.rotation.y += 0.002;
          tail.rotation.y += 0.002;
          legs.forEach(leg => {
            leg.rotation.y += 0.002;
          });

          renderer.render(scene, camera);
        };

        animate();
        setIsLoading(false);
        onLoad?.();

        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationId);
          if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
          bodyGeometry.dispose();
          bodyMaterial.dispose();
          legGeometry.dispose();
          tailGeometry.dispose();
          headGeometry.dispose();
          groundGeometry.dispose();
          groundMaterial.dispose();
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load 3D model');
      }
    });
  }, [breed, apparelAsset, apparelColor, viewAngle, onLoad]);

  const getBreedColor = (breed: Breed): string => {
    const colors: Record<Breed, string> = {
      'Labrador Retriever': '#8B6F47',
      'Shih Tzu': '#D4A574',
      'Dachshund': '#A0826D',
      'Pomeranian': '#C4A472',
      'Aspin/Mixed': '#9B8B7E'
    };
    return colors[breed];
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FAF7F2] via-[#F5EFE7] to-[#F0E8DD] rounded-2xl relative overflow-hidden shadow-inner">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3D2E] mx-auto mb-2"></div>
            <p className="text-[#6B5D56]">Loading 3D model...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-red-600 font-semibold">Error loading model</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ position: 'relative' }}
      />

      <div className="absolute bottom-4 left-4 text-xs text-[#8B7B74] bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5">
        {breed} - 3D Preview
      </div>
    </div>
  );
}
