"use strict";
import * as THREE from "three";

let _Shoot = {
	initiated: false,
	lastShootTime: 0, // Temps du dernier tir
	projectileType: 'basic',
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
			console.log('remove ???')
			// Vérifier les projectiles et les supprimer s'ils ont dépassé leur temps de vie
			let now = performance.now() / 1000;
			this.projectiles = this.projectiles.filter(proj => {
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
			'basic': {
				mass: 1,
				inclination: -0.1, // Inclinaison du tir en radians (réglable)
				speed: 30, // Vitesse initiale du projectile (réglable)
				localShootCooldown: 0.3, // Délai minimum entre les tirs en secondes
				projectileGeometry: new THREE.BoxGeometry(.25, .25, .25),
				projectileMaterial: new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff }),
			},
			'basic2': {
				mass: 5,
				inclination: -0.3, // Inclinaison du tir en radians (réglable)
				speed: 15, // Vitesse initiale du projectile (réglable)
				localShootCooldown: 0.3,
				projectileGeometry: new THREE.SphereGeometry(.25, 32, 32),
				projectileMaterial: new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff }),
			},
			'basic3': {
				mass: 10,
				inclination: -0.8, // Inclinaison du tir en radians (réglable)
				speed: 10, // Vitesse initiale du projectile (réglable)
				localShootCooldown: 0.2,
				projectileGeometry: new THREE.SphereGeometry(.5, 32, 32),
				projectileMaterial: new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff }),
			}
		},
		getModelDatas: function (modelName) {
			let model = this.models[modelName];
			let clone = new THREE.Mesh(model.projectileGeometry, model.projectileMaterial);

			clone.castShadow = true;
			clone.receiveShadow = true;
			model.mesh = clone.clone();
			return model;
		}
	},
	shoot: function (type = 'basic', inclination = -0.2, speed = 5, originOffset = { x: 0, y: 0, z: 0 }) {
		if (this.initiated === true) {
			this.projectileType = type;
			let modelDatas = this.projectileModels.getModelDatas(this.projectileType);
			speed = modelDatas.speed// ?? speed
			inclination = modelDatas.inclination// ?? inclination
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
			let combinedQuaternion = this.playerMesh.quaternion.clone().multiply(this.playerTurret.quaternion);
			direction.applyQuaternion(combinedQuaternion).normalize();

			// Position de départ du projectile
			let shootPosition = playerTurretWorldPosition.clone().add(new THREE.Vector3(originOffset.x, originOffset.y, originOffset.z));
			shootPosition.add(direction.clone().multiplyScalar(2)); // Ajustez la valeur selon les besoins pour que le projectile soit devant la tourelle

			// Positionner le projectile
			modelDatas.mesh.position.copy(shootPosition);
			modelDatas.mesh.name = 'Projectile';

			// Ajouter le projectile à la scène
			this._scene.scene.add(modelDatas.mesh);

			// Ajouter le projectile au monde physique
			let projectileShape = new Ammo.btBoxShape(0.5, 0.5, 0.5);
			let transform = new Ammo.btTransform();
			transform.setIdentity();
			transform.setOrigin(new Ammo.btVector3(shootPosition.x, shootPosition.y, shootPosition.z));

			let localInertia = new Ammo.btVector3(0, 0, 0);
			projectileShape.calculateLocalInertia(modelDatas.mass, localInertia);

			let motionState = new Ammo.btDefaultMotionState(transform);
			let rbInfo = new Ammo.btRigidBodyConstructionInfo(modelDatas.mass, motionState, projectileShape, localInertia);
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
				startTime: now
			});
			console.log('proj', modelDatas.mesh.name);

			return true;
		}
	},
}
export { _Shoot }
