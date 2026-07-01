import { create } from 'zustand';

/**
 * Shape of the wind store: the shared state produced by `WindSystem` and
 * consumed by the grass shader (through `GrassField`'s per-frame uniform sync).
 * Groups the animation time, the wind direction/speed/strength, the wave
 * (traveling gust) parameters, the noise/bend/dome parameters, the turbulence
 * parameters, and the per-frame derived values (`currentStrength`, `directionVec`).
 */
interface WindState {
    time: number;

    windDirection: number;
    windSpeed: number;
    windStrength: number;

    waveScale: number;
    waveSpeed: number;
    waveStrength: number;
    waveThreshold: number;
    waveWidth: number;

    noiseScale: number;
    directionVariation: number;
    bendAngle: number;
    domeStrength: number;

    turbScale: number;
    turbSpeed: number;
    turbAmount: number;

    gustAmount: number;
    gustFrequency: number;

    currentStrength: number;
    directionVec: [number, number];

    /**
     * Bulk setter called every frame by `WindSystem` with the freshly computed
     * wind values.
     */
    update: (
        time: number,
        currentStrength: number,
        directionVec: [number, number],
        noiseScale: number,
        windSpeed: number,
        directionVariation: number,
        bendAngle: number,
        domeStrength: number,

        waveScale: number,
        waveSpeed: number,
        waveStrength: number,
        waveThreshold: number,
        waveWidth: number,

        turbScale: number,
        turbSpeed: number,
        turbAmount: number,
    ) => void;
}

/**
 * Zustand store acting as the communication bus between the wind producer
 * (`WindSystem`) and its consumers. Read imperatively via
 * `useWindStore.getState()` inside render loops to avoid re-renders.
 */
export const useWindStore = create<WindState>(set => ({
    time: 0,

    windDirection: 0.0,
    windSpeed: 0.0,
    windStrength: 0.0,

    waveScale: 0.0,
    waveSpeed: 0.0,
    waveStrength: 0.0,
    waveThreshold: 0.0,
    waveWidth: 0.0,

    noiseScale: 0.0,
    directionVariation: 0.0,
    bendAngle: 0.0,
    domeStrength: 0.0,

    turbScale: 0.0,
    turbSpeed: 0.0,
    turbAmount: 0.0,

    gustAmount: 0.0,
    gustFrequency: 0.0,

    currentStrength: 0.0,
    directionVec: [0.0, 0.0],

    update: (
        time: number,
        currentStrength: number,
        directionVec: [number, number],
        noiseScale: number,
        windSpeed: number,
        directionVariation: number,
        bendAngle: number,
        domeStrength: number,

        waveScale: number,
        waveSpeed: number,
        waveStrength: number,
        waveThreshold: number,
        waveWidth: number,

        turbScale: number,
        turbSpeed: number,
        turbAmount: number,
    ) => {
        set({
            time,
            currentStrength,
            directionVec,
            noiseScale,
            windSpeed,
            directionVariation,
            bendAngle,
            domeStrength,

            waveScale,
            waveSpeed,
            waveStrength,
            waveThreshold,
            waveWidth,

            turbScale,
            turbSpeed,
            turbAmount,
        });
    },
}));
