const vertex = `#version 300 es
layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoord;

uniform mat4 uViewModel;
uniform mat4 uProjection;
uniform vec3 uLightPosition;
uniform vec3 uLightAttenuation;

out vec3 vPosition;
out vec3 vLight;
out vec3 vNormal;
out vec2 vTexCoord;

void main() {
    vPosition = (uViewModel * vec4(aPosition, 1)).xyz;
    vec3 lightPosition = (uViewModel * vec4(uLightPosition, 1)).xyz;
    vLight = lightPosition - vPosition;
    vNormal = mat3(uViewModel) * aNormal;
    vTexCoord = vec2(aTexCoord.x,aTexCoord.y*-1.0);//* -1.0);

    gl_Position = uProjection *uViewModel* vec4(aPosition, 1);
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

uniform vec3 uLightColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;
uniform float uAmbient;
uniform vec3 lightPos;

uniform float uShininess;

in vec3 vPosition;
in vec3 vLight;
in vec3 vNormal;
in vec2 vTexCoord;

out vec4 oColor;

void main() {
    //ambient light
    vec3 ambient = uLightColor*uAmbient;

    //diffuse light
    vec3 posToLightDirVec = normalize(vPosition - lightPos);
    float diffuse = dot(posToLightDirVec, vNormal);
    if(diffuse<0.0)
        diffuse=1.0;
    vec3 diffuseFinal = diffuse*uDiffuseColor;

    oColor = texture(uTexture, vTexCoord)*vec4(ambient,1.0)+vec4(diffuseFinal,1.0);
}
`;

export default {
    phong: { vertex, fragment }
};
