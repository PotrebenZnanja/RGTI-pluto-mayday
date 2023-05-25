const vertex = `#version 300 es
precision mediump float;
layout (location = 0) in vec3 aPosition;
layout (location = 2) in vec2 aTexCoord;
layout (location = 1) in vec3 aNormal;

uniform mat4 uViewModel;
uniform mat4 uProjection;
uniform mat3 uNormalMatrix;
out vec3 vVertexPosition;
out vec3 vNormal;
out vec2 vTexCoord;

void main() {
    vVertexPosition = (uViewModel * vec4(aPosition, 1)).xyz;
    // vNormal = (uViewModel * vec4(aNormal, 0)).xyz;
    vNormal = uNormalMatrix * aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uProjection * vec4(vVertexPosition, 1);
}
`;

const fragment = `#version 300 es
precision mediump float;
uniform mat4 uViewModel;
uniform mat3 uNormalMatrix;
uniform mediump sampler2D uTexture;
uniform vec3 uAmbientColor[5];
uniform vec3 uDiffuseColor[5];
uniform vec3 uSpecularColor[5];
uniform float uShininess[5];
uniform vec3 uLightPosition[5];
uniform vec3 uLightAttenuation[5];
uniform vec3 uLightDirection;
uniform float uLimit;       // in dot space

in vec3 vVertexPosition;
in vec3 vNormal;
in vec2 vTexCoord;
out vec4 oColor;
void main() {
    oColor = vec4(0.0);

    vec3 lightPosition = uLightPosition[0];
    float d = distance(vVertexPosition, lightPosition);
    float attenuation = 1.0 / dot(uLightAttenuation[0] * vec3(1, d, d * d), vec3(1, 1, 1));
    vec3 N = normalize(vNormal);
    vec3 L = normalize(lightPosition - vVertexPosition);
    vec3 E = normalize(-vVertexPosition);
    vec3 R = normalize(reflect(-L, N));
    float lambert = 0.0;
    float phong = 0.0;
    float dotFromDirection = dot(L, -uLightDirection);
    if (dotFromDirection >= uLimit) {
        lambert = dot(L, N);
        if(lambert >= 0.0){
            phong = pow(max(0.0, dot(E, R)), uShininess[0]);
        }
    }
    vec3 ambient = uAmbientColor[0];
    vec3 diffuse = uDiffuseColor[0] * lambert;
    vec3 specular = uSpecularColor[0] * phong;
    vec3 light = (ambient + diffuse + specular) * attenuation;

    oColor += texture(uTexture, vTexCoord) * vec4(light, 1);
    
    for (int i = 1; i < 5; i++) {
        
        vec3 lightPosition = uLightPosition[i];
        float d = distance(vVertexPosition, lightPosition);
        float attenuation = 1.0 / dot(uLightAttenuation[i] * vec3(1, d, d * d), vec3(1, 1, 1));
        vec3 N = normalize(vNormal);
        vec3 L = normalize(lightPosition - vVertexPosition);
        vec3 E = normalize(-vVertexPosition);
        vec3 R = normalize(reflect(-L, N));
        float lambert = max(0.0, dot(L, N));
        float phong = pow(max(0.0, dot(E, R)), uShininess[i]);

        vec3 ambient = uAmbientColor[i];
        vec3 diffuse = uDiffuseColor[i] * lambert;
        vec3 specular = uSpecularColor[i] * phong;
        vec3 light = (ambient + diffuse + specular) * attenuation;
        
        oColor += texture(uTexture, vTexCoord) * vec4(light, 1);
    }
}
`;

export default {
    phong: { vertex, fragment }
};