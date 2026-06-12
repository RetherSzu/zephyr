// leva
import { folder, useControls } from 'leva';

// types
import { TreeOptions } from '@/types/tree';

export function useTreeControls(): TreeOptions {
    const params = useControls({
        seed: { value: 12345, min: 0, max: 99999, step: 1 },
        trunk: folder({
            height: { value: 5, min: 1, max: 15 },
            radius: { value: 0.4, min: 0.1, max: 1 },
            taper: { value: 0.7, min: 0.1, max: 1 },
        }),
        branch: folder({
            levels: { value: 2, min: 0, max: 4, step: 1 },
            childrenPerNode: { value: 3, min: 1, max: 5, step: 1 },
            angle: { value: 50, min: 10, max: 90, step: 1 },
            lengthRatio: { value: 0.7, min: 0, max: 1, step: 0.1 },
            radiusRatio: { value: 0.7, min: 0, max: 1, step: 0.1 },
            gnarliness: { value: 0, min: 0, max: 1, step: 0.1 },
        }),
        geometry: folder({
            heightSegments: { value: 8, min: 2, max: 10, step: 1 },
            radialSegments: { value: 8, min: 2, max: 10, step: 1 },
        }),
    });

    const options: TreeOptions = {
        seed: params.seed,
        trunk: {
            height: params.height,
            radius: params.radius,
            taper: params.taper,
        },
        branch: {
            levels: params.levels,
            childrenPerNode: params.childrenPerNode,
            angle: params.angle,
            lengthRatio: params.lengthRatio,
            radiusRatio: params.radiusRatio,
            gnarliness: params.gnarliness,
        },
        geometry: {
            heightSegments: params.heightSegments,
            radialSegments: params.radialSegments,
        },
    };

    return options;
}
