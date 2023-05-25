import Utils from './Utils.js';
import Node from './Node.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

// TOLE FEJST DODAJ
// bolj ali manj v zadnji verziji, razen ce bo dodan bobbing med hojo

export default class Camera extends Node {

    constructor(options) {

        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.projection = mat4.create();
        this.updateProjection();

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
        // to je malo štorasta implementacija
        // sam bo delovalo
        this.place = false;
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    update(dt) {
        const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));

        const up = vec3.set(vec3.create(),
            0, 20, 0);
        //.translation);
        
        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }
        if(this.k <=0)
        {
            if (this.keys['ShiftLeft'])
            {
                c.maxSpeed = 7;
            }
            else
                c.maxSpeed = 3;
        }

        //konstanti = 2

        
        if(this.translation[1]<=0.7)
        {
            this.k = -1;
        }
        //console.log(this.translation[1]);

        if (this.keys['Space']&&this.translation[1]<=0.7){
            this.k = 1
            if(this.keys['ShiftLeft'])
            {
                this.maxSpeed = 7;
            }  
        }

        if(this.k > 0 )
        {
            this.k -= 0.0025;
            c.translation[1] += this.upVel*this.k-this.upVel*(1-this.k);
            if(this.k <=0)
                c.translation[1]=0.7;
        }

        if(this.keys['KeyQ']){
            this.place = true;
        }
                

     /*
        if (this.keys['Space']&&this.jump&&this.translation[1]<=1){
            //jump = false; //sedaj ne morem skakat
            this.jump = false;
            c.velocity[1] += 20;
            
            //c.translation[1] = 4;
        }
        if(!this.jump)
        {
            vec3.add(acc, acc, up);
        }
        if(c.translation[1]>=3)
        {
            this.jump=true;
        }
        if(c.translation[1]>1&&this.jump)
        {
            vec3.sub(acc,acc,up);
        }
        //za fix positiona
        if(this.translation[1]<=1)
        {
            c.velocity[1]= 0;
        }*/
        //console.log(acc);

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
    }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        c.rotation[0] -= dy * c.mouseSensitivity;
        c.rotation[1] -= dx * c.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    /*
    placeHandler(e) {
        this.keys[]
    }*/

}

Camera.defaults = {
    aspect           : 1,
    fov              : 1.5,
    near             : 0.01,
    far              : 100,
    velocity         : [0, 0, 0],
    mouseSensitivity : 0.002,
    maxSpeed         : 3,
    friction         : 0.2,
    acceleration     : 20,
    upVel            : 0.03,
    k                : -1
};
