// To fragment shader
varying float vHeight;
varying vec3 vInstanceColor;
varying vec3 vNormal;

// From cpu
uniform float time;
attribute vec3 instanceColor;

void main() {
    vHeight = uv.y;
    vInstanceColor = instanceColor;
    vec3 transformedNormal = (modelMatrix * instanceMatrix * vec4(normal, 0.0)).xyz;
    vNormal = normalize(transformedNormal);

    vec3 vPosition = position;
    vec3 worldPos = (modelMatrix * instanceMatrix * vec4(0,0,0,1)).xyz;

    float wave1 = sin(time * 0.5 + worldPos.x * 0.5) * 0.3;
    float wave2 = sin(time * 2.0 + worldPos.z * 1.0) * 0.1;
    float wave3 = sin(time * 1.3 + worldPos.x * 0.8) * 0.15;
    float displacement = (wave1 + wave2 + wave3) * vHeight;

    // worldpos
    gl_Position = modelMatrix * instanceMatrix * vec4(vPosition, 1.0);
    // Add wave
    gl_Position.x += displacement;
    gl_Position.z += displacement;
    // Final position
    gl_Position = projectionMatrix * viewMatrix * gl_Position;
}