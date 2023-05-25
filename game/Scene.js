import * as WebGL from './WebGL.js';
export default class Scene {

	// NE SPREMINJAJ

    constructor() {
        this.nodes = [];
    }

    deleteByNum(num){
        //console.log("tukaj");
        //console.log(this.nodes);
        /*for(let i = 0; i < this.nodes.length; i++){
            if(this.nodes[i].number == num){
                //this.nodes.splice(i, 1);
                //console.log(this.nodes[i].gl);
                //this.nodes[i].gl = null;
                this.nodes[i].number = -1;
                //this.nodes[i]
                //console.log(this.nodes[i]);
                //console.log(this.nodes[i]);
                //this.nodes.splice(i, i+1);
                //this.nodes[i] = null;
                //this.nodes[i].number = -1;
            }
        }*/
        //console.log(this.nodes);

        //////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////
        ///////////////////                                               ////////////////////
        ///////////////////          BRISANJE MODELOV JE RAK              ////////////////////
        ///////////////////                                               ////////////////////
        //////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////
        // PREDAM SE BUTAST WEBGL, ZMAGAL SI, JUTRI NAPRAVIM ALTERNATIVNO RESITEV
        // NE DELA NITI TUKAJ, NITI V FUNS, NITI V RENDERERJU, NIKJER, WASTE OF TIME REALNO
        // CAS ZA PLAN B -> končati game
    }

    addNode(node) {
        this.nodes.push(node);
    }

    traverse(before, after) {
        this.nodes.forEach(node => node.traverse(before, after));
    }

}
