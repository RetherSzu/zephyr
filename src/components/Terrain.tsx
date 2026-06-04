import { useRef, useEffect } from 'react';

import * as THREE from 'three';

export function GenerateTerrain() {
    const planeRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
        if (planeRef.current) {
            const g = planeRef.current.geometry;
            const p = g.getAttribute('position');

            for (let i = 0; i < p.count; i++) {
                const z = p.getZ(i) + 0.01 * (Math.random() - 0.5);
                p.setZ(i, z);
            }

            p.needsUpdate = true;
            g.computeVertexNormals();
        }
    }, []);

    return (
        <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10, 10, 1000, 1000]} />
            <meshStandardMaterial color="#895129" />
        </mesh>
    );
}
