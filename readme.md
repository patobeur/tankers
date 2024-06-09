### Tankers v2

watch out ! nodes_mudules
```html
<script src="/node_modules_min/three/examples/jsm/libs/ammo.wasm.js"></script>
<script type="importmap">
	{
		"imports": {
		"three": "/node_modules_min/three/build/three.module.js",
		"three/addons/": "/node_modules_min/three/examples/jsm/"
		}
	}
</script>
```

You dont need npm install. Or u will need to change path or copy full folder.
using this because node_modules_min is now 2.4Mo and node_modules_min is around 70Mo+

