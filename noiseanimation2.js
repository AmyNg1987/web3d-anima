// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const glsl = require("glslify");
const Random = require('canvas-sketch-util/random');

const settings = {
  duration: 30,
  fps: 60,        ///24 fps for, 540, 540dimension for gif
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
  renderer.setClearColor("#89c", 1);

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
 
  const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main () {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
  }

  `;
  const fragmentShader =  glsl(/* glsl */ `
  #pragma glslify: noise = require('glsl-noise/simplex/3d');
  #pragma glslify: aastep = require('glsl-aastep');
  #define PI 3.14
  varying vec2 vUv; //the base uv/pixels
  varying vec3 vPosition; //the base uv/pixels
  uniform vec3 color; //varying can be passed down to the code, varying means the values change across the face
  uniform float time;
  uniform mat4 modelMatrix;

float sphereRim (vec3 spherePosition) {
  vec3 normal = normalize(spherePosition.xyz);
  vec3 worldNormal = normalize(mat3(modelMatrix) * normal.xyz);
  vec3 worldPosition = (modelMatrix * vec4(spherePosition, 1.0)).xyz;
  vec3 V = normalize(cameraPosition - worldPosition);
  float rim = 1.0 - max(dot(V, worldNormal), 0.0);
  return pow(smoothstep(0.0, 1.0, rim), 0.7);
}

  uniform vec3 points[POINT_COUNT];
void main () {
  
  float dist = 10000.0;

  for (int i = 0; i < POINT_COUNT; i++) {

    vec3 p = points[i];
    float d = distance(vPosition, p);
    dist = min(d, dist);

  }

  float mask = aastep(0.15, dist); 
  mask = 1.0 - mask;

  vec3 fragColor = mix(color, vec3(1.0), mask);

  //a value between 0 to .1
  float rim = sphereRim(vPosition);
  fragColor += rim * 0.35;

  gl_FragColor = vec4(vec3(fragColor), 1.0);  

  // if (mask > 0.5) discard;

}
`);

   // a % b = mod(a, b) //this is in glsl
   //pos is position
   //center of 2 dimensional space vec2 0.5,0.5
    //line 59 if d is greater than .25 make it 1 otherwise 0
    //line 61 inverts the value
 //line 52 from     gl_FragColor = vec4(vec3(vUv.x) * color, 1.0); vUv.x can also be vUv.x * int
console.log(points);
  // Setup a material
  const material = new THREE.ShaderMaterial({
    defines: {
      POINT_COUNT: points.length  //
    },
    side: THREE.DoubleSide, //this and   if (mask > 0.5) discard; creates holes
    extensions: {
      derivatives: true       // extensions and derivates are used in aastep package
    },
    uniforms: {
      points: { value: points },
      time: { value: 0 },
      color: { value: new THREE.Color("#235")}
    },
    vertexShader,
    fragmentShader
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const moonMaterial = new THREE.ShaderMaterial({ //meshnormalmaterial is good for debugging, mesh basic material can add texture/image, meshstandardmaterial can have lights
    defines: {
      POINT_COUNT: points.length  //
    },
    side: THREE.DoubleSide, //this and   if (mask > 0.5) discard; creates holes
    extensions: {
      derivatives: true       // extensions and derivates are used in aastep package
    },
    uniforms: {
      points: { value: points },
      time: { value: 0 },
      color: { value: new THREE.Color("#8cd")}
    },
    vertexShader,
    fragmentShader
  });

  const moonGroup = new THREE.Group(); //Group = parent; we're creating moongroup as anchor/container, empty materialmesh same as container size
  const moonMesh = new THREE.Mesh(geometry, moonMaterial);
  moonMesh.position.set(-2, 1.0, 2.0)
  moonMesh.scale.setScalar(0.5)
  scene.add(moonMesh);
  scene.add(moonGroup);
  moonGroup.add(moonMesh);


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
    render({ time, playhead }) {                    //use playhead with time with the equation in next line so rotation is smooth
      mesh.rotation.y = playhead * Math.PI * 2;
      moonMesh.rotation.y = playhead * Math.PI * 8;
      moonGroup.rotation.y = playhead * Math.PI * 6;
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
