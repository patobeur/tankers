"use strict";
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
class ModelsManager {
	conslog = true;
	_LOADER;
	_MeshDatasList = {
		Kimono_Female: {
			name: 'Kimono_Female',
			fullName: 'Alice',
			category: 'character',
			path: '/tankers/assets/gltf/toon/Kimono_Female.gltf',
			positions: { x: 0, y: 0, z: -2 },
			rotations: { x: false, y: false, z: false },
			scales: { x: 0.4, y: 0.4, z: 0.4 },
			anime: 'Idle'
		},
		Kimono_Male: {
			name: 'Kimono_Male',
			fullName: 'Bob',
			category: 'character',
			path: '/tankers/assets/gltf/toon/Kimono_Male.gltf',
			positions: { x: 0, y: 0, z: -2 },
			rotations: { x: false, y: false, z: false },
			scales: { x: 0.4, y: 0.4, z: 0.4 },
			anime: 'Idle'
		},
	}
	allMeshsAndDatas = {};
	mixers = [];
	allFbx = [];

	initiated = false
	constructor(datas) {
		this._fonctionretour = datas.fonctionretour;
		this._LOADER = new GLTFLoader();
		this._Init();
	}
	async _Init() {

		await this.LoadModelsFrom_list();
		this.allModelsAndAnimations = this.allMeshsAndDatas
		this.setMeshModel(
			'character',
			'Kimono_Female',
			'Idle'
		);
		this._fonctionretour(this.allMeshsAndDatas); // on lance la suite 
		this.initiated = true
	}

	setMeshModel(type = "character", name = "Kimono_Female", animName = "Idle") {
		this.currentAnimation = animName;

		let MODEL = this.allModelsAndAnimations[type][name]
		if (!MODEL) {
			console.error(`♥♦♣♠ Model ${name} of type ${type} not found.`);
			return;
		}

		this.charGltf = MODEL.gltf;
		this.MegaMixer = new THREE.AnimationMixer(MODEL.gltf.scene);
		this.MegaClip = THREE.AnimationClip.findByName(MODEL.gltf.animations, animName);
		if (!this.MegaClip) {
			console.error(`Animation ${animName} not found in model ${name}.`);
			return;
		}

		this.MegaAction = this.MegaMixer.clipAction(this.MegaClip);
		this.MegaAction.play(); // Joue l'animation par défaut

		// MODEL.gltf = this.charGltf;
		MODEL.MegaMixer = this.MegaMixer;
		MODEL.MegaClip = this.MegaClip;
		MODEL.MegaAction = this.MegaAction;


		MODEL.changeAnimation = (newAnimName) => {
			if (this.currentAnimation != newAnimName) {
				console.log(this.currentAnimation + ' to ' + newAnimName)
				this.currentAnimation = newAnimName;
				this.MegaClip = THREE.AnimationClip.findByName(
					MODEL.gltf.animations,
					newAnimName
				);
				this.MegaAction.stop();
				if (this.MegaClip) {
					this.MegaAction = this.MegaMixer.clipAction(this.MegaClip);
					this.MegaAction.play(); // Joue l'animation par défaut
				}
			}
		};
	}
	async LoadModelsFrom_list() {
		const indexedMeshs = [];
		for (const key in this._MeshDatasList) {
			if (this._MeshDatasList.hasOwnProperty.call(this._MeshDatasList, key)) {
				const meshAndDatas = this._MeshDatasList[key];
				indexedMeshs.push(this._LoadModel(meshAndDatas));
			}
		}
		await Promise.all(indexedMeshs);
	}

	async _LoadModel(meshAndDatas) {
		let positions = meshAndDatas.positions;
		let rotations = meshAndDatas.rotations;
		let scales = meshAndDatas.scales;
		let category = meshAndDatas.category;
		if (typeof meshAndDatas.path === "string") {
			await new Promise((resolve) => {
				this._LOADER.load(meshAndDatas.path, (gltf) => {
					gltf.scene.traverse((c) => (c.castShadow = true));
					if (positions) {
						gltf.scene.position.set(positions.x, positions.y, positions.z);
					}
					if (rotations) {
						if (rotations.x) gltf.scene.rotation.x = rotations.x;
						if (rotations.y) gltf.scene.rotation.y = rotations.y;
						if (rotations.z) gltf.scene.rotation.z = rotations.z;
					}
					if (scales) {
						if (scales.x) gltf.scene.scale.x = scales.x;
						if (scales.y) gltf.scene.scale.y = scales.y;
						if (scales.z) gltf.scene.scale.z = scales.z;
					}

					if (typeof this.allMeshsAndDatas[category] === "undefined") {
						this.allMeshsAndDatas[category] = {};
					}
					this.allMeshsAndDatas[category][meshAndDatas.name] = {
						mesh: gltf.scene,
						conf: meshAndDatas,
						gltf: gltf,
					};

					resolve();
				});
			});
		}
	}

	// AddModelsWithDefaultAnimation() {
	// 	for (const key in this.allMeshsAndDatas) {
	// 		if (this.allMeshsAndDatas.hasOwnProperty(key)) {
	// 			const category = this.allMeshsAndDatas[key];
	// 			for (const modelKey in category) {
	// 				if (category.hasOwnProperty(modelKey)) {
	// 					const model = category[modelKey];
	// 					TODO ACTIONS 
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return this.allMeshsAndDatas;
	// }
}
export { ModelsManager };
