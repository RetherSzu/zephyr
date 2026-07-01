import * as THREE from 'three';

/**
 * Builds the geometry of a single grass blade: a tapered vertical strip of
 * `segments * 2 + 1` vertices — a left/right vertex pair per row, plus a single
 * apex vertex for the tip — with position, normal, uv and index buffers.
 *
 * @param segments - Number of horizontal rows (must be >= 2).
 * @param baseWidth - Blade width at the base (tapers to 0 at the tip).
 * @param height - Total height of the blade.
 * @param taperCurve - Exponent controlling how fast the width tapers toward the tip.
 * @returns A {@link THREE.BufferGeometry} for one blade, meant to be instanced.
 *
 * @remarks
 * Normals are flat (`+Z`); the shader reconstructs orientation. Height is eased
 * via `pow(heightRatio, 0.7)` and width via `taperCurve`. Throws if `segments < 2`.
 */
export function grassGeometry(
    segments: number = 7,
    baseWidth: number = 0.05,
    height: number = 1.0,
    taperCurve: number = 2.0,
): THREE.BufferGeometry {
    // Check if segments is valid
    if (segments < 2) throw new Error('segments must be >= 2');
    const count = segments * 2 + 1;

    const positions: Float32Array = new Float32Array(count * 3);
    const normals: Float32Array = new Float32Array(count * 3);
    const uvs: Float32Array = new Float32Array(count * 2);
    const indices: Uint16Array = new Uint16Array((count - 2) * 3);

    // Fill vertices positions
    for (let i = 0; i < segments; i++) {
        const heightRatio = i / segments;
        const yPosition = Math.pow(heightRatio, 0.7) * height;
        const widthRatio = 1 - Math.pow(heightRatio, taperCurve);
        const currentWidth = baseWidth * widthRatio;

        // Left
        positions[i * 6] = -currentWidth / 2;
        positions[i * 6 + 1] = yPosition;
        positions[i * 6 + 2] = 0;

        // Right
        positions[i * 6 + 3] = +currentWidth / 2;
        positions[i * 6 + 4] = yPosition;
        positions[i * 6 + 5] = 0;

        // Add normal (O, 0, 1)
        normals[i * 6] = 0;
        normals[i * 6 + 1] = 0;
        normals[i * 6 + 2] = 1;
        normals[i * 6 + 3] = 0;
        normals[i * 6 + 4] = 0;
        normals[i * 6 + 5] = 1;

        // Add uv
        uvs[i * 4] = 0;
        uvs[i * 4 + 1] = heightRatio;
        uvs[i * 4 + 2] = 1;
        uvs[i * 4 + 3] = heightRatio;
    }

    // Tip
    positions[positions.length - 3] = 0;
    positions[positions.length - 2] = height;
    positions[positions.length - 1] = 0;

    // Add normal (O, 0, 1)
    normals[normals.length - 3] = 0;
    normals[normals.length - 2] = 0;
    normals[normals.length - 1] = 1;

    // Add uvs
    uvs[uvs.length - 2] = 0.5;
    uvs[uvs.length - 1] = 1;

    // Fill indices
    for (let i = 0; i < segments - 1; i++) {
        const bottomLeft = i * 2;
        const bottomRight = i * 2 + 1;
        const topLeft = (i + 1) * 2;
        const topRight = (i + 1) * 2 + 1;

        indices[i * 6] = bottomLeft;
        indices[i * 6 + 1] = bottomRight;
        indices[i * 6 + 2] = topLeft;

        indices[i * 6 + 3] = bottomRight;
        indices[i * 6 + 4] = topRight;
        indices[i * 6 + 5] = topLeft;
    }

    // Tip
    const tipBase = (segments - 1) * 6;
    indices[tipBase + 0] = (segments - 1) * 2;
    indices[tipBase + 1] = (segments - 1) * 2 + 1;
    indices[tipBase + 2] = segments * 2;

    // Create empty buffer
    const geometry = new THREE.BufferGeometry();
    // Fill geometry attribute (position, normal, uv and index)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    return geometry;
}
