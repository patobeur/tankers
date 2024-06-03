"use strict";
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const _consoleOn = false
const _formulas = {
	rand: (min, max) => { return Math.floor(Math.random() * (max - min + 1) + min) }
}
const _front = {
	id: new Number(0),
	createDiv: function (params) {
		let element = document.createElement(params.tag);
		if (params.attributes) {
			for (const key in params.attributes) {
				if (Object.hasOwnProperty.call(params.attributes, key))
					element[key] = params.attributes[key];
				if (params.style) {
					for (const key2 in params.style) {
						if (Object.hasOwnProperty.call(params.style, key2))
							element.style[key2] = params.style[key2];
					}
				}
			}
		}
		return element;
	},
	addCss(stringcss, styleid) {
		let style = document.createElement("style");
		style.textContent = stringcss;
		style.id = "css_" + styleid;
		document.getElementsByTagName("head")[0].appendChild(style);
	},
	sanitize: function (string) {
		const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "./": "&#x2F;" };
		const reg = /[&<>"'/]/gi;
		return string.replace(reg, (match) => map[match]);
	},
	// rand: (min, max) => {return Math.floor(Math.random() * (max - min + 1) + min);},
	// get_DegreeWithTwoPos: function (x, y, X, Y) { return (Math.atan2(Y - y, X - x) * 180) / Math.PI; },
	// get_aleaVector3: function (min,max) {return {x: this.rand(min,max),y: this.rand(min,max),z: this.rand(min,max)}}
};
let _GLTFLoader = {
	// ------------------------
	// GLTFLoader for GLTF MESH
	// ------------------------
	root: undefined,
	demoActive: false,
	_consoleOn: false,
	callback: () => { if (this._consoleOn) console.log('no call back function for _GLTFLoader') },
	gltfLoader: undefined,
	models: {},
	modelsActive: {},
	loadCounter: 0,
	list: [
		// { name: 'tank0', file: '/assets/gltf/tank/tank_black.gltf', position: { x: -2, y: 0.5, z: -4 } },
		// { name: 'tank3', file: '/assets/gltf/tank/tank_white.gltf', position: { x: 0, y: 0.5, z: -4 } },
		// { name: 'tank2', file: '/assets/gltf/tank/tank_red.gltf', position: { x: 2, y: 0.5, z: -4 } },
		// { name: 'tank4', file: '/assets/gltf/tank/tank_green.gltf', position: { x: 4, y: 0.5, z: -4 } },
		{ name: 'tank1', file: '/assets/gltf/tank/tankAlpha.gltf', position: { x: 0, y: -.260, z: -.03 } },
	],
	addModelsToScene: function (scene) {
		for (const key in this.models) {
			scene.add(this.models[key]);
		}
		this.demoActive = true
	},
	rotTankBase: function (name = 'tank2') {
		if (this.demoActive = true) {
			this.models.tank0.children[0].children[3].rotation.y += 0.01
			this.models.tank0.children[0].rotation.y -= 0.01

			this.models.tank2.children[0].children[3].rotation.y += 0.01
			this.models.tank2.children[0].rotation.y += 0.009

			this.models.tank1.children[0].children[3].rotation.y -= 0.01
		}
	},
	init: function (root = '', callbackFunction = this.callback) {
		this.root = root
		// if (typeof callbackFunction === 'function') callbackFunction = this.callback;
		this.gltfLoader = new GLTFLoader();
		this.list.forEach(element => {
			element.file = this.root + element.file
			this.gltfLoader.load(
				element.file,
				(gltf) => {
					this.loadCounter++;
					const model = gltf.scene;
					model.position.x = element.position.x;
					model.position.z = element.position.z;
					model.position.y = element.position.y;
					model.traverse((node) => {
						if (node.isMesh) {
							node.receiveShadow = true
							node.castShadow = true;
						}
					});
					this.models[element.name] = model
					if (this._consoleOn) console.log('Model ' + element.name + ' loaded', model);
					if (this.loadCounter === this.list.length) {
						console.log('_GLTFLoader', 'ok', this.list.length + ' gltf loaded...')
						callbackFunction();
					}
				}, undefined, (error) => {
					console.error('_GLTFLoader', error);
				}
			);
		});
	}
}
let _TextureLoader = {
	root: undefined,
	callback: () => { if (this._consoleOn) console.log('no call back function for _TextureLoader') },
	textures: {},
	counter: 0,
	textureLoader: new THREE.TextureLoader(),
	files: [
		{ name: 'road2', path: '/assets/textures/', fileName: 'road2.jpg' },
		{ name: 'sky', path: '/assets/textures/', fileName: 'sky.jpg' },
	],
	init: function (root = '', callbackFunction = this.callback) {
		this.root = root
		this.callbackFunction = callbackFunction
		this.counter = 0
		// Chargement des textures pour chaque objet
		this.files.forEach(file => {
			this.addToStack(file)
		});
	},
	checkEnd: function () {
		if (this.counter === this.files.length) {
			console.log('_TextureLoader', 'ok', this.files.length + ' files loaded...')
			this.callbackFunction('_TextureLoader ok')
		}
	},
	addToStack: function (file) {
		this.loadTexture(file, (map) => {
			this.counter++;
			map.name = file.name
			this.textures[file.name] = { map: map, name: file.name }
			if (this._consoleOn) console.log('texture loaded', file.fileName, this.counter + '/' + this.files.length)
			this.checkEnd()
		});
	},
	loadTexture: function (file, callback) {
		// Chargement de la texture
		let fileurl = this.root + file.path + file.fileName
		this.textureLoader.load(
			fileurl,
			(texture) => {
				// La texture a été chargée avec succès !!!
				callback(texture);
			},
			(xhr) => {
				// Progression du chargement de la texture (optionnel)
				const percentLoaded = (xhr.loaded / xhr.total) * 100;
				// this.texturesDivByName[file.name].style.width = (100 - percentLoaded) + '%'
				if (this._consoleOn) console.log('Texture chargée :' + `${percentLoaded}% ${file.fileName} `);
			},
			(error) => {
				console.error('Erreur de chargement de la texture :', error);
			}
		);
	},
};
export { _GLTFLoader, _TextureLoader, _front }
