// R3F
import * as THREE from 'three';

export interface BranchNode {
    start: THREE.Vector3;
    end: THREE.Vector3;
    startRadius: number;
    endRadius: number;
    depth: number;
    parent: BranchNode | null;
    children: BranchNode[];
}

export interface TreeOptions {
    seed: number;
    trunk: {
        height: number;
        radius: number;
        taper: number;
    };
    branch: {
        levels: number;
        childrenPerNode: number;
        angle: number;
        lengthRatio: number;
        radiusRatio: number;
        gnarliness: number;
    };
    geometry: {
        heightSegments: number;
        radialSegments: number;
    };
}
