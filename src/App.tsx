// R3F
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Stats } from '@react-three/drei';

// components
import { Sun } from '@/components/Sun';
import { SunSystem } from '@/components/SunSystem';
import { WindSystem } from '@/components/WindSystem';
import { GrassField } from '@/components/GrassField';
import { GenerateTerrain } from '@/components/Terrain';
import { WindDirection } from '@/components/WindDirection';

// stores
import { useSunStore } from '@/stores/sunStore';

function App() {
    const sunStore = useSunStore();

    return (
        <Canvas
            style={{ aspectRatio: 1 / 1, width: '100%' }}
            camera={{ position: [10, 20, 10], fov: 60 }}
        >
            <color attach="background" args={['#192432']} />
            <Sun />
            <GenerateTerrain />
            <GrassField />
            <SunSystem />
            <WindSystem />
            <OrbitControls />
            <WindDirection />
            <Stats showPanel={0} />
            <Stats showPanel={1} className="panel1" />
            <Stats showPanel={2} className="panel2" />
            <Sky sunPosition={sunStore.sunDirection} />
        </Canvas>
    );
}

export default App;
