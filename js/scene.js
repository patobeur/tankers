"use strict";
import * as THREE from "three";
import { BoxLineGeometry } from 'three/addons/geometries/BoxLineGeometry.js';
import { _GLTFLoader, _TextureLoader } from '/js/loaders.js';
import { _physics } from '/js/physics.js';
let _consoleOn = false
let _scene = {
	// SCENE CREATION
	set_scene: function () {
		this.scene = new THREE.Scene();
		this.scene.name = 'lv0';
		if (_consoleOn) console.log('0', this.scene)
	},
	// CAMERA
	set_camera: function () {
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.name = 'first'
		this.camera.lookAt(new THREE.Vector3(0, 1, 0))
		this.camera2 = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera2.name = 'secour'
	},
	// RENDERER
	set_renderer: function () {
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
		this.renderer.autoClear = true
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping
		this.renderer.toneMappingExposure = 1
		this.renderer.setClearColor(0x000010, 1.0);
		this.renderer.shadowMap.enabled = true
		document.body.appendChild(this.renderer.domElement);
	},
	// ROOM (décor)
	set_roomGrid: function () {
		this.room = new THREE.LineSegments(
			new BoxLineGeometry(39, 39, 39, 20, 20, 20),
			new THREE.LineBasicMaterial({ color: 0xffffff })
		);
		this.room.position.y = 19
		this.scene.add(this.room);
	},
	// SUN light
	set_sun: function (active = false) {
		this.SUN = new THREE.DirectionalLight(0xffffff, 1);
		this.SUNhelper = new THREE.DirectionalLightHelper(this.SUN, 20, 0xffff00);
		this.SUN.name = 'SUN';
		this.SUN.userData.d = 10;
		this.SUN.userData.initiated = active;
		this.SUN.userData.speed = 0.01;
		this.SUN.userData.amplitude = { range: 5, sens: 1 }
		this.SUN.position.set(0, 3, 0);
		this.SUN.shadow.mapSize.width = 2048; // default
		this.SUN.shadow.mapSize.height = 2048; // default
		this.SUN.shadow.camera.near = 1; // default
		this.SUN.shadow.camera.far = 100; // default
		this.SUN.shadow.camera.left = -this.SUN.userData.d;
		this.SUN.shadow.camera.right = this.SUN.userData.d;
		this.SUN.shadow.camera.top = this.SUN.userData.d;
		this.SUN.shadow.camera.bottom = -this.SUN.userData.d;
		this.SUN.castShadow = true

		const SunCubeGeometry = new THREE.BoxGeometry(.3, .3, .3);
		const SunCubeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
		this.SUNCube = new THREE.Mesh(SunCubeGeometry, SunCubeMaterial);
		this.SUN.add(this.SUNCube)
		this.SUN.add(this.SUNhelper)

		this.SUN.move = () => {
			if (this.SUN.userData.initiated) {
				if (this.SUN.position.x >= this.SUN.userData.amplitude.range) this.SUN.userData.amplitude.sens = -1;
				if (this.SUN.position.x <= -this.SUN.userData.amplitude.range) this.SUN.userData.amplitude.sens = 1;
				this.SUN.position.x = this.SUN.position.x + (this.SUN.userData.amplitude.sens * this.SUN.userData.speed)
			}
		}
		this.SUN.starter = function () {
			if (this.userData.initiated) this.move()
			return this
		}
	},
	// POINT light
	set_lights: function () {
		const pointLight1 = new THREE.PointLight(0xff0000, 1, 100);
		pointLight1.position.set(2, 1, 2);
		const pointLight2 = new THREE.PointLight(0x0000ff, 1, 100);
		pointLight2.position.set(-2, 1, -2);
		this.scene.add(pointLight2);
		this.scene.add(pointLight1);
		this.ambientLight = new THREE.AmbientLight(0xFFFFFF, .8); // soft white light
		this.scene.add(this.ambientLight);
	},
	// Initialisation de la Scene et Loire
	init: function () {
		this.set_scene()
		this.set_camera()
		this.set_renderer()
		this.set_roomGrid()
		this.set_sun(true)
		this.set_lights()



		this.init_floor('ok')
		this.init_decor('ok')
		this.init_environment('ok')


		this.scene.add(this.SUN.starter());
		// ------------------------
		// Handle window resizing
		// ------------------------
		window.addEventListener('resize', () => {
			_scene.renderer.setSize(window.innerWidth, window.innerHeight);
			_scene.camera.aspect = window.innerWidth / window.innerHeight;
			_scene.camera.updateProjectionMatrix();
		});
	},
	init_floor: function (what) {
		console.log('init_floor', what)
		let config = _physics.modelsPhysics.floorOne
		console.log(config)
		_physics.set_MeshAndPhysics(config, _scene)
		_scene.scene.add(config.mesh)
	},
	init_environment: function (what) {
		console.log('init_environment', what)
		const textureEquirec = _TextureLoader.textures['sky'].map
		textureEquirec.mapping = THREE.EquirectangularReflectionMapping
		textureEquirec.encoding = THREE.sRGBEncoding
		_scene.scene.environment = textureEquirec
		_scene.scene.background = textureEquirec


	},
	init_decor: function (what) {
		console.log('init_decor', what)
		for (const key in _physics.modelsPhysicsAuto) {
			if (Object.hasOwnProperty.call(_physics.modelsPhysicsAuto, key)) {
				let config = _physics.modelsPhysicsAuto[key]
				_physics.set_MeshAndPhysics(config, _scene)
				_scene.scene.add(config.mesh)
			}
		}

		let config = _physics.modelsPhysics.floorOne
		_physics.set_MeshAndPhysics(config, _scene)
		_scene.scene.add(config.mesh)
		this.floorOne = _physics.modelsPhysics.floorOne.mesh
	},


}
export { _scene, }
