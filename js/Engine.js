"use strict";
import * as THREE from "three";
import { _front } from "/js/loaders.js";
let _Engine = {
	// INIT
	init: function (_ModelsManager) {
		this._ModelsManager = _ModelsManager;
		this.max = this.GEARS.length - 1;
		this.add_board();
	},
	// DATAS
	status: {
		name: "STOPPED",
		power: new Number(0),
		currentGear: new Number(2),
	},
	// currentGear: new Number(2),
	hotLimits: { cur: 0, max: 100 },
	delay: { cur: 0, max: 20 },
	GEARS: [
		{ name: "FAST_BACKWARD", power: -3 },
		{ name: "SLOW_BACKWARD", power: -1 },
		{ name: "STOPPED", power: 0 },
		{ name: "SLOW_FORWARD", power: 1 },
		{ name: "FAST_FORWARD", power: 2.5 },
		{ name: "VERY_FAST_FORWARD", power: 4 },
		{ name: "VERY_VERY_FAST_FORWARD", power: 7 },
	],
	// front html
	boardInitiated: false,
	boards: {},
	// functions
	refresh_board: function () {
		if (this.boardInitiated === true) {
			let divs = document.body.getElementsByClassName("gear");
			for (let index = divs.length - 1; index >= 0; index--)
				divs[index].classList.remove("active");
		}
		this.boards[this.status.name].classList.add("active");
	},
	// functions
	add_board: function () {
		// ⚡
		this.boards["board"] = _front.createDiv({
			tag: "div",
			attributes: { id: "board" },
			style: {},
		});
		this.boards["board_speed"] = _front.createDiv({
			tag: "div",
			attributes: { id: "board_speed" },
			style: { display: "flex" },
		});
		this.GEARS.forEach((element) => {
			this.boards[element.name] = _front.createDiv({
				tag: "div",
				attributes: {
					id: element.name,
					textContent: element.power,
					className: "gear",
				},
				style: {},
			});
			this.boards["board_speed"].appendChild(this.boards[element.name]);
		});
		this.boards["board_speed_emoji"] = _front.createDiv({
			tag: "div",
			attributes: {
				id: "board_speed_emoji",
				textContent: "⚡",
				className: "gear-emoji",
			},
			style: {},
		});
		this.boards["board_speed"].appendChild(this.boards["board_speed_emoji"]);
		this.boards["board"].appendChild(this.boards["board_speed"]);
		document.body.appendChild(this.boards["board"]);
		let css =
			"#board{position:absolute;bottom:5px;right:5px;display: flex;align-items: center;}" +
			"#board_speed{display: flex;align-items: center;}" +
			".gear{line-height:0rem;margin:2px;width: 20px; height:20px; background-color: white;opacity:15%; border-radius:10%;display: flex;justify-content: center;align-items: center;}" +
			".gear-emoji{margin:2px;width: 24px; height:24px; border-radius:10%;display: flex;justify-content: center;align-items: center;}" +
			".gear-emoji.active{background-color: red; opacity:30%; }" +
			".gear.active{font-size:.8rem;background-color: yellow; border-radius:25%;transform:scale(1.1);background-color: white; opacity:initial;  }" +
			".gear:hover{font-size:.8rem;padding-bottom:2px;background-color: yellow; border-radius:25%;opacity:initial; }";
		_front.addCss(css, "board");
		this.boards["STOPPED"].classList.add("active");
		this.boardInitiated = true;
	},
	// ENGEENINERINERING
	get_engineStatus: function () {
		return this.status;
	},
	// ENGEENINERINERING
	set_engineStatus: function () {
		this.status.name = this.GEARS[this.status.currentGear].name;
		this.status.power = this.GEARS[this.status.currentGear].power;
	},
	powerUp: function () {
		if (this.delay.cur === 0) {
			if (this.status.currentGear < this.max) {
				this.status.currentGear++;
				this.set_engineStatus();
			}
			this.delay.cur++;
			this.refresh_board();
			this.boards["board_speed_emoji"].classList.add("active");
		}
	},
	powerDown: function () {
		if (this.delay.cur === 0) {
			if (this.status.currentGear > 0) {
				this.status.currentGear--;
				this.set_engineStatus();
			}
			this.delay.cur++;
			this.refresh_board();
			this.boards["board_speed_emoji"].classList.add("active");
		}
	},
	// UPDATER for delay reset
	update: function () {
		if (this.delay.cur > 0 && this.delay.cur < this.delay.max)
			this.delay.cur++;
		if (this.delay.cur >= this.delay.max) {
			this.delay.cur = 0;
			this.refresh_board("gears ready !!!");
			this.boards["board_speed_emoji"].classList.remove("active");
		}
	},
};

let _Shoot = {
	initiated: false,
	lastShootTime: 0, // Temps du dernier tir
	projectileType: "basic",
	projectilOrigine: undefined,
	projectiles: [], // Tableau pour suivre les projectiles actifs
	init: function (playerMesh, playerTurret, _scene, _physics) {
		this.playerMesh = playerMesh;
		this.playerTurret = playerTurret;
		this._physics = _physics;
		this._scene = _scene;
		this.initiated = true;
	},
	update: function () {
		if (this.initiated === true) {
			// Vérifier les projectiles et les supprimer s'ils ont dépassé leur temps de vie
			let now = performance.now() / 1000;
			this.projectiles = this.projectiles.filter((proj) => {
				if (now - proj.startTime >= 5) {
					// Supprimer le projectile du monde graphique et physique
					this._scene.scene.remove(proj.mesh);
					this._physics.physicsWorld.removeRigidBody(proj.body);
					return false;
				}
				return true;
			});
		}
	},
	projectileModels: {
		models: {
			basic: {
				mass: 1,
				inclination: -0.1, // Inclinaison du tir en radians (réglable)
				speed: 30, // Vitesse initiale du projectile (réglable)
				localShootCooldown: 0.3, // Délai minimum entre les tirs en secondes
				projectileGeometry: new THREE.BoxGeometry(0.25, 0.25, 0.25),
				projectileMaterial: new THREE.MeshBasicMaterial({
					color: Math.random() * 0xffffff,
				}),
			},
			basic2: {
				mass: 5,
				inclination: -0.3, // Inclinaison du tir en radians (réglable)
				speed: 15, // Vitesse initiale du projectile (réglable)
				localShootCooldown: 0.3,
				projectileGeometry: new THREE.SphereGeometry(0.25, 32, 32),
				projectileMaterial: new THREE.MeshBasicMaterial({
					color: Math.random() * 0xffffff,
				}),
			},
			basic3: {
				mass: 10,
				inclination: -0.8, // Inclinaison du tir en radians (réglable)
				speed: 10, // Vitesse initiale du projectile (réglable)
				localShootCooldown: 0.2,
				projectileGeometry: new THREE.SphereGeometry(0.5, 32, 32),
				projectileMaterial: new THREE.MeshBasicMaterial({
					color: Math.random() * 0xffffff,
				}),
			},
		},
		getModelDatas: function (modelName) {
			let model = this.models[modelName];
			let clone = new THREE.Mesh(
				model.projectileGeometry,
				model.projectileMaterial
			);

			clone.castShadow = true;
			clone.receiveShadow = true;
			model.mesh = clone.clone();
			return model;
		},
	},
	shoot: function (
		type = "basic",
		inclination = -0.2,
		speed = 5,
		originOffset = { x: 0, y: 0, z: 0 }
	) {
		if (this.initiated === true) {
			this.projectileType = type;
			let modelDatas = this.projectileModels.getModelDatas(
				this.projectileType
			);
			speed = modelDatas.speed; // ?? speed
			inclination = modelDatas.inclination; // ?? inclination
			// Test du délai
			let now = performance.now() / 1000; // Temps actuel en secondes
			if (now - this.lastShootTime < modelDatas.localShootCooldown) {
				return false; // Si le délai minimum n'est pas écoulé, ne pas tirer
			}
			// Si délai ok on réinitialise
			this.lastShootTime = now; // Mettre à jour le temps du dernier tir

			// Position globale de la tourelle
			let playerTurretWorldPosition = new THREE.Vector3();
			this.playerTurret.getWorldPosition(playerTurretWorldPosition);

			// Direction initiale (z avant dans le repère local)
			let direction = new THREE.Vector3(0, 0, 1);
			direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination); // Appliquer l'inclinaison

			// Rotation combinée du tank et de la tourelle
			let combinedQuaternion = this.playerMesh.quaternion
				.clone()
				.multiply(this.playerTurret.quaternion);
			direction.applyQuaternion(combinedQuaternion).normalize();

			// Position de départ du projectile
			let shootPosition = playerTurretWorldPosition
				.clone()
				.add(
					new THREE.Vector3(originOffset.x, originOffset.y, originOffset.z)
				);
			shootPosition.add(direction.clone().multiplyScalar(2)); // Ajustez la valeur selon les besoins pour que le projectile soit devant la tourelle

			// Positionner le projectile
			modelDatas.mesh.position.copy(shootPosition);
			modelDatas.mesh.name = "Projectile";

			// Ajouter le projectile à la scène
			this._scene.scene.add(modelDatas.mesh);

			// Ajouter le projectile au monde physique
			let projectileShape = new Ammo.btBoxShape(0.5, 0.5, 0.5);
			let transform = new Ammo.btTransform();
			transform.setIdentity();
			transform.setOrigin(
				new Ammo.btVector3(
					shootPosition.x,
					shootPosition.y,
					shootPosition.z
				)
			);

			let localInertia = new Ammo.btVector3(0, 0, 0);
			projectileShape.calculateLocalInertia(modelDatas.mass, localInertia);

			let motionState = new Ammo.btDefaultMotionState(transform);
			let rbInfo = new Ammo.btRigidBodyConstructionInfo(
				modelDatas.mass,
				motionState,
				projectileShape,
				localInertia
			);
			let body = new Ammo.btRigidBody(rbInfo);

			this._physics.physicsWorld.addRigidBody(body);

			modelDatas.mesh.userData.physicsBody = body;
			this._physics.rigidBody_List.push(modelDatas.mesh);

			// Appliquer la force initiale
			let force = direction.clone().multiplyScalar(speed);
			body.setLinearVelocity(new Ammo.btVector3(force.x, force.y, force.z));

			// Ajouter le projectile au tableau des projectiles actifs
			this.projectiles.push({
				mesh: modelDatas.mesh,
				body: body,
				startTime: now,
			});
			console.log("proj", modelDatas.mesh.name);

			return true;
		}
	},
};
export { _Engine, _Shoot };
