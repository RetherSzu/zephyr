import { useMemo, useRef } from 'react';

import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useWindStore } from '@/stores/windStore';

/**
 * Debug helper that visualizes the current wind direction.
 *
 * Renders a {@link THREE.ArrowHelper} at a fixed corner of the field and, every
 * frame, re-orients it to the wind direction read from {@link useWindStore} (the
 * 2D `directionVec` is mapped onto the XZ plane).
 *
 * @remarks Purely a visual indicator — must live inside the `<Canvas>`.
 * @returns {JSX.Element} The arrow primitive.
 */
export function WindDirection() {
    const arrowRef = useRef<THREE.ArrowHelper>(null);
    const arrowGeo = useMemo(() => {
        const geo = new THREE.ArrowHelper();
        geo.position.set(6, 0, 6);
        return geo;
    }, []);

    useFrame((_state, _delta, _xrFrame) => {
        if (arrowRef.current) {
            const wind = useWindStore.getState();
            arrowRef.current.setDirection(
                new THREE.Vector3(
                    wind.directionVec[0],
                    0,
                    wind.directionVec[1],
                ),
            );
        }
    });

    return <primitive ref={arrowRef} object={arrowGeo} />;
}
