// R3F
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// components
import { useTreeControls } from '@/components/TreeControls';

// shaders
import vertex from '@/shaders/tree.vert';
import fragment from '@/shaders/tree.frag';

// types
import { TreeOptions } from '@/types/tree';

// utils
import { generateTree } from '@/utils/treeGeometry';

export function Tree() {
    const params: TreeOptions = useTreeControls();
    const treeRef = useRef<THREE.Mesh>(null);
    const geometry = useMemo(() => {
        return generateTree(params);
    }, [params]);

    useFrame((state, _delta, _xrFrame) => {
        if (treeRef.current) {
            const shader: THREE.ShaderMaterial = treeRef.current
                .material as THREE.ShaderMaterial;
            shader.uniforms.time.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={treeRef}>
            <primitive object={geometry} attach="geometry" />
            <shaderMaterial
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={{ time: { value: 0 } }}
            />
        </mesh>
    );
}
