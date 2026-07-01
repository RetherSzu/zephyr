/**
 * Creates a deterministic pseudo-random number generator (mulberry32).
 *
 * @param seed - Numeric seed. The same seed always yields the same sequence,
 * keeping procedural placement (grass, etc.) reproducible across reloads.
 * @returns A function returning floats in the range `[0, 1)`.
 */
export function createPRNG(seed: number): () => number {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Draws a float within a range from a generator.
 *
 * @param rng - A generator produced by {@link createPRNG}.
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (exclusive).
 * @returns A float in `[min, max)`.
 */
export function randomRange(
    rng: () => number,
    min: number,
    max: number,
): number {
    return rng() * (max - min) + min;
}

/**
 * Draws an integer within an inclusive range from a generator.
 *
 * @param rng - A generator produced by {@link createPRNG}.
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 * @returns An integer in `[min, max]`.
 */
export function randomInt(rng: () => number, min: number, max: number): number {
    return Math.floor(rng() * (max - min + 1)) + min;
}
