import Node from './Node.js';
import Utils from './Utils.js';

export default class Light extends Node {

    /*
    constructor() {
        super();

        Object.assign(this, {
            position         : [2, 3, 2],

            ambient          : 0.2,
            diffuse          : 0.8,
            specular         : 1,

            ambientColor     : [64, 64, 128],
            diffuseColor     : [204, 204, 204],
            specularColor    : [255, 255, 255],

            attenuatuion     : [1.0, 0, 0.0002],
            shininess        : 1
        });
    }
*/
    constructor(options) {
        
        super(options);
        Utils.init(this, Light.defaults, options);
        //console.log(this.position);
        }


};

Light.defaults = {
        position         : [7, 4, 7],
        ambient          : 1.0,
        diffuse          : 0.8,
        specular         : 1,

        ambientColor     : [64, 64, 160],
        diffuseColor     : [0, 0, 255],
        specularColor    : [255, 255, 255],

        attenuation     : [1.0, 0.0002, 0.000002],
        shininess        : 1000
    };

