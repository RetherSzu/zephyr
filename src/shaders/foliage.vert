// From cpu
uniform float time;

// To the fragment shader
varying mat4 vModelMatrix;
varying mat4 vInstanceMatrix;
varying vec3 vNormal;
varying vec3 vInstanceColor;

void main() {
    vModelMatrix = modelMatrix;
    vInstanceMatrix = instanceMatrix;
    vec3 transformedNormal = (modelMatrix * instanceMatrix * vec4(normal, 0.0)).xyz;
    vNormal = normalize(transformedNormal);
    vInstanceColor = instanceColor;
    vec3 instanceWorldPos = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

    float phase = instanceWorldPos.x * 0.5 + instanceWorldPos.z * 0.5;
    float wave = sin(time * 0.5 + phase) * 0.1;
    float windInfluence = 1.0;

    vec3 windDir = normalize(vec3(1.0, 0.0, 0.3));
    vec3 windDisplacement = windDir * wave * windInfluence;
    vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
    worldPosition.xyz += windDisplacement;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}