import Node from './Node.js';

// NE SPREMINJAJ

export default class Model extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
        if(options.id){
        	//console.log(options.id);
        	this.id = options.id;
        }

        //edina sprememba do zdaj
        if(options) //type se nahaja v options, zatorej, če obstaja, nastavi.
        	this.type = options.type;
    }

}
