import { useRef, useEffect } from 'react';

import * as THREE from 'three';

/**
 * Generates a 10 x 10 horizontal terrain plane in Three.js and displaces each
 * vertex along its local Z-axis to simulate uneven ground.
 *
 * The plane is built with 1000 x 1000 segments, which produces
 * 1001 x 1001 = 1 002 001 vertices. Displacement runs once on mount via
 * `useEffect`, then normals are recomputed so lighting reflects the new relief.
 *
 * @remarks
 * Vertices are offset on the geometry's *local* Z (out-of-plane) axis. Because
 * the mesh is rotated -π/2 around X, that local Z becomes world Y (height) once
 * rendered — a useful object-space vs. world-space distinction.
 *
 * @performance
 * ~1M vertices is heavy: the displacement loop and `computeVertexNormals()` run
 * on the CPU. Lower the segment count if you need a cheaper mesh.
 *
 * @returns {JSX.Element} A `<mesh>` holding the displaced plane geometry.
 *
 * @example
 * <Canvas>
 *   <color attach="background" args={['#192432']} />
 *   <OrbitControls />
 *   <GenerateTerrain />
 * </Canvas>
 */
export function GenerateTerrain() {
    const planeRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
        if (planeRef.current) {
            const g: THREE.BufferGeometry = planeRef.current.geometry;
            const p = g.getAttribute('position');

            // For each vertex, add a random offset in [-0.005, 0.005) to its
            // local Z, producing small bumps that read as uneven ground.
            for (let i = 0; i < p.count; i++) {
                const z = p.getZ(i) + 0.01 * (Math.random() - 0.5);
                p.setZ(i, z);
            }

            // Flag the position attribute as dirty so Three.js re-uploads the
            // updated buffer to the GPU on the next render.
            p.needsUpdate = true;
            // Recompute normals: vertices moved, so the old normals (flat plane)
            // no longer match the surface — without this, lighting ignores the
            // relief.
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
