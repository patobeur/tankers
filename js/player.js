
"use strict";
import * as THREE from "three";
import { _scene, } from '/tankers/js/scene.js'
import { _OrbitControls } from '/tankers/js/OrbitControls.js';
import { _Engine, _Shoot } from '/tankers/js/Engine.js';

let _player = {
	initiated: false,
	// ----------------
	pointerLocked: true,
	// ----------------
	inputVelocity: new THREE.Vector3(),
	actions: { ismooving: false, rotating: false, moveForward: false, moveBackward: false, moveLeft: false, moveRight: false, turnLeft: false, turnRight: false, jump: false, isjumping: false },
	shootTypes: ['basic', 'basic2', 'basic3'],
	currentShootIndex: 0,
	shoot: false,
	turnSpeed: 2.0,
	stats: {
		hp: 100
	},
	keyMap: {
		KeyW: false,
		KeyS: false,
		KeyA: false,
		KeyD: false,
		KeyQ: false,
		KeyE: false,
		Space: false,
	},
	config: {
		name: "playerBox",
		shapeType: 'btBoxShape',
		btBoxShape: { x: 1.5, y: 1.45, z: 1.7 },
		pos: { x: 0, y: 1, z: 0 },
		inertia: { x: 0, y: 0, z: 0 },
		quat: { x: 0, y: 0, z: 0, w: 1 },
		mass: 3,
		mesh: undefined,
		shape: undefined,
		color: 0xffff00,
		transparent: true,
		opacity: .8,
		shininess: 0,
		castShadow: false,
		receiveShadow: false,
		physics: {
			friction: 1,
			restitution: 0
		},
		// group: DEFAULT_GROUP,
		// mask: DEFAULT_MASK
	},
	// ---------------- ----------------
	init: function (_physics, _GLTFLoader, _ModelsManager) {
		this._ModelsManager = _ModelsManager
		this.playerTank = _GLTFLoader.models.tankAlpha
		this.playerTurret = this.playerTank.children[0].children[3]
		this.addProjectilOrigineMesh()

		// this.config = _physics.modelsPhysics.playerBox
		this.panelManager()
		this.pointerManager()
		_physics.set_MeshAndPhysics(this.config, _scene)

		// ------------------
		// add model animated
		// ------------------


		_scene.scene.add(this.config.mesh)
		this.playerMesh = this.config.mesh
		this.playerMesh.add(this.playerTank)

		this.config.animatedMesh = _ModelsManager.allMeshsAndDatas.character['Kimono_Female'].mesh
		this.config.animatedMesh.position.y -= this.config[this.config.shapeType].y / 2

		this.playerMesh.add(this.config.animatedMesh)

		_Shoot.init(this.playerMesh, this.playerTurret, _scene, _physics)
		_Engine.init(_ModelsManager)

		this.initiated = true
	},

	addProjectilOrigineMesh: function () {
		let geometry = new THREE.BoxGeometry(.5, .25, .5);
		let material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
		this.projectilOrigine = new THREE.Mesh(geometry, material);
		this.projectilOrigine.position.z = 5
		this.projectilOrigine.position.y = -.5
		this.playerTank.children[0].children[3].add(this.projectilOrigine)
		console.log(this.projectilOrigine.position)
	},
	// ---------------- ----------------
	switchShootType: function () {
		this.currentShootIndex = (this.currentShootIndex + 1) % this.shootTypes.length;
		console.log('currentShootIndex', this.currentShootIndex)
		this.switchShoot = false
	},
	onDocumentMouseDown: function (event) { if (event.button === 0) _player.shoot = true; },
	onDocumentMouseUp: function (event) { if (event.button === 0) _player.shoot = false; },
	onDocumentKey: function (e) {
		if (e.type === "keydown" || e.type === "keyup") _player.keyMap[e.code] = e.type === "keydown";
		if (_player.pointerLocked) {
			_player.actions.moveForward = _player.keyMap["KeyW"];
			_player.actions.moveBackward = _player.keyMap["KeyS"];
			_player.actions.moveLeft = _player.keyMap["KeyQ"];
			_player.actions.moveRight = _player.keyMap["KeyE"];
			_player.actions.turnLeft = _player.keyMap["KeyA"];
			_player.actions.turnRight = _player.keyMap["KeyD"];
			_player.actions.jump = _player.keyMap["KeyJ"];
			_player.actions.switchShoot = _player.keyMap["Space"];
			// Condition pour changer le type de tir avec la barre d'espace
			// if (e.code === "Space" && e.type === "keydown") {
			// 	_player.switchShootType();
			// 	// _player.actions.jump = true
			// }
		}
	},
	pointerManager: function () {
		document.addEventListener("pointerlockchange", () => {
			if (document.pointerLockElement === _scene.renderer.domElement) {
				_player.pointerLocked = true;
				_player.startButton.style.display = "none";
				_player.menuPanel.style.display = "none";
				this.instructionsPanel.style.display = "none";
				document.addEventListener("keydown", _player.onDocumentKey, false);
				document.addEventListener("keyup", _player.onDocumentKey, false);
				_scene.renderer.domElement.addEventListener("mousemove", _OrbitControls.onDocumentMouseMove, false);
				_scene.renderer.domElement.addEventListener("wheel", _OrbitControls.onDocumentMouseWheel, false);
				_scene.renderer.domElement.addEventListener("mousedown", _player.onDocumentMouseDown, false);
				_scene.renderer.domElement.addEventListener("mouseup", _player.onDocumentMouseUp, false);

			} else {
				_player.pointerLocked = false;
				_player.menuPanel.style.display = "block";
				document.removeEventListener("keydown", _player.onDocumentKey, false);
				document.removeEventListener("keyup", _player.onDocumentKey, false);
				_scene.renderer.domElement.removeEventListener("mousedown", _player.onDocumentMouseDown, false);
				_scene.renderer.domElement.removeEventListener("mouseup", _player.onDocumentMouseUp, false);
				_scene.renderer.domElement.removeEventListener("mousemove", _OrbitControls.onDocumentMouseMove, false);
				_scene.renderer.domElement.removeEventListener("wheel", _OrbitControls.onDocumentMouseWheel, false);
				setTimeout(() => { _player.startButton.style.display = "block"; this.instructionsPanel.style.display = "block"; }, 1000);
			}
		});
	},
	panelManager: function () {
		this.instructionsPanel = document.getElementById('instructions')
		this.menuPanel = document.createElement('div')
		this.startButton = document.createElement('div')
		this.menuPanel.id = 'menuPanel'
		this.startButton.id = 'startButton'
		this.startButton.textContent = 'startButton'
		this.menuPanel.appendChild(this.startButton)
		document.body.appendChild(this.menuPanel)
		this.startButton.addEventListener("click", () => { _scene.renderer.domElement.requestPointerLock(); }, false);
	},
	update: function (deltaTime, time) {
		_Shoot.update(deltaTime, time)
		this.checkActions(deltaTime, time)
	},
	checkActions: function (deltaTime, time) {

		let cube = this.config.mesh
		this.inputVelocity = new THREE.Vector3(0, 0, 0);

		let transformAux1 = new Ammo.btTransform();
		let quaternion = new THREE.Quaternion();
		let position = new THREE.Vector3();

		// is jumping 
		// let max = (this.config[this.config.shapeType].y)
		// if (cube.position.y > 0 + max) {
		// 	this.actions.isjumping = true;
		// 	this.actions.jump = false
		// }
		// else {
		// 	this.actions.isjumping = false
		// }
		// if (_player.actions.jump && !_player.actions.isjumping) this.jump(cube.userData.physicsBody);


		// AVANT ARRIERE
		let forward = new THREE.Vector3(0, 0, 1).applyQuaternion(cube.quaternion).normalize();
		if (this.actions.moveForward || this.actions.moveBackward) {
			if (this.actions.moveForward) _Engine.powerUp();
			else if (this.actions.moveBackward) _Engine.powerDown();
		}

		if (_Engine.status.power !== 0) {
			this.inputVelocity.add(forward.multiplyScalar(_Engine.status.power * deltaTime));
		}


		// TURN GAUCHE DROITE
		let right = new THREE.Vector3(1, 0, 0).applyQuaternion(cube.quaternion).normalize();
		if (this.actions.moveLeft) this.inputVelocity.add(right.multiplyScalar(-5 * deltaTime));
		if (this.actions.moveRight) this.inputVelocity.add(right.multiplyScalar(5 * deltaTime));

		// Calculer les nouvelles rotations et position
		if (this.actions.turnLeft || this.actions.turnRight) {
			let sens = _Engine.status.power >= 0 ? 1 : -1; // invert directection while going back
			let angle = (this.actions.turnLeft ? 1 : -1) * deltaTime * this.turnSpeed * sens;
			let axis = new THREE.Vector3(0, 1, 0);
			quaternion.setFromAxisAngle(axis, angle);
			cube.quaternion.multiplyQuaternions(quaternion, cube.quaternion);
			// console.log((this.actions.turnLeft ? 'tourner a droite' : 'tourner a gauche'))
		}

		// ----------------
		// ANIMATIONS
		// ----------------
		this.animateChar()
		// ----------------
		// END ANIMATIONS
		// ----------------



		// Mettre à jour la transformation du corps physique
		if (cube.userData.physicsBody) {
			let body = cube.userData.physicsBody;
			body.getMotionState().getWorldTransform(transformAux1);

			position.set(
				transformAux1.getOrigin().x() + this.inputVelocity.x,
				transformAux1.getOrigin().y() + this.inputVelocity.y,
				transformAux1.getOrigin().z() + this.inputVelocity.z
			);

			let btQuat = transformAux1.getRotation();
			btQuat.setValue(cube.quaternion.x, cube.quaternion.y, cube.quaternion.z, cube.quaternion.w);

			transformAux1.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
			transformAux1.setRotation(btQuat);

			body.setWorldTransform(transformAux1);
			body.activate();


			if (this.shoot) {
				let done = _Shoot.shoot(this.shootTypes[this.currentShootIndex]);
			}
			if (this.switchShoot) {
				_player.switchShootType();
				this.switchShoot = false
			}
		}
		_Engine.update()
	},
	jump: function () {
		if (this.actions && this.actions.jump) { // Simple vérification pour permettre de sauter seulement si on est proche du sol
			let cube = this.config.mesh
			let jumpForce = new Ammo.btVector3(0, 5, 0); // Modifier la force du saut selon besoin
			cube.userData.physicsBody.applyCentralImpulse(jumpForce);
			this.actions.jump = false
			this.actions.isjumping = true
		}

	},
	animateChar: function () {
		let char = this._ModelsManager.allMeshsAndDatas.character['Kimono_Female']
		// ----------------
		// ANIMATIONS
		// ----------------
		if (_Engine.status.currentGear === 0) { char.changeAnimation('Walk') }
		else if (_Engine.status.currentGear === 2) { char.changeAnimation('Idle') }// position a l'arret
		else if (_Engine.status.currentGear === 3) { char.changeAnimation('Walk') }
		else if (_Engine.status.currentGear === 5) { char.changeAnimation('Run') }

		if (this.shoot) {
			char.changeAnimation('Punch')


			// wait until go old animations
		}

		// console.log(char)
		// toutes ces info sont dans char
		// 0: Object { name: "Death", duration: 2.2916667461395264, blendMode: 2500, … }
		// 1: Object { name: "Defeat", duration: 2.5, blendMode: 2500, … }
		// 2: Object { name: "Idle", duration: 4.166666507720947, blendMode: 2500, … }
		// 3: Object { name: "Jump", duration: 1.0416666269302368, blendMode: 2500, … }
		// 4: Object { name: "PickUp", duration: 1.25, blendMode: 2500, … }
		// 5: Object { name: "Punch", duration: 0.75, blendMode: 2500, … }
		// 6: Object { name: "RecieveHit", duration: 0.625, blendMode: 2500, … }
		// 7: Object { name: "Roll", duration: 0.9166666865348816, blendMode: 2500, … }
		// 8: Object { name: "Run", duration: 0.875, blendMode: 2500, … }
		// 9: Object { name: "Run_Carry", duration: 0.300, blendMode: 2500, … }
		// 10: Object { name: "Shoot_OneHanded", duration: 0.5416666865348816, blendMode: 2500, … }
		// 11: Object { name: "SitDown", duration: 0.9583333134651184, blendMode: 2500, … }
		// 12: Object { name: "StandUp", duration: 1.2916666269302368, blendMode: 2500, … }
		// 13: Object { name: "SwordSlash", duration: 1.0416666269302368, blendMode: 2500, … }
		// 14: Object { name: "Victory", duration: 1.875, blendMode: 2500, … }
		// 15: Object { name: "Walk", duration: 1.25, blendMode: 2500, … }
		// 16: Object { name: "Walk_Carry", duration: 1.25, blendMode: 2500, … }

		// ----------------
		// END ANIMATIONS
		// ----------------
	},
	delayedAction: () => {

	}
}
let animateChar = {
	datas: {},
	init: function () {

	}

}
export { _player }
