uniform vec3 uSunDirection;

varying vec3 vNormal;
varying vec2 vUv;
// World position of the current blade.
varying vec3 vWorldPos;
// To know if the current blade is an accent one (much taller than otherblades).
varying float vAccent;
varying float vBiomeNoise;

void main(void) {
    // Retrieve the simplex 2D noise based on the x, z coordinate of the worldpos
    // from the vertex shader
    float biomeNoise = vBiomeNoise;

    // Remap the simplex noise from [-1, 1] to [0, 1].
    float biomeBlend = biomeNoise * 0.5 + 0.5;

    // Define the base and tip colours for each biome
    vec3 dry = vec3(0.18, 0.26, 0.06);
    vec3 dryTip = vec3(0.62, 0.66, 0.24);
    vec3 lush = vec3(0.10, 0.30, 0.05);
    vec3 lushTip = vec3(0.45, 0.78, 0.22);
    vec3 cold = vec3(0.06, 0.20, 0.08);
    vec3 coldTip = vec3(0.25, 0.50, 0.20);

    // Since the mix function only takes two parameters but we have 3 different
    // colours we need to create 3 gradients based on the vUv.
    vec3 gradientDry = mix(dry, dryTip, vUv.y);
    vec3 gradientLush = mix(lush, lushTip, vUv.y);
    vec3 gradientCold = mix(cold, coldTip, vUv.y);

    // Then we mix our gradients to create the base colour.
    vec3 dryToLush = mix(gradientDry, gradientLush, clamp(biomeBlend * 2.0, 0.0, 1.0));
    vec3 lushToCold = mix(gradientLush, gradientCold, clamp((biomeBlend - 0.5) * 2.0, 0.0, 1.0));
    vec3 baseColor = mix(dryToLush, lushToCold, step(0.5, biomeBlend));

    // Finally we apply vAccent to tint the blade if it is an accent one.
    vec3 baseColorAccent = mix(baseColor, dry, vAccent * vUv.y);

    vec3 N = normalize(mix(gl_FrontFacing ? vNormal : -vNormal, vec3(0.0, 1.0, 0.0), 0.6));
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(uSunDirection);
    vec3 colorTransition = vec3(0.3, 0.6, 0.15);
    float distortion = 0.4;
    float power = 3.0;
    float scale = 1.0;
    float thickness = vUv.y;
    vec3 H = normalize(L + N * distortion);
    float trans = pow(clamp(dot(V, -H), 0.0, 1.0), power) * scale;

    float light = dot(N, L) * 0.5 + 0.5;
    float ambient = 0.3;
    float totalLight = ambient + light * 0.7;

    vec3 finalColor = baseColorAccent * totalLight;
    float ao = mix(0.5, 1.0, vUv.y);
    finalColor *= ao;
    finalColor += trans * thickness * colorTransition;

    gl_FragColor = vec4(finalColor, 1.0);
}