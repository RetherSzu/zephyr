import { useControls } from 'leva';
import { useFrame } from '@react-three/fiber';

// stores
import { useWindStore } from '@/stores/windStore';

/**
 * Headless system that produces the wind state each frame.
 *
 * Owns the leva "Wind" controls and, on every frame, derives the current wind
 * from them — strength modulated by gusts and lulls, direction slowly drifting —
 * then writes it into {@link useWindStore}. Consumers (the grass shader, via
 * `GrassField`) read the store; this component renders nothing.
 *
 * @remarks
 * Model: `currentStrength = (windStrength + gustAmount * gust) * calm`, where
 * `gust` blends two sines into `[0, 1]` and `calm` is a slow sine remapped to
 * `[calmMin, 1]`. The direction is the base angle (degrees → radians) plus a
 * drift sine, converted to a unit XZ vector. Must live inside the `<Canvas>`
 * (uses `useFrame`).
 *
 * @returns `null` — no visual output.
 */
export function WindSystem() {
    const params = useControls('Wind', {
        windDirection: { value: 0, min: 0, max: 360 },
        windStrength: { value: 0.5, min: 0, max: 1.0 },
        windSpeed: { value: 0.5, min: 0.1, max: 1 },
        bendAngle: { value: 0.8, min: 0.0, max: 1.0 },
        domeStrength: { value: 0.05, min: 0.0, max: 1.0 },

        gustAmount: { value: 0.5, min: 0, max: 2 },
        gustFrequency: { value: 1, min: 0, max: 5 },

        driftSpeed: { value: 0.15, min: 0, max: 0.5 },
        driftAmount: { value: 0.2, min: 0, max: 0.5 },

        waveScale: { value: 0.08, min: 0.0, max: 0.1 },
        waveSpeed: { value: 0.15, min: 0.0, max: 1.0 },
        waveStrength: { value: 0.4, min: 0.0, max: 1.0 },
        waveThreshold: { value: 0.1, min: 0.0, max: 1.0 },
        waveWidth: { value: 0.3, min: 0.0, max: 1.0 },

        noiseScale: { value: 0.3, min: 0.1, max: 5 },
        directionVariation: { value: 0.3, min: 0.1, max: 5 },

        calmSpeed: { value: 0.04, min: 0, max: 0.2 },
        calmMin: { value: 0.3, min: 0, max: 1 },

        turbScale: { value: 0.1, min: 0.0, max: 1.0 },
        turbSpeed: { value: 0.5, min: 0.0, max: 1.0 },
        turbAmount: { value: 0.03, min: 0.0, max: 0.1 },
    });

    useFrame(state => {
        const time: number = state.clock.getElapsedTime();

        let gust =
            Math.sin(time * params.gustFrequency) * 0.6 +
            Math.sin(time * params.gustFrequency * 1.7) * 0.4;
        gust = gust * 0.5 + 0.5;
        gust = Math.pow(gust, 0.5);

        let currentStrength = params.windStrength + params.gustAmount * gust;

        let calm = Math.sin(time * params.calmSpeed) * 0.5 + 0.5;
        calm = params.calmMin + calm * (1.0 - params.calmMin);
        currentStrength *= calm;

        const baseAngle = (params.windDirection * Math.PI) / 180;
        const drift = Math.sin(time * params.driftSpeed) * params.driftAmount;
        const finalAngle = baseAngle + drift;
        const dirVec: [number, number] = [
            Math.cos(finalAngle),
            Math.sin(finalAngle),
        ];

        useWindStore.getState().update(
            time,

            currentStrength,
            dirVec,
            params.noiseScale,
            params.windSpeed,
            params.directionVariation,
            params.bendAngle,
            params.domeStrength,

            params.waveScale,
            params.waveSpeed,
            params.waveStrength,
            params.waveThreshold,
            params.waveWidth,

            params.turbScale,
            params.turbSpeed,
            params.turbAmount,
        );
    });

    return null;
}
