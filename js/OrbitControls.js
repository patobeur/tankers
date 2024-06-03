import * as THREE from "three";
let _OrbitControls = {
	active: false,
	player: undefined,
	camera: undefined,
	raycaster: new THREE.Raycaster(),
	collisionDistance: 1.5, // Distance minimale de la caméra par rapport aux objets
	defaultCameraPosition: new THREE.Vector3(), // Pour stocker la position initiale de la caméra
	lastValidCameraPosition: new THREE.Vector3(), // Pour stocker la dernière position valide de la caméra sans collision

	// ------------------------
	// CAMERA PIVOTS 
	// ------------------------
	cubepitch: new THREE.Mesh(new THREE.BoxGeometry(.15, .05, .25), new THREE.MeshPhongMaterial({ color: 0xFF0000 })),
	cubeyaw: new THREE.Mesh(new THREE.BoxGeometry(.05, .15, .25), new THREE.MeshPhongMaterial({ color: 0x00FF00 })),
	cuberoll: new THREE.Mesh(new THREE.BoxGeometry(.05, .15, .25), new THREE.MeshPhongMaterial({ color: 0x0000ff })),
	// ------------------------
	// INIT
	// ------------------------
	init: function (_scene, _Player) {
		this.scene = _scene
		this.camera = this.scene.camera
		this.player = _Player

		this.groupe = new THREE.Group()
		this.groupe.position.y = 0
		this.groupe.position.x = 0
		this.groupe.position.z = -.75
		this.cubeyaw.position.x = .25
		this.cubepitch.position.x = -.25
		this.groupe.add(this.cubeyaw, this.cubepitch, this.cuberoll)
		_Player.playerTurret.add(this.groupe)

		_Player.playerTurret.add(this.camera)

		this.camera.position.z = -8;
		this.camera.rotation.z = -Math.PI
		this.camera.position.y = 2;
		this.camera.lookAt(new THREE.Vector3(0, 0, 5))
		this.active = true


		this.defaultCameraPosition.copy(this.camera.position); // Stocke la position initiale de la caméra
		this.lastValidCameraPosition.copy(this.camera.position); // Initialise la dernière position valide
	},

	checkCollisions: function () {
		const origin = this.player.playerTank.position.clone();
		const direction = this.camera.position.clone().sub(origin).normalize();
		this.raycaster.set(origin, direction);

		const intersects = this.raycaster.intersectObjects(this.scene.scene.children, true);
		if (intersects.length > 0) {
			const distance = intersects[0].distance;
			if (distance < this.collisionDistance) {
				const safeDistance = Math.max(distance - 0.1, this.collisionDistance); // Distance sécurisée
				const newPosition = direction.multiplyScalar(safeDistance).add(origin);
				this.camera.position.lerp(newPosition, 0.2); // Lerp pour adoucir le mouvement

				// Si l'obstacle est trop proche, monter la caméra
				if (safeDistance <= this.collisionDistance) {
					this.camera.position.y += 0.05;
				}
			}
		} else {
			this.lastValidCameraPosition.copy(this.camera.position); // Mettre à jour la dernière position valide
		}
	},

	update: function () {
		if (this.active === true) {
			_OrbitControls.cuberoll.rotation.y = this.player.playerTank.rotation.y + 0;
			// this.checkCollisions();
		}
	},

	//-----------------
	onDocumentMouseMove: function (e) {
		_OrbitControls.cubeyaw.rotation.y -= e.movementX * 0.002;
		_OrbitControls.cubepitch.rotation.x += e.movementY * 0.002;
		_OrbitControls.player.playerTurret.rotation.y = _OrbitControls.cubeyaw.rotation.y;
		return false;
	},
	onDocumentMouseWheel: function (e) {
		_OrbitControls.camera.translateZ((e.deltaY >= 0) ? 1 : -1);

		const hauteur = _OrbitControls.camera.position.y + e.deltaY * 0.001;
		if (hauteur >= 0 && hauteur <= 5) {
			_OrbitControls.camera.position.y = hauteur;
		}

		_OrbitControls.lastValidCameraPosition.copy(_OrbitControls.camera.position); // Mise à jour de la dernière position valide lors du zoom
		return false;
	}
};

export { _OrbitControls }
