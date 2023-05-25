const vertex = `#version 300 es
layout (location = 0) in vec4 aPosition;
layout (location = 2) in vec2 aTexCoord;
layout (location = 1) in vec3 aNormal;

uniform mat4 uNormalMatrix;
uniform mat4 uViewModel;
uniform mat4 uProjection;
uniform vec3 uLight;

out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vLight;
out vec3 vEye;

void main() {
    vTexCoord = aTexCoord;
    vLight = (uViewModel * vec4(uLight, 1)).xyz;
    vNormal = (uNormalMatrix * vec4(aNormal, 1.0)).xyz;
    vec3 vertexPosition = vec3((uViewModel * aPosition).xyz);
    vEye = -vertexPosition;
    vLight = vLight - vertexPosition;

    gl_Position = uProjection * vec4(vertexPosition, 1);
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;
uniform float uAmbient;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vLight;
in vec3 vEye;

out vec4 oColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vLight);
    vec3 E = normalize(vEye);
    vec3 R = normalize(reflect(-L, N));
    float lambert = max(0.0, dot(L, N));
    float phong = pow(max(0.0, dot(E, R)), 10.0);
    float ambient = uAmbient;
    // cel shading
    if (lambert < 0.05) {
        lambert = 0.0;
    }
    else if (lambert < 0.7) {
        lambert = 0.6;
    }
    else if (lambert < 0.9) {
        lambert = 0.8;
    }
    else {
        lambert = 0.95;
    }
    lambert = lambert + 0.05;

    // cel shading
    if (phong < 0.6) {
        phong = 0.0;
    }
    else if (phong < 0.7) {
        phong = 0.1;
    }
    else if (phong < 0.9) {
        phong = 0.4;
    }
    else {
        phong = 1.0;
    }
    phong = (ambient+phong)*0.9;

    
    float light = lambert + phong;

    oColor = texture(uTexture, vTexCoord) * vec4(light, light, light, 1);
}
`;

export default {
    phong: { vertex, fragment}
};