#include "noise2D.glsl";

attribute float aClumpAngle;
attribute vec2 aClumpCenter;
attribute float aClumpDist;
attribute float aAccent;

uniform float uTime;

// Wave
uniform float uWaveScale;
uniform float uWaveSpeed;
uniform float uWaveThreshold;
uniform float uWaveWidth;
uniform float uWaveStrength;

uniform vec2 uWindDirection;
uniform float uWindSpeed;
uniform float uWindStrength;
uniform float uNoiseScale;
uniform float uDirectionVariation;
uniform float uBendAngle;
uniform float uDomeStrength;

uniform float uTurbScale;
uniform float uTurbSpeed;
uniform float uTurbAmount;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPos;
varying float vAccent;
varying vec3 vPosition;

mat3 rotateAxis(vec3 axis, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    float t = 1.0 - c;
    float x = axis.x;
    float y = axis.y;
    float z = axis.z;
    return mat3(t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c);
}

void main() {
    vUv = uv;
    vPosition = position;
    vec3 worldPos = (modelMatrix * instanceMatrix * vec4(0, 0, 0, 1)).xyz;
    vWorldPos = worldPos;
    vAccent = aAccent;

    // Set height factor
    float heightFactor = mix(1.0, 1.3, aAccent);
    vPosition.y *= heightFactor;

    vec2 wavePos = worldPos.xz * uWaveScale + uWindDirection * uTime * uWaveSpeed;
    float distortion = snoise(worldPos.xz * 0.5) * 0.5;
    wavePos += distortion;
    float waveNoise = snoise(wavePos);

    float wave = smoothstep(uWaveThreshold, uWaveThreshold + uWaveWidth, waveNoise);

    vec2 samplePos = worldPos.xz * uNoiseScale + uWindDirection * uTime * uWindSpeed;

    float dirNoise = snoise(samplePos * 0.5 + 100.0);
    float angleOffset = dirNoise * uDirectionVariation;
    float c = cos(angleOffset);
    float s = sin(angleOffset);
    mat2 rot = mat2(c, s, -s, c);
    vec2 localDir = rot * uWindDirection;

    float windNoise = snoise(samplePos) * 0.6 + snoise(samplePos * 2.5) * 0.3 + snoise(samplePos * 5.0) * 0.1;
    float falloff = pow(vUv.y, 1.5);
    float localWave = remap(windNoise, -1.0, 1.0, 0.3, 1.0);
    localWave = pow(localWave, 2.0);
    float gustBoost = wave * uWaveStrength;
    float totalWave = (localWave + gustBoost) * uWindStrength;

    float phaseScale = 0.5;
    float swayFreq = 2.0;
    float phase = (worldPos.x + worldPos.z) * phaseScale;
    float sign = sin(uTime * swayFreq + phase);
    float oscil = totalWave * 0.4;
    float pench = totalWave * 0.6;
    float fact = pench + oscil * sign;

    float angle = fact * uBendAngle * falloff;
    angle = min(angle, 1.4);
    vec3 axis = normalize(vec3(-localDir.y, 0.0, localDir.x));
    c = cos(angle);
    s = sin(angle);
    float t = 1.0 - c;
    float x = axis.x;
    float y = axis.y;
    float z = axis.z;
    mat3 R = mat3(t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c);
    c = cos(aClumpAngle);
    s = sin(aClumpAngle);
    mat3 clumpRot = mat3(c, 0, s, 0, 1, 0, -s, 0, c);
    vec3 domeAxis = normalize(vec3(-aClumpCenter.y, 0, aClumpCenter.x));
    float domeAngle = aClumpDist * uDomeStrength * falloff;
    mat3 domeRot = rotateAxis(domeAxis, domeAngle);
    vec3 bentPos = R * domeRot * clumpRot * vPosition;

    vec3 transformedNormal = (modelMatrix * instanceMatrix * vec4(R * domeRot * clumpRot * normal, 0.0)).xyz;
    vNormal = normalize(transformedNormal);

    float tipMask = smoothstep(0.7, 1.0, vUv.y);

    vec2 turbPos = worldPos.xz * uTurbScale + uTime * uTurbSpeed;
    float turbX = snoise(turbPos);
    float turbZ = snoise(turbPos + 50.0);

    vec2 turbulence = vec2(turbX, turbZ) * uTurbAmount * tipMask;

    bentPos.xz += turbulence;

    gl_Position = modelMatrix * instanceMatrix * vec4(bentPos, 1.0);
    gl_Position = projectionMatrix * viewMatrix * gl_Position;
}