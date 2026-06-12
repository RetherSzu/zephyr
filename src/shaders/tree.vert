// To fragment shader
varying float vHeight;

// From cpu
uniform float time;

void main() {
    vHeight = uv.y;

    float wave = sin(time * 0.4) * 0.1;
    float windInfluence = pow(vHeight, 2.5);
    float displacement = wave * windInfluence;

    // worldpos
    gl_Position = modelMatrix * vec4(position, 1.0);
    // Add wave
    gl_Position.x += displacement;
    gl_Position.z += displacement;
    // Final position
    gl_Position = projectionMatrix * viewMatrix * gl_Position;
}