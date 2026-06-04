import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import { Sun } from '@/components/Sun';
import { GenerateTerrain } from '@/components/Terrain';

function App() {
    return (
        <Canvas
            style={{ aspectRatio: 1 / 1, width: '100%' }}
            shadows
            camera={{ position: [5, 5, 5], fov: 60 }}
        >
            <color attach="background" args={['#000']} />
            <Sun />
            <GenerateTerrain />
            <OrbitControls />
            <axesHelper />
        </Canvas>
    );
}

export default App;
