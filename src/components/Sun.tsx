import { JSX } from 'react';

// stores
import { useSunStore } from '@/stores/sunStore';

/**
 * Creates the scene's directional (sun) and ambient (fill) lights.
 *
 * The directional light is the main angled source that shades surfaces and casts
 * shadows; the ambient light lifts the shadows with a uniform fill so no face is
 * left completely black.
 *
 * The directional light's position is driven by {@link useSunStore}
 * (`sunDirection`, scaled out so its shadow camera frames the scene), keeping it
 * in sync with the `<Sky>` and the grass shader's sun direction.
 *
 * @component
 * @remarks
 * Required even though the grass lights itself in its shader: the terrain uses a
 * `meshStandardMaterial` and would render black without real scene lights.
 *
 * @returns {JSX.Element} A Fragment grouping a directional light and an ambient
 * light.
 */
export function Sun(): JSX.Element {
    const sunStore = useSunStore();
    return (
        <>
            <directionalLight
                args={[0xffffbb, 3]}
                position={sunStore.sunDirection.clone().multiplyScalar(50)}
            />
            <ambientLight args={[0xffffff]} />
        </>
    );
}
