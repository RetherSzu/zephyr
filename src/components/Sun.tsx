import { JSX } from 'react';

/**
 * Creates directional and ambient lights so the scene's geometry becomes
 * visible.
 *
 * The directional light provides a main, angled light source that casts shading
 * across surfaces, while the ambient light lifts the shadows with a uniform
 * fill so no face is left completely black.
 *
 * @component
 * @returns {JSX.Element} A Fragment grouping a directional light and an ambient
 * light.
 *
 * @example
 * <Canvas>
 *   <color attach="background" args={['#192432']} />
 *   <OrbitControls />
 *   <Sun />
 * </Canvas>
 */
export function Sun(): JSX.Element {
    return (
        <>
            <directionalLight args={[0xffffbb, 3]} position={[5, 10, 5]} />
            <ambientLight args={[0xffffff]} />
        </>
    );
}
