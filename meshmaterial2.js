// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  // dimensions:  [12, 12], //"A4", not using with default to fullscreen
  // units: "in", //inch
  // pixelsPerInch: "72", //dpi
  // scaleToView: true,  //lower GPU 
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100); //field of view(FOV), aspect ratio, near, far - whether u can see near/far object
  camera.position.set(2, 2, -8);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.TorusGeometry(1, 0.5, 32, 64); // outerradius, inner radius, segments, poly
  
  // const geometry = new THREE.SphereGeometry(1, 32, 16); //xyz axes


  //setup mesh with geometry + material
  const loader = new THREE.TextureLoader();
  const map = loader.load("brick-diffuse.jpg");
  map.wrapS = map.wrapT = THREE.RepeatWrapping; //wrap texture on teh geometry seamlessly
  map.repeat.set(2, 1).multiplyScalar(2); //repeat texture multiplyScalar scales the repeat sectors
  
  const normalMap = loader.load("brick-normal.jpg");
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping; //normalMap gives the texture
  normalMap.repeat.copy(map.repeat); //map.repeat here repeats the map.repeat.set above
  
  // Setup a material
  const normalStrength = 1; //intensity of texture
  const material = new THREE.MeshStandardMaterial({
    roughness: 0.85,
    metalness: 0.5,
    normalScale: new THREE.Vector2(1,1).multiplyScalar(normalStrength), //normalscale is a vector2
    normalMap,
    map
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);


  const light = new THREE.PointLight('white', 1); //args: color, intensity, distance, decay
  light.position.set(-2, 3, -4);
  mesh.add(light);


  scene.add(new THREE.PointLightHelper(light,0.15)); //to add light position in the scene
  scene.add(new THREE.GridHelper(5, 15, 'grey')); //to add grid position in the scene

  var axesHelper = new THREE.AxesHelper( 5 ); //to add axeshelper
scene.add( axesHelper );

  // Handle resize events here
  // draw each frame
  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      mesh.rotation.y = 0.3*time; //time is a const, so as number goes up the y follows
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
