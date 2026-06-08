varying float vHeight;
varying vec3 vInstanceColor;
varying vec3 vNormal;

void main (void) {
    vec3 baseColor = mix(vec3(0.1, 0.3, 0.05), vec3(0.5, 0.8, 0.2), vHeight);
    vec3 finalColor = baseColor * vInstanceColor;

    vec3 sunDirection = normalize(vec3(1.0, 1.0, 0.5));
    float light = max(dot(vNormal, sunDirection), 0.0);
    float ambient = 0.3;
    float totalLight = ambient + light * 0.7;

    finalColor = baseColor * totalLight * vInstanceColor;

    float ao = mix(0.5, 1.0, vHeight);
    finalColor *= ao;
    gl_FragColor = vec4(finalColor, 1.0);
}