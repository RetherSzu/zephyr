import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
// shaders
import vertex from '@/shaders/grass.vert';
import fragment from '@/shaders/grass.frag';
// stores
import { useWindStore } from '@/stores/windStore';
// utils
import { getHeight } from '@/utils/terrain';
import { useSunStore } from '@/stores/sunStore';
import { grassGeometry } from '@/utils/grassGeometry';

/** Number of blades along one side of the square field. */
const BLADES_PER_ROW = 400;
/** World size (units) of the field; centered on the origin, spanning `[-GRID_SIZE / 2, +GRID_SIZE / 2]`. */
const GRID_SIZE = 10;
/** Total number of instanced blades (`BLADES_PER_ROW²`). */
const BLADE_COUNT = BLADES_PER_ROW * BLADES_PER_ROW;

/**
 * Deterministic hash placing a Voronoï cell's seed point.
 *
 * @param cellX - Integer X index of the cell.
 * @param cellZ - Integer Z index of the cell.
 * @returns A pseudo-random `[sx, sz]` in `[0, 1)²` (a hash, decorrelated between
 * neighbouring cells — not smooth noise).
 */
function hashToSeed(cellX: number, cellZ: number): [number, number] {
    const sx = fract(Math.sin(cellX * 127.1 + cellZ * 311.7) * 43758.5453);
    const sz = fract(Math.sin(cellX * 269.5 + cellZ * 183.3) * 43758.5453);
    return [sx, sz];
}

/**
 * Deterministic hash for a cell's orientation.
 *
 * @param cellX - Integer X index of the cell.
 * @param cellZ - Integer Z index of the cell.
 * @returns A pseudo-random scalar in `[0, 1)`, scaled by the caller (× 2π) into a
 * clump orientation angle.
 */
function hashToAngle(cellX: number, cellZ: number) {
    return fract(Math.sin(cellX * 419.2 + cellZ * 371.9) * 43758.5453);
}

/**
 * Fractional part of a number (`v - floor(v)`); the building block of the hashes
 * above.
 */
function fract(v: number) {
    return v - Math.floor(v);
}

/**
 * Renders the full instanced grass field.
 *
 * On mount it builds a single blade geometry, instantiates {@link BLADE_COUNT}
 * blades on a jittered grid, snaps each blade to the terrain height
 * ({@link getHeight}), and computes per-blade **Voronoï clump** data (orientation
 * plus a per-blade yaw offset, direction to the clump centre, normalized
 * distance) so blades group into tufts. About 5% of blades are flagged as taller
 * "accent" blades. All of this is uploaded as instanced attributes.
 *
 * Every frame it syncs the wind ({@link useWindStore}) and sun
 * ({@link useSunStore}) values into the shader uniforms. All animation and
 * lighting happen in the shaders (`grass.vert` / `grass.frag`).
 *
 * @remarks
 * The mount-time placement loop is heavy (~{@link BLADE_COUNT} blades, each with
 * a 3×3 Voronoï neighbour search) and runs synchronously — expect a brief hitch.
 *
 * @returns {JSX.Element} The instanced mesh of grass.
 */
export function GrassField() {
    const fieldRef = useRef<THREE.InstancedMesh>(null);
    const geometry = useMemo(() => {
        return grassGeometry(7, 0.02, 0.5, 2.0);
    }, []);

    useEffect(() => {
        if (fieldRef.current) {
            const dummy = new THREE.Object3D();
            const voronoiIdArray = new Float32Array(BLADE_COUNT);
            const clumpCenterArray = new Float32Array(BLADE_COUNT * 2);
            const clumpDistArry = new Float32Array(BLADE_COUNT);
            const aAccent = new Float32Array(BLADE_COUNT);

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
                    const finalY = getHeight(finalX, -finalZ);
                    dummy.position.set(finalX, finalY, finalZ);
                    dummy.scale.setScalar(0.8 + Math.random() * 0.4);
                    dummy.updateMatrix();

                    const size = 0.1;
                    const cellX = Math.floor(finalX / size);
                    const cellZ = Math.floor(finalZ / size);
                    let bestDist = 99999;
                    let bestCellX = 0;
                    let bestCellZ = 0;
                    let bestSeedX = 0;
                    let bestSeedZ = 0;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            const neighbourX = cellX + di;
                            const neighbourZ = cellZ + dj;
                            const [sx, sz] = hashToSeed(neighbourX, neighbourZ);
                            const seedPosX = (neighbourX + sx) * size;
                            const seedPosZ = (neighbourZ + sz) * size;
                            const dx = finalX - seedPosX;
                            const dz = finalZ - seedPosZ;
                            const dist = dx * dx + dz * dz;

                            if (dist < bestDist) {
                                bestDist = dist;
                                bestCellX = neighbourX;
                                bestCellZ = neighbourZ;
                                bestSeedX = seedPosX;
                                bestSeedZ = seedPosZ;
                            }
                        }
                    }

                    const toCenterX = bestSeedX - finalX;
                    const tocenterZ = bestSeedZ - finalZ;

                    clumpCenterArray[(i * BLADES_PER_ROW + j) * 2] = toCenterX;
                    clumpCenterArray[(i * BLADES_PER_ROW + j) * 2 + 1] =
                        tocenterZ;

                    clumpDistArry[i * BLADES_PER_ROW + j] =
                        Math.sqrt(bestDist) / size;

                    const aClumpAngle =
                        hashToAngle(bestCellX, bestCellZ) * (2 * Math.PI);
                    const offset = hashToAngle(i, j) * 2 - 1;
                    voronoiIdArray[i * BLADES_PER_ROW + j] =
                        aClumpAngle + offset * 0.5;

                    fieldRef.current.setMatrixAt(
                        i * BLADES_PER_ROW + j,
                        dummy.matrix,
                    );

                    aAccent[i * BLADES_PER_ROW + j] =
                        Math.random() < 0.05 ? 1.0 : 0.0;
                }
            }

            geometry.setAttribute(
                'aClumpAngle',
                new THREE.InstancedBufferAttribute(voronoiIdArray, 1),
            );

            geometry.setAttribute(
                'aClumpCenter',
                new THREE.InstancedBufferAttribute(clumpCenterArray, 2),
            );

            geometry.setAttribute(
                'aClumpDist',
                new THREE.InstancedBufferAttribute(clumpDistArry, 1),
            );

            geometry.setAttribute(
                'aAccent',
                new THREE.InstancedBufferAttribute(aAccent, 1),
            );

            fieldRef.current.instanceMatrix.needsUpdate = true;
            geometry.attributes.aClumpAngle.needsUpdate = true;
            geometry.attributes.aClumpCenter.needsUpdate = true;
            geometry.attributes.aClumpDist.needsUpdate = true;
            geometry.attributes.aAccent.needsUpdate = true;
        }
    }, []);

    useFrame((_state, _delta, _xrFrame) => {
        if (fieldRef.current) {
            const wind = useWindStore.getState();
            const sun = useSunStore.getState();

            const shader: THREE.ShaderMaterial = fieldRef.current
                .material as THREE.ShaderMaterial;
            shader.uniforms.uTime.value = wind.time;
            shader.uniforms.uSunDirection.value = sun.sunDirection;

            shader.uniforms.uWaveScale.value = wind.waveScale;
            shader.uniforms.uWaveSpeed.value = wind.waveSpeed;
            shader.uniforms.uWaveStrength.value = wind.waveStrength;
            shader.uniforms.uWaveThreshold.value = wind.waveThreshold;
            shader.uniforms.uWaveWidth.value = wind.waveWidth;

            shader.uniforms.uWindDirection.value.set(
                wind.directionVec[0],
                wind.directionVec[1],
            );
            shader.uniforms.uWindSpeed.value = wind.windSpeed;
            shader.uniforms.uWindStrength.value = wind.currentStrength;

            shader.uniforms.uNoiseScale.value = wind.noiseScale;
            shader.uniforms.uDirectionVariation.value = wind.directionVariation;
            shader.uniforms.uBendAngle.value = wind.bendAngle;
            shader.uniforms.uDomeStrength.value = wind.domeStrength;

            shader.uniforms.uTurbScale.value = wind.turbScale;
            shader.uniforms.uTurbSpeed.value = wind.turbSpeed;
            shader.uniforms.uTurbAmount.value = wind.turbAmount;
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
                uniforms={{
                    uTime: { value: 0 },
                    uSunDirection: { value: new THREE.Vector3() },

                    uWaveScale: { value: 0.08 },
                    uWaveSpeed: { value: 0.15 },
                    uWaveThreshold: { value: 0.1 },
                    uWaveWidth: { value: 0.3 },
                    uWaveStrength: { value: 0.4 },

                    uWindDirection: { value: new THREE.Vector2() },
                    uWindSpeed: { value: 0.4 },
                    uWindStrength: { value: 0.15 },

                    uNoiseScale: { value: 0.15 },
                    uDirectionVariation: { value: 0.3 },
                    uBendAngle: { value: 0.8 },
                    uDomeStrength: { value: 0.5 },

                    uTurbScale: { value: 0.1 },
                    uTurbSpeed: { value: 0.5 },
                    uTurbAmount: { value: 0.03 },
                }}
            />
        </instancedMesh>
    );
}
