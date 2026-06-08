import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { grassGeometry } from '@/utils/grassGeometry';

// shaders
import vertex from '@/shaders/grass.vert';
import fragment from '@/shaders/grass.frag';
import { useFrame } from '@react-three/fiber';

const BLADES_PER_ROW = 400;
const GRID_SIZE = 10;
const BLADE_COUNT = BLADES_PER_ROW * BLADES_PER_ROW;

export function GrassField() {
    const fieldRef = useRef<THREE.InstancedMesh>(null);
    const geometry = useMemo(() => {
        const geo = grassGeometry(7, 0.02, 0.5, 2.0);
        const colorArray = new Float32Array(BLADE_COUNT * 3);

        for (let i = 0; i < BLADE_COUNT; i++) {
            const variation = 0.85 + Math.random() * 0.3;
            colorArray[i * 3] = variation;
            colorArray[i * 3 + 1] = variation;
            colorArray[i * 3 + 2] = variation;
        }

        geo.setAttribute(
            'instanceColor',
            new THREE.InstancedBufferAttribute(colorArray, 3),
        );

        return geo;
    }, []);

    useEffect(() => {
        if (fieldRef.current) {
            const dummy = new THREE.Object3D();

            for (let i = 0; i < BLADES_PER_ROW; i++) {
                for (let j = 0; j < BLADES_PER_ROW; j++) {
                    const spacing = GRID_SIZE / BLADES_PER_ROW;
                    const jitterAmount = spacing * 0.4;

                    const basePosX =
                        (i / BLADES_PER_ROW) * GRID_SIZE - GRID_SIZE / 2;
                    const basePosZ =
                        (j / BLADES_PER_ROW) * GRID_SIZE - GRID_SIZE / 2;

                    const jitterX = (Math.random() - 0.5) * jitterAmount;
                    const jitterZ = (Math.random() - 0.5) * jitterAmount;

                    const finalX = basePosX + jitterX;
                    const finalZ = basePosZ + jitterZ;
                    dummy.position.set(finalX, 0, finalZ);
                    dummy.rotation.y = Math.random() * Math.PI * 2;
                    dummy.scale.setScalar(0.8 + Math.random() * 0.4);
                    dummy.updateMatrix();

                    fieldRef.current.setMatrixAt(
                        i * BLADES_PER_ROW + j,
                        dummy.matrix,
                    );
                }
            }

            fieldRef.current.instanceMatrix.needsUpdate = true;
        }
    }, []);

    useFrame((state, _delta, _xrFrame) => {
        if (fieldRef.current) {
            const shader: THREE.ShaderMaterial = fieldRef.current
                .material as THREE.ShaderMaterial;
            shader.uniforms.time.value = state.clock.getElapsedTime();
        }
    });

    return (
        <instancedMesh
            ref={fieldRef}
            args={[undefined, undefined, BLADE_COUNT]}
        >
            <primitive
                object={geometry}
                attach="geometry"
                frustumCulled={false}
            />
            <shaderMaterial
                vertexShader={vertex}
                fragmentShader={fragment}
                side={THREE.DoubleSide}
                uniforms={{ time: { value: 0 } }}
            />
        </instancedMesh>
    );
}
