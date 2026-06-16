attribute float branchDepth;
attribute float branchDistance;

// To fragment shader
varying float vHeight;
varying float vBranchDepth;
varying float vMaxDepth;
varying vec3 vNormal;

// From cpu
uniform float time;
uniform float maxDepth;
uniform float maxDistance;

void main() {
    vHeight = uv.y;
    vMaxDepth = maxDepth;
    vBranchDepth = branchDepth;
    vNormal = normal;

    float windInfluence = branchDistance / maxDistance;
    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    float phase = worldPos.x * 0.5 + worldPos.z * 0.5;
    float wave = sin(time * 0.5 + phase) * 0.1;

    vec3 windDir = normalize(vec3(1.0, 0.0, 0.3));
    vec3 displacement = windDir * wave * windInfluence;
    vec3 newPos = position + displacement;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(newPos, 1.0);
}