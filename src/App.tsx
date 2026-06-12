// R3F
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';

// components
import { Sun } from '@/components/Sun';
import { Tree } from '@/components/Tree';
import { GrassField } from '@/components/GrassField';
import { GenerateTerrain } from '@/components/Terrain';

function App() {
    return (
        <Canvas
            style={{ aspectRatio: 1 / 1, width: '100%' }}
            shadows
            camera={{ position: [3, 20, 3], fov: 60 }}
        >
            <color attach="background" args={['#192432']} />
            <Sun />
            <GenerateTerrain />
            <GrassField />
            <Tree />
            <OrbitControls />
            <axesHelper />
            <Stats showPanel={0} />
            <Stats showPanel={1} className="panel1" />
            <Stats showPanel={2} className="panel2" />
        </Canvas>
    );
}

export default App;
