import * as THREE from 'three';
import { useEffect } from 'react';
import { useControls } from 'leva';

// stores
import { useSunStore } from '@/stores/sunStore';

/**
 * Headless system that produces the sun direction from two angles.
 *
 * Owns the leva "Sun" controls (`elevation`, `azimuth`) and, whenever an angle
 * changes, converts them into a unit direction (spherical coordinates) stored in
 * {@link useSunStore}. That direction is the single source of truth consumed by
 * the `<Sky>`, the directional light (`Sun`) and the grass shader.
 *
 * @remarks
 * `elevation` is measured from the horizon, so it is converted to the polar
 * angle `phi = 90° - elevation`; both angles are passed in radians. The update
 * runs in a `useEffect` keyed on the angles (not `useFrame`), so the store — and
 * therefore the whole scene — only re-renders when a slider actually moves.
 *
 * @returns `null` — the visible sky is rendered from `App` using the store.
 */
export function SunSystem() {
    const params = useControls('Sun', {
        elevation: { value: 0, min: -5, max: 90 },
        azimuth: { value: 0, min: 0, max: 360 },
    });

    useEffect(() => {
        useSunStore
            .getState()
            .update(
                new THREE.Vector3().setFromSphericalCoords(
                    1,
                    (90 - params.elevation) * (Math.PI / 180),
                    params.azimuth * (Math.PI / 180),
                ),
            );
    }, [params.elevation, params.azimuth]);

    return null;
}
