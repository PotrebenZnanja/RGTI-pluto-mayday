import Application from '../../common/Application.js';

import Renderer from './Renderer.js';
import Physics from './Physics.js';
import Camera from './Camera.js';
import SceneLoader from './SceneLoader.js';
import SceneBuilder from './SceneBuilder.js';
import Light from './Light.js';
import Node from './Node.js';
import Functions from './Functions.js';

const ambience = new Audio("../common/audio/fireburner.mp3");
let loaded = false;
var startTimeOld;
let prevTime = 0;
let enemyLimit = 13;
let loseGameRange = 3.5;
let turrCDset = 2;
let turretRadius = 10;
let turretFireCD = 4;
let lengthOfGame = 60;
// NAJPOMEMBNEJSI FILE ZA EDITAT!

function start() {
	document.getElementById("overlay-start").style.display = "none";
	gamePaused = false;
	startTimeOld = Date.now();
	APP.enableCamera();
}

function updateInfo(time,turr)
{
	let v = ("Escape in: "+time+"s </br>Turrets left: "+turr);
	document.getElementById("gameVars").innerHTML = v;
}

var gamePaused = true;
var showHelper = 0;
var time = 0;
var APP = null;

class App extends Application {

    async start() {
    	startTimeOld = Date.now();
        const gl = this.gl;
		
		APP = this;
		gamePaused = true;
		
        this.enemyNum = 0;
        this.turretNum = 0;
        this.running = true;
        this.victory = false;
        this.numberOfTurrets = 6;

        this.renderer = new Renderer(gl);

        this.time = Date.now();
        this.startTime = this.time;
        this.turretCooldown = this.startTime - turrCDset;

        //TEST ZA LIGHT -> Jerry
        //this.root = new Node();
        this.light = new Light();
        //this.root.addChild(this.light);
        //KONEC

        this.aspect = 1;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);
        
        
		document.getElementsByClassName('play')[0].addEventListener('click', start);
		await this.load('scene.json');
    }

    async load(uri) {
		
        const scene = await new SceneLoader().loadScene('scene.json');
        const builder = new SceneBuilder(scene);
        this.scene = builder.build(); // returna dejansko drevo
        this.physics = new Physics(this.scene);
        this.funs = new Functions(this.scene, 0.001, scene);
        this.center = this.funs.findById("scuffed_center")[0];
        // Find first camera.
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
            /*if (node.getTag() === "light")
                this.light = node;*/
        });

		this.camera.APP = this;
        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.scene);
        loaded = true;
        //this.funs.deleteByNum(0);
        //this.initCarriedLight();
    }

    startAudio() {
        const music = ambience;
        music.loop = true;
        if(music.paused){
            music.play();
        }
    }

    enableCamera() {
        this.canvas.requestPointerLock();
        this.startAudio();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.camera.enable();
        } else {
            this.camera.disable();
        }
    }

	resumeGame() {
        this.pauseMenu.style.display = 'none';
        gamePaused = false;

    }
	

	
    update() {
    	if(!loaded||gamePaused){
    		return;
    	}

		if(!this.running)
		{
			this.gameFinish();
			return;
			
			delete this; //pls
		}
    	// kako ta vrstica sploh deluje?
        const t = this.time = Date.now();
        // ^^^^yikes
        // upam da to ne deluje nakljucno pr meni
        const timeInSeconds = Math.floor((t - startTimeOld) / 1000);
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;
	
		updateInfo(lengthOfGame-timeInSeconds,this.numberOfTurrets);
		//console.log(dt+", "+timeInSeconds+ ", "+timer+", "+ (lengthOfGame-timeInSeconds));
		
        if(timeInSeconds == lengthOfGame){
        	this.running = false;
        	this.victory = true;
        }

        if (this.camera) {
            this.camera.update(dt);
        }

        if (this.physics) {
            this.physics.update(dt);
        }
	
        // POISCI SOVRAZNIKE - POSLJI PROTI RAKETI
        // ZDAJ TA BLOK TUKAJ UPDEJTA CELO VRSTO RAZLICNIH KOMPLICIRANIH ZADEV
        // MESO TEGA SE DEJANSKO DOGAJA V Functions.js
        let enemyArray = this.funs.findById("enemy");
        let turretArray = this.funs.findById("turret");
        let bulletArray = this.funs.findById("bullet");
        this.funs.assignTurretTargets(turretArray, enemyArray);
        this.funs.fireVolley(turretArray, t, turretFireCD, turretRadius);
        this.funs.updateBulletLocations(bulletArray, 0.5); // HARDCODEAN SPEED 1, NI TAKO BED
        this.funs.cleanUpBullets(bulletArray, enemyArray);
        this.funs.updateEnemyLocations(enemyArray);
        this.funs.rotateTurrets(turretArray);
        this.funs.updateTurretRotations(turretArray);

        // ASSIGNANJE TARGETOV DELUJE

        // SPAWNAJ SOVRAZNIKE PERIODICNO NA 5 SEKUND - JIM DODELI ID
		
        if(prevTime != timeInSeconds && timeInSeconds % 5 == 0 && this.enemyNum < enemyLimit){
        	let pos = this.funs.calcEnemySpawn();
        	this.funs.spawnEnemy([pos[0], -0.7, pos[1]], this.enemyNum);
        	this.enemyNum++;
        }

        // PREVERI CE SO BLIZU SREDINE IN JIH "UBIJ", CE SO
        //this.funs.arrDyingFromPoint(enemyArray, this.center, 5);

        // PREVERI CE SO BLIZU SREDINE IN IZGUBI GAME, CE SO
        let loss = this.funs.checkEnemiesForEnd(enemyArray, [0, 0, 0], loseGameRange);
        this.funs.checkForDeathsAndUpdate(enemyArray);

        // PREVERI ALI UPORABNIK ZELI POSTAVITI TURRET IN MU UGODI, CE JE TO MOZNO - DRUGACE IGRAJ ERROR SOUND
        if(this.camera.place == true && this.numberOfTurrets > 0){
        	let currT = this.funs.timeToSecond(t);
        	let prevT = this.funs.timeToSecond(this.turretCooldown);
        	let worked = false;
        	if(currT - prevT > turrCDset){
        		worked = this.funs.spawnTurret(this.turretNum);
        		if(worked){
					this.funs.playPlaceSound();
        			this.turretNum++;
        			this.turretCooldown = t;
        			this.numberOfTurrets--;
        		}
        	}
        	else if(currT - prevT > 0.9){
        		this.funs.playErrorSound();
        	}
        	this.camera.place = false;
        }

        if(loss == true){
        	this.running = false;
        	this.victory = false;
        }

        //console.log(timeInSeconds + ": " + this.running + " - " + this.victory);
        // DELA

        this.renderer.prepareExtras(this.scene);
        prevTime = timeInSeconds;
    }

    render() {
        if (this.scene) {
            this.renderer.render(this.scene, this.camera, this.light);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }
	
	gameFinish(){
		ambience.pause();// = true;
		if(this.victory)
		{
			document.getElementById('vic').style.display = "block";
			this.funs.playVictorySound();
		}
		else
		{
			document.getElementById('loss').style.display = "block";
			this.funs.playLossSound();
		}
	}

}


document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new dat.GUI();

    //gui.add(app, 'enableCamera').name("Enable camera");
	canvas.onclick = function(e){
		app.enableCamera();
	};
    gui.add(app.light, 'ambient',0.0,4.0).name("Brightness");
	ambience.volume = 0.1;
	gui.add(ambience, 'volume', 0.0,0.5).name("Music Volume");
});
