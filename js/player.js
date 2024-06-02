
"use strict";
import * as THREE from "three";
import { _scene, } from '/tankers/js/scene.js'

let _player = {
	initiated: false,
	config: undefined,
	// ----------------
	pointerLocked: true,
	// ----------------
	inputVelocity: new THREE.Vector3(),
	inputRotationY: 0,
	actions: {
		ismooving: false,
		rotating: false,
		moveForward: false,
		moveBackward: false,
		moveLeft: false,
		moveRight: false,
		turnLeft: false,
		turnRight: false,
		jump: false,
		isjumping: false
	},

	shootTypes: ['basic', 'basic_Lv2', 'basic_Lv3'],
	shoot: false,
	lastShootTime: 0, // Temps du dernier tir
	shootCooldown: 0.6, // Délai minimum entre les tirs en secondes

	currentShootIndex: 0,
	isReversing: false,

	keyMap: {
		KeyW: false,
		KeyS: false,
		KeyA: false,
		KeyD: false,
		KeyQ: false,
		KeyE: false,
		Space: false,
	},
	init: function (_physics) {
		this.config = _physics.modelsPhysics.playerBox
		this.panelManager()
		this.pointerManager()
		_physics.set_MeshAndPhysics(this.config, _scene)
		_scene.scene.add(this.config.mesh)
		this.playerMesh = this.config.mesh
		this.initiated = true
	},
	switchShootType: function () {
		this.currentShootIndex = (this.currentShootIndex + 1) % this.shootTypes.length;
	},
	onDocumentMouseDown: function (event) {
		if (event.button === 0) { // 0 = bouton gauche de la souris
			_player.shoot = true;
		}
	},
	onDocumentMouseUp: function (event) {
		if (event.button === 0) { // 0 = bouton gauche de la souris
			_player.shoot = false;
		}
	},
	onDocumentKey: function (e) {
		if (e.type === "keydown" || e.type === "keyup") {
			_player.keyMap[e.code] = e.type === "keydown";
		}
		if (_player.pointerLocked) {
			_player.actions.moveForward = _player.keyMap["KeyW"];
			_player.actions.moveBackward = _player.keyMap["KeyS"];

			_player.actions.moveLeft = _player.keyMap["KeyQ"];
			_player.actions.moveRight = _player.keyMap["KeyE"];

			_player.actions.turnLeft = _player.keyMap["KeyA"];
			_player.actions.turnRight = _player.keyMap["KeyD"];


			// Condition pour changer le type de tir avec la barre d'espace
			if (e.code === "Space" && e.type === "keydown") {
				_player.switchShootType();
				_player.actions.jump = true
			}
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

				_scene.renderer.domElement.addEventListener("mousedown", _player.onDocumentMouseDown, false);
				_scene.renderer.domElement.addEventListener("mouseup", _player.onDocumentMouseUp, false);
			} else {

				_player.pointerLocked = false;

				_player.menuPanel.style.display = "block";

				document.removeEventListener("keydown", _player.onDocumentKey, false);
				document.removeEventListener("keyup", _player.onDocumentKey, false);


				_scene.renderer.domElement.removeEventListener("mousedown", _player.onDocumentMouseDown, false);
				_scene.renderer.domElement.removeEventListener("mouseup", _player.onDocumentMouseUp, false);

				setTimeout(() => {
					_player.startButton.style.display = "block";
					this.instructionsPanel.style.display = "block";
				}, 1000);
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
		this.startButton.addEventListener(
			"click",
			() => {
				_scene.renderer.domElement.requestPointerLock();
			},
			false
		);
	},
	checkActions2: function (deltaTime, time) {
		this.inputVelocity = new THREE.Vector3(0, 0, 0);
		let cube = this.config.mesh
		let transformAux1 = new Ammo.btTransform();
		let quaternion = new THREE.Quaternion();
		let position = new THREE.Vector3();

		// Calculer les nouvelles rotations et positions
		if (this.actions.turnLeft || this.actions.turnRight) {
			let angle = (this.actions.turnLeft ? 1 : -1) * deltaTime * 2.0;
			let axis = new THREE.Vector3(0, 1, 0);
			quaternion.setFromAxisAngle(axis, angle);
			cube.quaternion.multiplyQuaternions(quaternion, cube.quaternion);
			this.actions.turning = true;
		}
		if (this.actions.turnLeft) {
			this.actions.turning = true;
			console.log('tourner a gauche')
		} else if (this.actions.turnRight) {
			this.actions.turning = true;
			console.log('tourner a droite')
		}
		if (this.actions.moveLeft) {
			this.actions.ismooving = true;
			this.inputVelocity.x = -5 * deltaTime;
		} else if (this.actions.moveRight) {
			this.actions.ismooving = true;
			this.inputVelocity.x = 5 * deltaTime;
		}
		if (this.actions.moveBackward) {
			this.actions.ismooving = true;
			this.inputVelocity.z = -5 * deltaTime;
		} else if (this.actions.moveForward) {
			this.actions.ismooving = true;
			this.inputVelocity.z = 5 * deltaTime;
		}


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
		}
	},
	checkActions: function (deltaTime, time) {
		this.inputVelocity = new THREE.Vector3(0, 0, 0);
		let cube = this.config.mesh
		let transformAux1 = new Ammo.btTransform();
		let quaternion = new THREE.Quaternion();
		let position = new THREE.Vector3();

		let max = (this.config[this.config.shapeType].y)
		if (cube.position.y > 0 + max) {
			this.actions.isjumping = true
			this.actions.jump = false
		}
		else {
			this.actions.isjumping = false
		}

		if (_player.actions.jump && !_player.actions.isjumping) {
			this.jump(cube.userData.physicsBody)
		}


		// Calculer les nouvelles rotations et positions
		if (this.actions.turnLeft || this.actions.turnRight) {
			let angle = (this.actions.turnLeft ? 1 : -1) * deltaTime * 2.0;
			let axis = new THREE.Vector3(0, 1, 0);
			quaternion.setFromAxisAngle(axis, angle);
			cube.quaternion.multiplyQuaternions(quaternion, cube.quaternion);
			// console.log((this.actions.turnLeft ? 'tourner a droite' : 'tourner a gauche'))
		}

		// Calculer la direction de déplacement
		let forward = new THREE.Vector3(0, 0, 1);
		forward.applyQuaternion(cube.quaternion);
		forward.normalize();

		if (this.actions.moveForward) {
			this.inputVelocity.add(forward.multiplyScalar(5 * deltaTime));
		}
		if (this.actions.moveBackward) {
			this.inputVelocity.add(forward.multiplyScalar(-5 * deltaTime));
		}
		let right = new THREE.Vector3(1, 0, 0);
		right.applyQuaternion(cube.quaternion);
		right.normalize();

		// na pas enlever
		// if (this.actions.moveLeft) {
		// 	this.inputVelocity.add(right.multiplyScalar(-5 * deltaTime));
		// }
		// if (this.actions.moveRight) {
		// 	this.inputVelocity.add(right.multiplyScalar(5 * deltaTime));
		// }


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
		}
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
	setNewPosition: function () {
		let cube = this.config.mesh
		let playerPhysicsBody = cube.userData.physicsBody;
		let ms = playerPhysicsBody.getMotionState();
		if (ms) {
			let transform = new Ammo.btTransform();
			ms.getWorldTransform(transform);

			// Update position
			let position = transform.getOrigin();
			position.setX(position.x() + this.inputVelocity.x);
			position.setY(position.y() + this.inputVelocity.y);
			position.setZ(position.z() + this.inputVelocity.z);

			transform.setOrigin(position);
			ms.setWorldTransform(transform);
			playerPhysicsBody.activate();
			playerPhysicsBody.setMotionState(ms);
		}

	},
}
export { _player }
