// NE SPREMINJAJ ZA ZDAJ

const vertex = `#version 300 es
layout (location = 0) in vec4 aPosition;
layout (location = 2) in vec2 aTexCoord;
layout (location = 1) in vec4 aNormal;

uniform mat4 uViewModel;
uniform mat4 uProjection;
uniform vec3 uLightPosition;

/*
uniform float uAmbient;
uniform float uDiffuse;
uniform float uSpecular;

/*
uniform float uShininess;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform vec3 uLightAttenuation;
*/

out vec2 vTexCoord;
out vec3 vLightPos;
out vec3 vPosition;
out vec3 vNormal;

void main() {
    
    vec3 vertexPosition = (uViewModel * aPosition).xyz;
    vPosition = vertexPosition;
    /*
    vec3 lightPosition = (uViewModel * vec4(uLightPosition, 1)).xyz;
    float d = distance(vertexPosition, lightPosition);
    float attenuation = 1.0 / dot(uLightAttenuation * vec3(1, d, d * d), vec3(1, 1, 1));

    vec3 N = vec3(uViewModel * aNormal);
    vec3 L = normalize(lightPosition-vertexPosition);
    vec3 E = normalize(vertexPosition);
    vec3 R = normalize(reflect(-L, N));
    vNormal = N;
    float lambert = max(0.0, dot(L, N));
    float phong = pow(max(0.0, dot(E, R)), uShininess);

    float ambient = uAmbient;
    float diffuse = uDiffuse * lambert;
    float specular = uSpecular * phong;

    vLight = ((ambient + diffuse + specular) * attenuation) * uLightColor;
    */
    //vTexCoord = aTexCoord;
    vec3 vLightPos = (uViewModel * vec4(uLightPosition, 1)).xyz;

    vTexCoord = vec2(aTexCoord.x,aTexCoord.y*-1.0);
    gl_Position = uProjection * vec4(vertexPosition, 1);//uViewModel * aPosition;
    //vTexCoord = aTexCoord;
    //gl_Position = uProjection * vec4(vertexPosition, 1);
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;


uniform vec3 uDiffuseColor;
uniform vec3 uAmbientColor;
uniform float uShininess;

uniform float uAmbient;
uniform float uDiffuse;
uniform float uSpecular;

uniform vec3 uLightColor;
uniform vec3 uLightAttenuation;


in vec2 vTexCoord;
in vec3 vLightPos;
in vec3 vPosition;
in vec3 vNormal;

out vec4 oColor;

void main() {

    //ambient light
    //vec3 ambient = vec3(0.5,0.5,0.5);//*vLight;

    //vec3 lightPosition = (uViewModel * vec4(uLightPosition, 1)).xyz;
    float d = distance(vPosition, vLightPos);
    float attenuation = 1.0 / dot(uLightAttenuation * vec3(1, d, d * d), vec3(1, 1, 1));

    vec3 L = normalize(vLightPos-vPosition);
    vec3 E = normalize(vPosition);
    vec3 R = normalize(reflect(-L, vNormal));

    float lambert = max(0.0, dot(L, vNormal));
    float phong = pow(max(0.0, dot(E, R)), uShininess);

    float ambient = uAmbient;
    float diffuse = uDiffuse * lambert;
    float specular = uSpecular * phong;

    vec3 vLight = ((ambient + diffuse + specular) * attenuation) * uLightColor;
   

    //vLight = ((ambient + diffuse + specular) * attenuation) * uLightColor;

    //diffuse light
    /*vec3 posToLightDirVec = normalize(lightPos-vPosition);
    float diffuse = max(0.0, dot(posToLightDirVec, vNormal));
    vec3 diffuseFinal = diffuse*0.004*uDiffuseColor;*/

    oColor = texture(uTexture, vTexCoord)*vec4(vLight,1);//+vec4(diffuseFinal,1.0);//*(vec4(ambient,1));//+vec4(diffuseFinal,1.0));

    //oColor = texture(uTexture, vTexCoord) * vec4(vLight, 1);//*vec4(0.1,0.1,0.1,1);
    //oColor = texture(uTexture, vTexCoord);
}
`;


export default {
    phong : { vertex, fragment}
};

