varying mat4 vModelMatrix;
varying mat4 vInstanceMatrix;
varying vec3 vNormal;
varying vec3 vInstanceColor;

void main (void) {
    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));

    float diffuse = max(dot(vNormal, lightDir), 0.0);
    float levels = 2.0;
    float celShade = floor(diffuse * levels) / levels;

    vec3 finalColor = vInstanceColor * (celShade * 0.85 + 0.15);

    gl_FragColor = vec4(finalColor, 1.0);
}