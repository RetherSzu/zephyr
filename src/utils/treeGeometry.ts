// R3F
import { lerp } from 'three/src/math/MathUtils.js';
import { BranchNode, TreeOptions } from '@/types/tree';
import { BufferGeometry, BufferAttribute, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// utils
import { createPRNG } from '@/utils/prng';

export function buildBranch(
    parent: BranchNode | null,
    start: Vector3,
    direction: Vector3,
    length: number,
    radius: number,
    depth: number,
    maxDepth: number,
    lengthRatio: number,
    radiusRatio: number,
    taper: number,
    childrenPerNode: number,
    angle: number,
    rng: () => number,
): BranchNode {
    const end: Vector3 = new Vector3().addVectors(
        start,
        direction.clone().multiplyScalar(length),
    );
    const node: BranchNode = {
        parent: parent,
        start: start,
        end: end,
        startRadius: radius,
        endRadius: depth === 0 ? radius * radiusRatio : radius * radiusRatio,
        depth: depth,
        children: [],
    };

    if (depth >= maxDepth) {
        return node;
    }

    for (let i: number = 0; i < childrenPerNode; ++i) {
        const forward: Vector3 = direction.clone();
        let right: Vector3 = new Vector3();
        if (depth == 0) {
            right.crossVectors(forward, new Vector3(1, 0, 0)).normalize();
        } else {
            right.crossVectors(forward, new Vector3(0, 1, 0)).normalize();
        }

        const up: Vector3 = new Vector3()
            .crossVectors(forward, right)
            .normalize();
        const rotationAngle: number = rng() * 2 * Math.PI;
        const branchAngle: number = (angle * Math.PI) / 180;
        const tiltDir: Vector3 = new Vector3()
            .addVectors(
                right.clone().multiplyScalar(Math.cos(rotationAngle)),
                up.clone().multiplyScalar(Math.sin(rotationAngle)),
            )
            .normalize();
        const childDir: Vector3 = new Vector3().addVectors(
            forward.clone().multiplyScalar(Math.cos(branchAngle)),
            tiltDir.clone().multiplyScalar(Math.sin(branchAngle)),
        );

        const newLength = length * lengthRatio;
        const newRadius = radius * radiusRatio;
        const childNode = buildBranch(
            node,
            end,
            childDir,
            newLength,
            newRadius,
            depth + 1,
            maxDepth,
            lengthRatio,
            radiusRatio,
            taper,
            childrenPerNode,
            angle,
            rng,
        );
        node.children.push(childNode);
    }

    return node;
}

export function generateTree(options: TreeOptions): BufferGeometry {
    const rng = createPRNG(options.seed);
    const start = new Vector3(0, 0, 0);
    const direction = new Vector3(0, 1, 0);
    const branchNode: BranchNode = buildBranch(
        null,
        start,
        direction,
        options.trunk.height,
        options.trunk.radius,
        0,
        options.branch.levels,
        options.branch.lengthRatio,
        options.branch.radiusRatio,
        options.trunk.taper,
        options.branch.childrenPerNode,
        options.branch.angle,
        rng,
    );

    const geometries: BufferGeometry[] = generateBranchGeometry(
        branchNode,
        options.geometry.heightSegments,
        options.geometry.radialSegments,
    );
    const geometry = mergeGeometries(geometries);

    return geometry;
}

export function generateBranchGeometry(
    node: BranchNode,
    heightSegments: number,
    radialSegments: number,
): BufferGeometry[] {
    const count = heightSegments * radialSegments;

    const positions: Float32Array = new Float32Array(count * 3);
    const normals: Float32Array = new Float32Array(count * 3);
    const uvs: Float32Array = new Float32Array(count * 2);
    const indices: Uint32Array = new Uint32Array(
        (heightSegments - 1) * radialSegments * 6,
    );

    const direction: Vector3 = new Vector3()
        .subVectors(node.end, node.start)
        .normalize();

    let right: Vector3 = new Vector3();
    const forward: Vector3 = direction.clone();
    const dot: number = new Vector3(0, 1, 0).dot(direction);
    if (dot >= 0.99 || dot <= -0.99) {
        right.crossVectors(forward, new Vector3(1, 0, 0)).normalize();
    } else {
        right.crossVectors(forward, new Vector3(0, 1, 0)).normalize();
    }
    const up: Vector3 = new Vector3().crossVectors(forward, right).normalize();

    for (let i = 0; i < heightSegments; ++i) {
        const heightRatio = i / (heightSegments - 1);
        const center = new Vector3().lerpVectors(
            node.start,
            node.end,
            heightRatio,
        );
        const radius = lerp(node.startRadius, node.endRadius, heightRatio);

        for (let j = 0; j < radialSegments; ++j) {
            const angle = (j / radialSegments) * 2 * Math.PI;
            const offset = right
                .clone()
                .multiplyScalar(Math.cos(angle))
                .multiplyScalar(radius)
                .add(
                    up
                        .clone()
                        .multiplyScalar(Math.sin(angle))
                        .multiplyScalar(radius),
                );
            const vertexPos = center.clone().add(offset);

            positions[(i * radialSegments + j) * 3] = vertexPos.x;
            positions[(i * radialSegments + j) * 3 + 1] = vertexPos.y;
            positions[(i * radialSegments + j) * 3 + 2] = vertexPos.z;

            uvs[(i * radialSegments + j) * 2] = j / radialSegments;
            uvs[(i * radialSegments + j) * 2 + 1] = heightRatio;

            const normalVec = right
                .clone()
                .multiplyScalar(Math.cos(angle))
                .add(up.clone().multiplyScalar(Math.sin(angle)))
                .normalize();

            normals[(i * radialSegments + j) * 3] = normalVec.x;
            normals[(i * radialSegments + j) * 3 + 1] = normalVec.y;
            normals[(i * radialSegments + j) * 3 + 2] = normalVec.z;
        }
    }

    for (let i = 0; i < heightSegments - 1; ++i) {
        for (let j = 0; j < radialSegments; ++j) {
            const bottomLeft = i * radialSegments + j;
            const bottomRight = i * radialSegments + ((j + 1) % radialSegments);
            const topLeft = (i + 1) * radialSegments + j;
            const topRight =
                (i + 1) * radialSegments + ((j + 1) % radialSegments);

            indices[(i * radialSegments + j) * 6] = bottomLeft;
            indices[(i * radialSegments + j) * 6 + 1] = bottomRight;
            indices[(i * radialSegments + j) * 6 + 2] = topRight;

            indices[(i * radialSegments + j) * 6 + 3] = bottomLeft;
            indices[(i * radialSegments + j) * 6 + 4] = topRight;
            indices[(i * radialSegments + j) * 6 + 5] = topLeft;
        }
    }

    // Create empty buffer
    const geometry = new BufferGeometry();
    // Fill geometry attributes (position, normal, uv and index)
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
    geometry.setIndex(new BufferAttribute(indices, 1));

    const geometries: BufferGeometry[] = [geometry];

    node.children.forEach(child => {
        const geos = generateBranchGeometry(
            child,
            heightSegments,
            radialSegments,
        );
        geos.forEach(geometry => {
            geometries.push(geometry);
        });
    });

    return geometries;
}
