// R3F
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// components
import { useTreeControls } from '@/components/TreeControls';

// shaders
import treeVertex from '@/shaders/tree.vert';
import treeFragment from '@/shaders/tree.frag';
import foliageVertex from '@/shaders/foliage.vert';
import foliageFragment from '@/shaders/foliage.frag';

// types
import { TreeOptions } from '@/types/tree';

// utils
import {
    buildSkeleton,
    createFoliage,
    generateTreeGeometry,
    collectFoliagePositions,
    expandToClusters,
    findMaxDistance,
} from '@/utils/treeGeometry';
import { createPRNG } from '@/utils/prng';

export function Tree() {
    const params: TreeOptions = useTreeControls();
    const treeRef = useRef<THREE.Mesh>(null);
    const foliageRef = useRef<THREE.InstancedMesh>(null);
    const [treeGeo, foliagePositions, count, rng, maxDistance] = useMemo(() => {
        const rng = createPRNG(params.seed);
        const skeleton = buildSkeleton(params, rng);
        const geo = generateTreeGeometry(
            skeleton,
            params.geometry.heightSegments,
            params.geometry.radialSegments,
        );
        const positions = collectFoliagePositions(skeleton, []);
        const positionsExpand = expandToClusters(positions, 5, 0.3, rng);
        const maxDistance = findMaxDistance(skeleton);

        return [geo, positionsExpand, positionsExpand.length, rng, maxDistance];
    }, [params]);

    useEffect(() => {
        if (foliageRef.current) {
            createFoliage(foliagePositions, foliageRef.current, rng);
        }
        treeRef.current?.geometry.dispose();
        foliageRef.current?.dispose();
    }, [foliagePositions]);

    useFrame((state, _delta, _xrFrame) => {
        if (treeRef.current) {
            const shader: THREE.ShaderMaterial = treeRef.current
                .material as THREE.ShaderMaterial;
            shader.uniforms.time.value = state.clock.getElapsedTime();
            shader.uniforms.maxDepth.value = params.branch.levels;
            shader.uniforms.maxDistance.value = maxDistance;
        }

        if (foliageRef.current) {
            const shader: THREE.ShaderMaterial = foliageRef.current
                .material as THREE.ShaderMaterial;
            shader.uniforms.time.value = state.clock.getElapsedTime();
        }
    });

    return (
        <group>
            <mesh ref={treeRef}>
                <primitive object={treeGeo} attach="geometry" />
                <shaderMaterial
                    vertexShader={treeVertex}
                    fragmentShader={treeFragment}
                    uniforms={{
                        time: { value: 0 },
                        maxDepth: { value: params.branch.levels },
                        maxDistance: { value: maxDistance },
                    }}
                />
            </mesh>
            <instancedMesh
                ref={foliageRef}
                args={[undefined, undefined, count]}
                key={count}
                frustumCulled={false}
            >
                <sphereGeometry args={[0.4, 8, 6]} />
                <shaderMaterial
                    vertexShader={foliageVertex}
                    fragmentShader={foliageFragment}
                    uniforms={{
                        time: { value: 0 },
                    }}
                />
            </instancedMesh>
        </group>
    );
}
