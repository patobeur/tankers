
"use strict";
import * as THREE from "three";
import { _scene, } from '/js/scene.js'
import { _physics } from '/js/physics.js';
import { _player } from '/js/player.js';
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

		_physics.updateWorldPhysics(delta, time);

		_scene.renderer.render(_scene.scene, _scene.camera);

		stats.update();
	};
	let starter = () => {
		_scene.init(_physics)
		document.body.appendChild(stats.dom);
		_physics._initPhysicsWorld()


		_scene.init_floor('ok')
		_scene.init_decor('ok')

		_player.init(_physics)

		_physics.addRandomPlat(_scene, 20)
		_physics.addRandomBox(_scene, 20)
		_physics.addRandomSphere(_scene, 20)
		_player.playerMesh.add(_scene.camera)

		_scene.renderer.render(_scene.scene, _scene.camera);

		animate(0);
	}
	// ------------------------
	// loadAssets
	// ------------------------
	const loadAssets = () => {
		starter()
	}
	loadAssets()
}
Ammo().then(() => {
	initWorld()
});
