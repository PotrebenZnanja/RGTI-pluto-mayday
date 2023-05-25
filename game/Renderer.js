import * as WebGL from './WebGL.js';
import shaderManager from './shaderManager.js';
import Light from './Light.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;
const mat3 = glMatrix.mat3;

// ce po spremembah s poskusi brisanja modelov tukaj kaj ne deluje tej datoteki zal ni vec pomoci, might as well downloadas staro
// ceprav imam obcutek da mi je ratalo zakomentirati zadeve

export default class Renderer {

    constructor(gl) {
        this.gl = gl;

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        //"ok" shaderji:
        //shaders
        //shaders14
        this.programs = WebGL.buildPrograms(gl, shaderManager.shaders);

        this.defaultTexture = WebGL.createTexture(gl, {
            width  : 1,
            height : 1,
            data   : new Uint8Array([255, 255, 255, 255])

        });
    }

    //////////////////////////////////////////// V REDU

    prepare(scene) {
        scene.nodes.forEach(node => {
            /*if(node.number == -1){
                return;
            }*/
            node.gl = {};
            if (node.mesh) {
                Object.assign(node.gl, this.createModel(node.mesh));
            }
            if (node.image) {
                node.gl.texture = this.createTexture(node.image);
            }
            if(node.number == -1){
                node.gl = null;
            }
        });
    }

    prepareExtras(scene){
        //console.log(this.gl.getContext());

        scene.nodes.forEach(node => {
            /*if(node.number == -1){
                return;
            }*/
            /*if(node.number == -1){
                console.log("tukaj");
                node.gl = null;
                return;
                // to je tak zalostno....
            }*/
            if(!node.gl){
                node.gl = {};
                if (node.mesh) {
                    // SKOPIRA THIS.CREATEMODEL VSEBINO V node.gl
                    Object.assign(node.gl, this.createModel(node.mesh));
                }
                if (node.image) {
                    // NASTAVI TEKSTURO OD node.gl
                    node.gl.texture = this.createTexture(node.image);
                }
            }
            /*else{
                console.log("???");
            }*/
        });
    }

    /////////////////////////////////////////// V REDU

    render(scene, camera, light) {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //V SHADERJJU "phong" je v EXPORTU
        const program = this.programs.phong;
        gl.useProgram(program.program);

        const defaultTexture = this.defaultTexture;
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(program.uniforms.uTexture, 0);

        let matrix = mat4.create();
        let matrixStack = [];

        //test za light direction
        //const lightDirection = vec3.set(vec3.create(),-30,-15,-30)

        //---DO NOT CHANGE
        const viewMatrix = camera.getGlobalTransform();
        mat4.invert(viewMatrix, viewMatrix);
        mat4.copy(matrix, viewMatrix);
        gl.uniformMatrix4fv(program.uniforms.uProjection, false, camera.projection);
        //---

        //test za light
        /*
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix,viewMatrix);
        mat4.transpose(normalMatrix,normalMatrix);
        */

        //TEST ZA FLASHLIGHT
        //let lightCounter = 0;
        //

        //LIGHT SETTINGS
        let color = vec3.clone(light.ambientColor);
        gl.uniform1f(program.uniforms.uAmbient, light.ambient);
        gl.uniform1f(program.uniforms.uDiffuse, light.diffuse);
        gl.uniform1f(program.uniforms.uSpecular, light.specular);
        gl.uniform1f(program.uniforms.uShininess, light.shininess);
        gl.uniform3fv(program.uniforms.uLightPosition, light.position);
        gl.uniform3fv(program.uniforms.uDiffuseColor, light.diffuseColor);
        vec3.scale(color, color, 1.0 / 255.0);
        gl.uniform3fv(program.uniforms.uLightColor,  color);
        gl.uniform3fv(program.uniforms.uAmbientColor, light.ambientColor)
        gl.uniform3fv(program.uniforms.uLightAttenuation, light.attenuation);
        //LIGHT OVER

        //let color = vec3.clone(light.ambientColor);
        /*
        vec3.scale(color, color, 1.0 / 255.0);
        gl.uniform3fv(program.uniforms.uAmbientColor, color);
        color = vec3.clone(light.diffuseColor);
        vec3.scale(color, color, 1.0 / 255.0);
        gl.uniform3fv(program.uniforms.uDiffuseColor, color);
        color = vec3.clone(light.specularColor);
        vec3.scale(color, color, 1.0 / 255.0);
        gl.uniform3fv(program.uniforms.uSpecularColor, color);
        gl.uniform1f(program.uniforms.uShininess, light.shininess);
        gl.uniform3fv(program.uniforms.uLightPosition, light.position);
        gl.uniform3fv(program.uniforms.uLightAttenuation, light.attenuatuion);
        */
        scene.traverse(
            node => {
                /*if(node.number == -1){
                    if(node.gl){
                        if(node.gl.vao){
                            gl.deleteVertexArray(node.gl.vao);
                        }

                    }
                    return;
                }*/
                /*if(node.number == -1){
                    //console.log("tud tu sem");
                    return;
                }*/
                //console.log(node.number);
                matrixStack.push(mat4.clone(matrix));
                //---FLASHLIGHT
                /*
                var normalMatrix = mat3.create();
                mat3.fromMat4(normalMatrix,matrix);
                mat3.invert(normalMatrix,normalMatrix);
                mat3.transpose(normalMatrix,normalMatrix);

                var lightDirection = [0,0,-1];
                var limit = 45*Math.PI/180;

                //---*/
                mat4.mul(matrix, matrix, node.transform);
                if (node.gl.vao) {
                    gl.bindVertexArray(node.gl.vao);
                    gl.uniformMatrix4fv(program.uniforms.uViewModel, false, matrix);
                   // gl.uniformMatrix4fv(program.uniforms.uNormalMatrix, false, normalMatrix);
                    //gl.uniform3fv(program.uniforms.uLight, lightDirection);
                    //gl.uniformMatrix3fv(program.uniforms.uNormalMatrix,false,normalMatrix);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, node.gl.texture);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                    gl.uniform1i(program.uniforms.uTexture, 0);
                    gl.drawElements(gl.TRIANGLES, node.gl.indices, gl.UNSIGNED_SHORT, 0);
                }
                //
                
               /* else if (node.model) {
                    gl.bindVertexArray(node.model.vao);
                    gl.uniformMatrix4fv(program.uniforms.uViewModel, false, matrix);
                    const texture = node.texture || defaultTexture;
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.drawElements(gl.TRIANGLES, node.model.indices, gl.UNSIGNED_SHORT, 0);
                }*/

                /*else if (node instanceof Light) {
                    let color = vec3.clone(node.ambientColor);
                    vec3.scale(color, color, 1.0 / 255.0);
                    gl.uniform3fv(program.uniforms['uAmbientColor[' + lightCounter + ']'], color);
                    color = vec3.clone(node.diffuseColor);
                    vec3.scale(color, color, 1.0 / 255.0);
                    gl.uniform3fv(program.uniforms['uDiffuseColor[' + lightCounter + ']'], color);
                    color = vec3.clone(node.specularColor);
                    vec3.scale(color, color, 1.0 / 255.0);
                    gl.uniform3fv(program.uniforms['uSpecularColor[' + lightCounter + ']'], color);
                    let position = [0,0,0];
                    if (lightCounter == 0){
                        mat4.getTranslation(position, matrix);
                        gl.uniform3fv(program.uniforms['uLightDirection'], lightDirection);
                        gl.uniform1f(program.uniforms['uLimit'], Math.cos(limit));
                    }
                    else
                        mat4.getTranslation(position, node.transform);

                    gl.uniform3fv(program.uniforms['uLightPosition[' + lightCounter + ']'], position);
                    gl.uniform1f(program.uniforms['uShininess[' + lightCounter + ']'], node.shininess);
                    gl.uniform3fv(program.uniforms['uLightAttenuation[' + lightCounter + ']'], node.attenuatuion);
                    
                    //lightCounter++;
                }*/
            },
            node => {
                /*if(node.number == -1){
                    return;
                }*/
                matrix = matrixStack.pop();
            }
        );
    }

    //flashlight
    /*prepareNode(node) {
        if(node.number == -1){
            return;
        }
        node.gl = {};
        if (node.mesh) {
            Object.assign(node.gl, this.createModel(node.mesh));
        }
        if (node.image) {
            node.gl.texture = this.createTexture(node.image);
        }
    }*/

    //////////////////////////////////////////////// ZGORAJ SPREMINJAJ

    createModel(model) {
        const gl = this.gl;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); //XYZ

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoords), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0); //XY na povrsino

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0); //XYZ normale na telo
        
        //console.log(model);
        /*
        gl.enableVertexAttribArray(0); //aPosition;
        gl.enableVertexAttribArray(1); //aNormal
        gl.enableVertexAttribArray(2); //aTexCoord

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
        */

        const indices = model.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);


        return { vao, indices };
    }

    //////////////////////////////////////////////// V REDU

    createTexture(texture) {
        const gl = this.gl;

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        // Then, we set the magnification filter. This filter is used when a
        // texel covers many pixels (when the image is upscaled).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // We also need to specify what happens when we sample the texture
        // outside the unit square. In our case we just repeat the texture.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);


        return WebGL.createTexture(gl, {
            image : texture,
            min   : gl.LINEAR,
            mag   : gl.LINEAR
        });
    }

    ///////////////////////////////////////////////// V REDU

    loadTexture(url, options, handler) {
        const gl = this.gl;

        let image = new Image();
        image.addEventListener('load', () => {
            const opts = Object.assign({ image }, options);
            handler(WebGL.createTexture(gl, opts));
        });
        image.src = url;
    }
}
