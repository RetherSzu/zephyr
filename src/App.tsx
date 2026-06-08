import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';

import { Sun } from '@/components/Sun';
import { GrassField } from '@/components/GrassField';
import { GenerateTerrain } from '@/components/Terrain';

function App() {
    return (
        <Canvas
            style={{ aspectRatio: 1 / 1, width: '100%' }}
            shadows
            camera={{ position: [0.5, 0.5, 0.5], fov: 60 }}
        >
            <color attach="background" args={['#192432']} />
            <Sun />
            <GenerateTerrain />
            <GrassField />
            <OrbitControls />
            <axesHelper />
            <Stats showPanel={0} />
            <Stats showPanel={1} className="panel1" />
            <Stats showPanel={2} className="panel2" />
        </Canvas>
    );
}

export default App;
