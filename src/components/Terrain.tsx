import * as THREE from 'three';
import { useRef, useEffect } from 'react';
// utils
import { getHeight } from '@/utils/terrain';

/**
 * Generates a 10 x 10 horizontal terrain plane in Three.js and displaces each
 * vertex along its local Z-axis to simulate uneven ground.
 *
 * The plane is built with 128 x 128 segments, which produces
 * 129 x 129 = 16 641 vertices. Displacement runs once on mount via `useEffect`,
 * then normals are recomputed so lighting reflects the new relief.
 *
 * @remarks
 * Vertices are offset on the geometry's *local* Z (out-of-plane) axis. Because
 * the mesh is rotated -π/2 around X, that local Z becomes world Y (height) once
 * rendered. The height is sampled with `getHeight(x, y_local)`, and `y_local`
 * maps to `-worldZ` — the same `getHeight(x, -z)` convention used by `GrassField`
 * to keep the grass aligned with the ground. The material is a
 * `meshStandardMaterial`, so the terrain relies on the scene lights (see `Sun`)
 * to be visible.
 *
 * @performance
 * The displacement loop and `computeVertexNormals()` run once on the CPU at
 * mount. Raise the segment count for a smoother silhouette at the cost of a
 * heavier one-time build.
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
            const positions = g.getAttribute('position');

            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);

                // Based on the x, y coordinate of the vertex, retrieve the z
                // (height) coordinate for terrain elevation.
                const height = getHeight(x, y);
                positions.setZ(i, height);
            }

            // Flag the position attribute as dirty so Three.js re-uploads the
            // updated buffer to the GPU on the next render.
            positions.needsUpdate = true;
            // Recompute normals: vertices moved, so the old normals (flat plane)
            // no longer match the surface — without this, lighting ignores the
            // relief.
            g.computeVertexNormals();
        }
    }, []);

    return (
        <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10, 10, 128, 128]} />
            <meshStandardMaterial color="#895129" />
        </mesh>
    );
}
