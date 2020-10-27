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
  const geometry = new THREE.SphereGeometry(1, 32, 16); //spheregeomerty


  //setup mesh with geometry + material
  const loader = new THREE.TextureLoader();
  const texture = new loader.load('earth.jpg');
  const moonTexture = new loader.load('moon.jpg');


  // Setup a material
  const material = new THREE.MeshStandardMaterial({ //meshnormalmaterial is good for debugging
    roughness: 1,
    metalness: 0,
    map: texture
    
    
    // flatShading: true,
    // color: "red", 
    // wireframe: true
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);


  const moonMaterial = new THREE.MeshStandardMaterial({ //meshnormalmaterial is good for debugging, mesh basic material can add texture/image, meshstandardmaterial can have lights
    roughness: 1,
    metalness: 1,
    map: moonTexture

  });
  const moonGroup = new THREE.Group(); //Group = parent; we're creating moongroup as anchor/container, empty materialmesh same as container size
  const moonMesh = new THREE.Mesh(geometry, moonMaterial);
  moonMesh.position.set(5, 0.5, 0)
  moonMesh.scale.setScalar(0.3)
  moonGroup.add(moonMesh);
  scene.add(moonGroup);

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
      moonMesh.rotation.y = time; //time is a const, so as number goes up the y follows
      moonGroup.rotation.y = 0.6 * time;
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
