import Application from '../../common/Application.js';

import Renderer from './Renderer.js';
import Physics from './Physics.js';
import Camera from './Camera.js';
import SceneLoader from './SceneLoader.js';
import SceneBuilder from './SceneBuilder.js';
import Light from './Light.js';
import Node from './Node.js';
import Model from './Model.js';
import Mesh from './Mesh.js';
const errSound = new Audio("../common/audio/error.mp3");
const victorySound = new Audio("../common/audio/victory.mp3");
const defeatSound = new Audio("../common/audio/loss.mp3");
const placement = new Audio("../common/audio/placement.wav");

let playedSound = false;

export default class Functions{

	constructor(sceneIn, speed, spec){
		this.scene = sceneIn; // SCENE OBJEKT
		this.enemySpeed = speed;
		this.spec = spec;
		this.camera = this.findCamera();
		this.turretNoSpawnArea = 3;
		//console.log("created");
	}

	playPlaceSound() {
		let err = placement;
        err.volume = 0.7;
        err.loop = false;
        /*if(music.paused){
            music.play();
        }*/
        err.play();
    }
	
	playErrorSound() {
		let err = errSound;
        err.volume = 0.5;
        err.loop = false;
        /*if(music.paused){
            music.play();
        }*/
        err.play();
    }

    playVictorySound(){
    	let vic = victorySound;
    	vic.volume = 0.7;
    	vic.loop = false;
		if(!playedSound)
			vic.play();
		playedSound = true;
    }

    playLossSound(){
    	let loss = defeatSound;
    	loss.volume = 0.7;
    	loss.loop = false;
		if(!playedSound)
			loss.play();
		playedSound = true;
    }

    playCannonSound(){
    	const can = new Audio("../common/audio/cannon.mp3");
    	can.volume = 0.3;
    	can.loop = false;
    	can.play();
    }

    assignTurretTargets(turretArray, enemyArray){
    	for(let i = 0; i < turretArray.length; i++){
    		let currTurret = turretArray[i];
    		let minDist = 1000000000;
    		for(let j = 0; j < enemyArray.length; j++){
    			let currEnemy = enemyArray[j];
    			let currDist = this.calcDistanceBetweenObjects(currTurret, currEnemy);
    			if(currDist < minDist){
    				currTurret.target = currEnemy.number;
    				minDist = currDist;
    			}
    		}
    	}
    }

    fire(obj, destination, speed){
    	let position = obj.translation;
    	let movementVector;
    	if(this.compareCoordinatesByPlaneSpecialized(position, destination) == true){
    		obj.currently = "stable";
    		return false;
    		//movementVector = destination;
    		//movementVector[1] = position[1]; // da ne gre gor ali pa dol
    		// kinda deprecated
    	}
    	else{
    		let velocity = this.calculateBulletDirection(obj, destination, speed);
    		velocity[1] = 0; // da ne gre gor ali pa dol
    		obj.translation = this.arrAdd(position, velocity);
    		return true;
    	}
    }

    beginFire(turret){
    	this.spawnBullet(turret);
    	this.playCannonSound();
    }

    getTurretTargetFromIdAndNumber(turret){
    	let target = null;
		if(this.scene){
	        this.scene.traverse(node => {
	            if(node.id == "enemy" && node.number == turret.target){
	            	target = node;
	            }	            
	        });
        }
        return target;

    }

    bulletDestroy(bullet){
    	bullet.translation = [0, -200, 0];
    	bullet.owner = null;
    	bullet.target = -10;

    }

    findNearestEnemyOfBullet(bullet, enemyArr){
    	let dist = 10000000;
    	let enemyNearest = null;
    	for(let i = 0; i < enemyArr.length; i++){
    		let currEnemy = enemyArr[i];
    		let currDist = this.calcDistanceBetweenObjects(bullet, currEnemy);
    		if(currDist < dist){
    			dist = currDist;
    			enemyNearest = currEnemy;
    		}
    	}
    	return enemyNearest;
    }

    /*calcDistanceBetweenBulletEnemy(bullet, enemy){
    	// TOLE BOM V BISTVU PRIREDIL DA RACUNA IZKLJUCNO PO RAVNINI
		// EVO PRIREJENO
		let a = obj1.translation;
		let b = obj2.translation;
		/*console.log(obj1);
		console.log(obj2);*/

		/*
		a = [a[0], a[2]];
		b = [b[0], b[2]];
		b = this.arrScale(b, -1);
		let c = this.arrAdd(a, b);
		return this.vectorNorm(c);
    }*/

    cleanUpBullets(bulletArr, enemyArr){
    	for(let i = 0; i < bulletArr.length; i++){
    		let currBull = bulletArr[i];
    		if(currBull.currently == "stable"){
    			let respawning = this.findNearestEnemyOfBullet(currBull, enemyArr);
    			currBull.currently = "dead";
    			this.bulletDestroy(currBull);
    			this.enemyRespawn(respawning, true);
    		}
    	}
    }

    getBulletOwnerFromNumber(bullet){
    	let target = null;
		if(this.scene){
	        this.scene.traverse(node => {
	            if(node.id == "turret" && node.number == bullet.owner){
	            	target = node;
	            }	            
	        });
        }
        return target;
    }

    ableToFire(turret, time, cooldown, radius){
    	let target = this.getTurretTargetFromIdAndNumber(turret);
    	// target dobi pravilno
    	//console.log("notranji target: ");
    	//console.log(target.number);
    	//console.log(turret.fired);
    	if((this.timeToSecond(time) - this.timeToSecond(turret.fired)) >= cooldown && this.calcDistanceBetweenObjects(turret, target) <= radius){
    		turret.fired = time;
    		return true;
    	}
    	return false;
    }

    fireVolley(turretArr, time, cooldown, radius){
    	for(let i = 0; i < turretArr.length; i++){
    		let turr = turretArr[i];
    		//console.log(turr.number);
    		//console.log(this.ableToFire(turr, time, cooldown, radius));
    		if(this.ableToFire(turr, time, cooldown, radius)){
    			//console.log(turr.number);
    			this.beginFire(turr);
    		}
    	}
    }

    updateBulletLocations(bulletArr, speed){
    	for(let i = 0; i < bulletArr.length; i++){
    		let currNode = bulletArr[i];
    		let owner = this.getBulletOwnerFromNumber(currNode);
    		let target = this.getTurretTargetFromIdAndNumber(owner);
    		/*if(currNode.currently != "dead"){
    			console.log(currNode.target.number + " - " + target.number);
    		}*/
    		if(target != null && target.number != currNode.target){
    			currNode.currently = "dead";
    			this.bulletDestroy(currNode);
    		}
    		else{
    			let isStill = this.fire(currNode, target.translation, speed); // HARDCODEAN DESTINATION
    			currNode.target = target.number;
    			//console.log(currNode.currently);
    		}
    		currNode.updateTransform();
    	}
    }

    calculateBulletDirection(bullet, destination, speed){
    	let position = bullet.translation;
    	let tmp = this.arrScale(position, -1);
    	let direction = this.arrAdd(destination, tmp);
    	// TALE VEKTOR JE POTREBNO SE NORMALIZIRATI
    	let norm = this.vectorNorm(direction);
    	let fin = this.arrScale(direction, speed / norm);
    	return fin;
    }

	calculateEnemyDirection(enemy, speed){

		let enemyPos = enemy.translation;
		//console.log(enemyPos);
		let centerPos = [0, -0.5, 0];
		let direction = [0, 0, 0];
		let tmp = this.arrScale(enemyPos, -1);
		direction = this.arrAdd(centerPos, tmp);
		direction[0] = direction[0] * speed;
		direction[1] = direction[1] * speed;
		direction[2] = direction[2] * speed;
		return direction;

	}

	/*popraviOriginalnega(){

	}*/

	updateEnemyLocations(enemyArr){
		for(let i = 0; i < enemyArr.length; i++){
        	let currNode = enemyArr[i];
        	let dir = this.calculateEnemyDirection(currNode, this.enemySpeed);
        	currNode.translation = this.arrAdd(currNode.translation, dir);
        	currNode.updateTransform();
        }
	}

	updateTurretRotations(turretArr){
		for(let i = 0; i < turretArr.length; i++){
			let currNode = turretArr[i];
			currNode.translation[1] = -3.5;
			currNode.updateTransform();
		}
	}

	rotateEnemyTowardsCenter(enemy){
		enemy.rotation[1] = 0;
		let velocity = this.calculateEnemyDirection(enemy, this.enemySpeed);
		let velocityXY = [0, 0, 0]; //XZY
		velocityXY[0] = velocity[0];
		velocityXY[2] = velocity[2];
		//let vek = [1, 0, 0];
		let dolzina = Math.sqrt(this.scalarProd(velocityXY, velocityXY));
		let cosfi = velocityXY[0] / dolzina;
		//console.log(cosfi);
		let fi = Math.acos(cosfi);
		let X = enemy.translation[0];
		let Y = enemy.translation[2];
		enemy.rotation[1] = Math.PI / 2 + fi * (Y / Math.abs(Y));
		let enemyX = enemy.translation[0];
		let enemyY = enemy.translation[2];
		if(enemyY == 0){
			if(enemyX < 0){
				enemy.rotation[1] = Math.PI / 2;
			}
			else{
				enemy.rotation[1] = Math.PI * (3 / 2);
			}
		}
		if(enemyX == 0){
			if(enemyY > 0){
				enemy.rotation[1] = Math.PI;
			}
			else{
				enemy.rotation[1] = 0;
			}
		}

	}

	scalarProd(v1, v2){

		if(v1.length != v2.length){
			console.log("ERROR");
			return -1;
		}
		let v = 0;
		for(let i = 0; i < v1.length; i++){
			v += v1[i]*v2[i];
		}
		return v;

	}

	findById(idF){
		var arr = [];
		if(this.scene){
	        this.scene.traverse(node => {
	            if(node.id == idF){
	            	arr.push(node);
	            }	            
	        });
        }
        return arr;
	}

	findByNum(numF){
		var target = null;
		if(this.scene){
	        this.scene.traverse(node => {
	            if(node.number == numF){
	            	target = node;
	            }	            
	        });
        }
        return target;
	}

	findCamera(){
		var target = null;
		if(this.scene){
	        this.scene.traverse(node => {
	        	//console.log(node.type);
	            if(node instanceof Camera){
	            	target = node;
	            }	            
	        });
        }
        return target;
	}

	timeToSecond(time){
		return Math.floor(time / 1000);
	}

	createTurretObject(){
		let spec = this.spec;
		let turret = null;
		for(let i = 0; i < spec.nodes.length; i++){
			if(spec.nodes[i].id == "turret"){
				turret = spec.nodes[i];
			}
		}
		let pos = this.calculateTurretPosition();
		if(this.turretPlacementCheck(pos, this.turretNoSpawnArea) == false){
			this.playErrorSound();
			return;
		}
		turret.scale = [0.05, 0.07, 0.05];
		turret.translation = pos;
		//console.log(turret.fired);
		const mesh = new Mesh(spec.meshes[turret.mesh]);
        const texture = spec.textures[turret.texture];
        return new Model(mesh, texture, turret);
	}

	createBulletObject(turret){
		let spec = this.spec;
		let bullet = null;
		for(let i = 0; i < spec.nodes.length; i++){
			if(spec.nodes[i].id == "bullet"){
				bullet = spec.nodes[i];
			}
		}
		bullet.translation = turret.translation;
		bullet.translation[1] = 0.6;
		const mesh = new Mesh(spec.meshes[bullet.mesh]);
        const texture = spec.textures[bullet.texture];
        return new Model(mesh, texture, bullet);
	}

	spawnBullet(turret){
		let model = this.createBulletObject(turret);
		model.currently = "fired";
		model.owner = turret.number;
		model.target = turret.target;
		this.scene.addNode(model);
	}

	spawnTurret(num){
		let model = this.createTurretObject();
		if(model == null){
			return false;
		}
		model.fired = -1;
		model.number = num;
		this.scene.addNode(model);
		return true;
	}

	calculateTurretPosition(){
		let camera = this.camera;
		//console.log(camera);
		let pos = this.copyArr3(camera.translation);
		let x = camera.rotation[1];
		pos[0] += Math.cos(x + Math.PI / 2) * 2;
		pos[2] -= Math.sin(x + Math.PI / 2) * 2;
		pos[1] = -3.5;
		//console.log(pos);
		return pos;
	}

	createEnemyObject(location, rotate){
		let spec = this.spec;
		// to ma torej nodes, meshes, textures,...
		let enemy = null;
		for(let i = 0; i < spec.nodes.length; i++){
			if(spec.nodes[i].id == "enemy"){
				enemy = spec.nodes[i];
			}
		}
		enemy.translation = location;
		//console.log(enemy.number);
		if(rotate == true){
			this.rotateEnemyTowardsCenter(enemy);
		}
		const mesh = new Mesh(spec.meshes[enemy.mesh]);
        const texture = spec.textures[enemy.texture];
        return new Model(mesh, texture, enemy);
	}

	spawnEnemy(location, num){
		let model = this.createEnemyObject(location, true);
		model.number = num; // kaj zdaj sem ali na enemy v this.createEnemyObject()???
		model.dead = false;
		this.scene.addNode(model);
		//console.log("spawned enemy");

	}

	calcDistanceBetweenObjects(obj1, obj2){
		// TOLE BOM V BISTVU PRIREDIL DA RACUNA IZKLJUCNO PO RAVNINI
		// EVO PRIREJENO
		let a = obj1.translation;
		let b = obj2.translation;
		/*console.log(obj1);
		console.log(obj2);*/
		a = [a[0], a[2]];
		b = [b[0], b[2]];
		b = this.arrScale(b, -1);
		let c = this.arrAdd(a, b);
		return this.vectorNorm(c);

	}

	turretPlacementCheck(location, dist){
		let arr = this.findById("turret");
		for(let i = 0; i < arr.length; i++){
			let currTurrPos = arr[i].translation;
			if(this.calcDistanceBetweenPoints(location, currTurrPos) <= dist){
				return false;
			}
		}
		return true;
	}

	calcDistanceBetweenPoints(p1, p2){
		// TUDI PO RAVNINI..
		let a = [p1[0], p1[2]];
		let b = [p2[0], p2[2]];
		b = this.arrScale(b, -1);
		let c = this.arrAdd(a, b);
		return this.vectorNorm(c);
	}

	vectorNorm(v){
		return Math.sqrt(this.scalarProd(v, v));
	}

	arrAdd(arr1, arr2){
		if(arr1.length != arr2.length){
			console.log("ADDING ERROR");
			return;
		}
		let temp = [];
		for(let i = 0; i < arr1.length; i++){
			temp.push(arr1[i] + arr2[i]);
		}
		return temp;
	}

	arrScale(arr1, scalar){
		let temp = [];
		for(let i = 0; i < arr1.length; i++){
			temp.push(arr1[i] * scalar);
		}
		return temp;
	}

	enemyRespawn(enemy, rotate){
		let newPoint = this.calcEnemySpawn();
		enemy.translation[0] = newPoint[0];
		enemy.translation[2] = newPoint[1];
		enemy.translation[1] = -0.7;
		let dir = this.calculateEnemyDirection(enemy, this.enemySpeed);
		if(rotate == true){
			this.rotateEnemyTowardsCenter(enemy);
		}
	}

	checkForDeathsAndUpdate(arr){
		for(let i = 0; i < arr.length; i++){
			if(arr[i].dead == true){
				this.enemyRespawn(arr[i], true);
				arr[i].dead = false;
			}
		}
	}

	compareCoordinatesByPlane(c1, c2){
		if(this.calcDistanceBetweenPoints(c1, c2) < 0.01){ // kao very small
			return true;
		}
		return false;
	}

	compareCoordinatesByPlaneSpecialized(c1, c2){
		if(this.calcDistanceBetweenPoints(c1, c2) < 0.5){ // kao ne tak very small
			return true;
		}
		return false;
	}

	arrDyingFromPoint(arr, point, dist){
		for(let i = 0; i < arr.length; i++){
			if(this.calcDistanceBetweenObjects(arr[i], point) <= dist){
				arr[i].dead = true;
			}
		}
	}

	copyArr3(arr){
		let dest = [0, 0, 0];
		dest[0] = arr[0];
		dest[1] = arr[1];
		dest[2] = arr[2];
		return dest;
	}

	enemyCloseToRocket(enemy, center, dist){
		let location = enemy.translation;
		if(this.calcDistanceBetweenPoints(location, center) <= dist){
			return true;
		}
		return false;
	}

	rotateTurrets(turretArr){
		for(let i = 0; i < turretArr.length; i++){
			//console.log(turretArr[i].target);
			this.rotateTurretTowardsTarget(turretArr[i]);
		}
	}

	rotateTurretTowardsTarget(turret){
		//console.log(turret);
		let target = this.getTurretTargetFromIdAndNumber(turret);
		//console.log(target);
		if(target == null){
			return;
		}
		//let target = this.getTurretTargetFromIdAndNumber(turret);
		//console.log(target);
		let turretLocation = [turret.translation[0], turret.translation[2]];
		let targetLocation = [target.translation[0], target.translation[2]];
		//console.log(turretLocation + " -> " + targetLocation);
		let X_E = targetLocation[0];
		let Y_E = targetLocation[1];
		let X_T = turretLocation[0];
		let Y_T = turretLocation[1];
		let Y = Y_T - Y_E;
		let X = X_T - X_E;
		let vec = [X, Y];
		let norm = this.vectorNorm(vec);
		let fi = Math.acos(X / norm) * (Y / Math.abs(Y));
		let start = 3 * (Math.PI / 2);
		fi = fi + start;
		turret.rotation[1] = -Math.PI / 2 - fi;
		//let turretTranslated = [0, 0];
		//let targetTranslated = [target.translation[0] - turretLocation[0], target.translation[2] - turretLocation[1]];

	}

	checkEnemiesForEnd(enemyArr, center, dist){
		for(let i = 0; i < enemyArr.length; i++){
			let enemy = enemyArr[i];
			if(this.enemyCloseToRocket(enemy, center, dist) == true){
				return true;
			}
		}
		return false;
	}

	calcEnemySpawn(){
		// to bo prislo prav pri kompenziranju za pomanjkanje deletanja
		let X;
		let Y;
		if(this.getRandomInt(2) == 21){
			X = this.getRandomInt(5);
			Y = this.getRandomInt(25) - 20;
		}
		else{
			X = this.getRandomInt(25) - 20;
			Y = this.getRandomInt(5);
		}
		//console.log(this.getRandomInt(2));
		if(this.getRandomInt(2) == 21){
			X = X * -1;
		}
		if(this.getRandomInt(2) == 21){
			Y = Y * -1;
		}
		return [X, Y];

	}

	getRandomInt(max) {
	  return 20 + Math.floor(Math.random() * Math.floor(max));
	}

}
