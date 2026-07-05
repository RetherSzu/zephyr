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

uniform vec2 uColorSeed;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPos;
varying float vAccent;
varying float vBiomeNoise;

const vec3 WIND_OCTAVE_WEIGHTS = vec3(0.6, 0.3, 0.1);
const float PHASE_SCALE = 0.5;
const float SWAY_FREQ = 2.0;
const float SWAY_OSCIL_WEIGHT = 0.4;
const float SWAY_LEAN_WEIGHT = 0.6;

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
    vec3 worldPos = (modelMatrix * instanceMatrix * vec4(0, 0, 0, 1)).xyz;
    vWorldPos = worldPos;
    vBiomeNoise = snoise(worldPos.xz * 0.3 + uColorSeed);
    vAccent = aAccent;

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

    float windNoise = snoise(samplePos) * WIND_OCTAVE_WEIGHTS.x + snoise(samplePos * 2.5) * WIND_OCTAVE_WEIGHTS.y + snoise(samplePos * 5.0) * WIND_OCTAVE_WEIGHTS.z;
    float falloff = pow(vUv.y, 1.5);
    float localWave = remap(windNoise, -1.0, 1.0, 0.3, 1.0);
    localWave = pow(localWave, 2.0);
    float gustBoost = wave * uWaveStrength;
    float totalWave = (localWave + gustBoost) * uWindStrength;

    float phase = (worldPos.x + worldPos.z) * PHASE_SCALE;
    float sign = sin(uTime * SWAY_FREQ + phase);
    float oscil = totalWave * SWAY_OSCIL_WEIGHT;
    float pench = totalWave * SWAY_LEAN_WEIGHT;
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
    vec3 bentPos = R * domeRot * clumpRot * position;

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