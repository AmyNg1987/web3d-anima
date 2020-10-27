// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const glsl = require("glslify");
const Random = require('canvas-sketch-util/random');

const settings = {
  // Make the loop animated
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
  renderer.setClearColor("#fff", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 32, 16);

  const baseGeom = new THREE.IcosahedronGeometry(1, 1); //dont change 0 to 100 or high numbers or comp crash
  const points = baseGeom.vertices;

  const circleGeom = new THREE.CircleGeometry(1, 32);
 
  //44 -> 56 is what makes the icosahedron mesh appear on the spheregeometry
  points.forEach(point => {
    const mesh = 
    new THREE.Mesh
    (circleGeom, 
      new THREE.MeshBasicMaterial({
      color: "black",
      side: THREE.BackSide,
    })
    );
    mesh.position.copy(point);    //.multiplyScalar(1.5); 
    mesh.scale.setScalar(Random.range(0.25, 1) * 0.25);    //0.25 /Random.gaussian(0.25, 1) * 0.25); Random.range(0.25, 1) * 0.25);
    mesh.lookAt(new THREE.Vector3());  //look at the center which is an empty new vector
    scene.add(mesh);
  });
  const vertexShader = /* glsl */ `
    varying vec2 vUv;
  void main () {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
  }

  `;

  const fragmentShader =  glsl(/* glsl */ `
    #pragma glslify: noise = require('glsl-noise/simplex/3d');
    varying vec2 vUv; //the base uv/pixels
    uniform vec3 color; //varying can be passed down to the code, varying means the values change across the face
    uniform float time;
   // a % b = mod(a, b) //this is in glsl
   //pos is position
   //center of 2 dimensional space vec2 0.5,0.5
    //line 59 if d is greater than .25 make it 1 otherwise 0
    //line 61 inverts the value
  void main () {
    vec2 center = vec2(0.5, 0.5); 
    vec2 q = vUv;
    q.x *= 2.0;
  
    // a % b = mod(a, b);
    vec2 pos = mod(q * 18.0, 1.0);  //1.0 is the limit of the geometry

    float d = distance(pos, center);

    // float mask = step(0.25 + sin(time + vUv.y * 0.15), d);  //d > 0.25 ? 1.0 : 0.0; can be expressed as step(0.25, d) makes it more optimized; vUv.x 0.25 is the modifier

    vec2 noiseInput = floor(q * 10.0); //floor makes the animation timed evenly throughout different uv areas
    float offset = noise(vec3(noiseInput.xy, time)) *0.15;

    float mask = step(0.25 + offset, d);

    mask = 1.0 - mask;

    vec3 fragColor = mix(color, vec3(2.4), mask); //this is to tweak the color

    gl_FragColor = vec4(vec3(color), 1.0);  

  }
  `); //line 52 from     gl_FragColor = vec4(vec3(vUv.x) * color, 1.0); vUv.x can also be vUv.x * int

  // Setup a material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color("indigo")}
    },
    vertexShader,
    fragmentShader
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      material.uniforms.time.value = time;
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
