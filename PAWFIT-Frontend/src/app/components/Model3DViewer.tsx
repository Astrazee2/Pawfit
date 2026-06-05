import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Component, ReactNode, Suspense, useMemo } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { resolveBackendAssetUrl } from '../services/models';

interface Model3DViewerProps {
  modelUrl: string;
  scale?: number;
  autoRotate?: boolean;
  className?: string;
}

interface ViewerErrorBoundaryProps {
  children: ReactNode;
  className: string;
  resetKey: string;
}

interface ViewerErrorBoundaryState {
  hasError: boolean;
}

class ViewerErrorBoundary extends Component<ViewerErrorBoundaryProps, ViewerErrorBoundaryState> {
  state: ViewerErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ViewerErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: ViewerErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`${this.props.className} border border-[#E8E4DF] rounded-lg flex items-center justify-center bg-[#FAF7F2]`}>
          <div className="text-center px-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#C4714A]" />
            <p className="text-sm text-[#6B5D56]">3D model unavailable</p>
            <p className="text-xs text-[#8B7B74] mt-1">The model file could not be loaded.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Model({ url, scale = 1 }: { url: string; scale: number }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={clonedScene} scale={scale} />;
}

function LoadingModel() {
  return (
    <Html center>
      <div className="text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-[#C4714A]" />
        <p className="text-sm text-[#6B5D56]">Loading 3D model...</p>
      </div>
    </Html>
  );
}

export function Model3DViewer({
  modelUrl,
  scale = 1,
  autoRotate = true,
  className = 'w-full h-96'
}: Model3DViewerProps) {
  const resolvedModelUrl = resolveBackendAssetUrl(modelUrl);

  if (!resolvedModelUrl) {
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
    <ViewerErrorBoundary className={className} resetKey={resolvedModelUrl}>
      <div className={`${className} border border-[#E8E4DF] rounded-lg overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#F5F1ED] relative`}>
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-5, 5, 5]} intensity={0.5} />

          <Suspense fallback={<LoadingModel />}>
            <Model url={resolvedModelUrl} scale={scale} />
          </Suspense>

          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enableZoom={true}
            enablePan={true}
            enableDamping={true}
          />
        </Canvas>
      </div>
    </ViewerErrorBoundary>
  );
}
