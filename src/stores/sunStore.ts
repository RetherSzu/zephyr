import * as THREE from 'three';
import { create } from 'zustand';

/**
 * Shape of the sun store: the current sun **direction** as a unit vector,
 * produced by `SunSystem` and consumed by `Sun`, the grass shader and the
 * `<Sky>` in `App`.
 */
interface SunState {
    /** Current sun direction, a unit vector (magnitude carries no meaning). */
    sunDirection: THREE.Vector3;

    /** Replaces the current sun direction. */
    update: (sunDirection: THREE.Vector3) => void;
}

/**
 * Zustand store holding the single source of truth for the sun direction. Read
 * imperatively via `useSunStore.getState()` inside render loops.
 */
export const useSunStore = create<SunState>(set => ({
    sunDirection: new THREE.Vector3(),

    update: sunDirection => {
        set({
            sunDirection,
        });
    },
}));
