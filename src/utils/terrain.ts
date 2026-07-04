import { createNoise2D } from 'simplex-noise';

// utils
import { createPRNG } from '@/utils/prng';

/**
 * Seeded 2D simplex noise generator. The fixed seed (`1234`) makes the whole
 * terrain deterministic — same seed, same relief on every reload.
 */
const noise2D = createNoise2D(createPRNG(1234));

/**
 * Fractal Brownian motion (fBm) parameters for the terrain height field.
 *
 * @property octaves     - Number of noise layers summed together.
 * @property lacunarity  - Frequency multiplier between octaves (higher = finer detail).
 * @property persistence - Amplitude multiplier between octaves (lower = smoother relief).
 * @property scale       - Base frequency (small values = large, broad hills).
 * @property heightScale - Overall amplitude of the relief.
 */
const TERRAIN_PARAMS = {
    octaves: 4,
    lacunarity: 2.0,
    persistence: 0.4,
    scale: 0.1,
    heightScale: 0.5,
};

/**
 * Shared terrain height function — the single source of truth for both the
 * terrain mesh (`GenerateTerrain`) and grass placement (`GrassField`).
 *
 * Sums {@link TERRAIN_PARAMS.octaves} octaves of simplex noise (fBm) to produce
 * a smooth, deterministic height at any point of the plane.
 *
 * @param x - World-plane X coordinate.
 * @param z - World-plane Z coordinate.
 * @returns The terrain height (world Y) at `(x, z)`.
 *
 * @remarks
 * The terrain mesh is rotated -π/2 around X, so callers sampling by world
 * position must use the `getHeight(x, -z)` convention (see `GrassField` and
 * `Terrain`).
 */
export function getHeight(x: number, z: number): number {
    let height = 0;
    let amplitude = 1;
    let frequency = 1;

    for (let i = 0; i < TERRAIN_PARAMS.octaves; i++) {
        height +=
            noise2D(
                x * frequency * TERRAIN_PARAMS.scale,
                z * frequency * TERRAIN_PARAMS.scale,
            ) * amplitude;
        frequency *= TERRAIN_PARAMS.lacunarity; // 2.0
        amplitude *= TERRAIN_PARAMS.persistence; // 0.5
    }

    return height * TERRAIN_PARAMS.heightScale;
}
