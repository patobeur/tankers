
"use strict";
import * as THREE from "three";
import { _scene, } from '/js/scene.js'
import { _physics } from '/js/physics.js';
import { _player } from '/js/player.js';
import { _GLTFLoader, _TextureLoader } from '/js/loaders.js';
import { _OrbitControls } from '/js/OrbitControls.js';

import Stats from 'three/addons/libs/stats.module.js';
let initWorld = () => {
	let delta = 0;
	let clock = new THREE.Clock()
	let stats = new Stats();
	stats.dom.style.top = 'initial'
	stats.dom.style.bottom = '0'

	// ------------------------
	// ANIMATION
	// ------------------------
	const animate = function (time) {
		requestAnimationFrame(animate);
		delta = clock.getDelta();
		if (_scene.SUN.userData.initiated) _scene.SUN.move();

		if (_player && _player.initiated) _player.checkActions(delta, time); // Vérifier si le joueur bouge

		if (typeof _OrbitControls === 'object') _OrbitControls.update();

		_physics.updateWorldPhysics(delta, time);

		_scene.renderer.render(_scene.scene, _scene.camera);

		stats.update();
	};
	let starter = () => {
		document.body.appendChild(stats.dom);
		_physics._initPhysicsWorld()
		_scene.init(_physics)


		_player.init(_physics, _GLTFLoader)

		// _physics.addRandomPlat(_scene, 20)
		// _physics.addRandomBox(_scene, 20)
		// _physics.addRandomSphere(_scene, 20)

		_scene.renderer.render(_scene.scene, _scene.camera);
		_OrbitControls.init(_scene, _player)

		animate(0);
	}
	// ------------------------
	// loadAssets
	// ------------------------
	const loadAssets = () => {
		let root = '';
		_GLTFLoader.init(root, () => {
			_TextureLoader.init(root, starter)
		})
	}
	loadAssets()
}
Ammo().then(() => {
	initWorld()
});
