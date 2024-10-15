import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { color } from 'three/examples/jsm/nodes/Nodes.js';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

let xSpeed = 1;
let ySpeed = 1;

const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -20, 0),
});

//-9.82

//SCENE & CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 35);

//RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x333333, 1);

document.body.appendChild(renderer.domElement);

//LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

//CAMERA CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.zoomSpeed = 7;
controls.dynamicDampingFactor = 0.1;
controls.update();

//FLOOR
const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Box(new CANNON.Vec3(10, 15, 0.1)),
});

groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
groundBody.quaternion.setFromEuler(-1, 0, 0);
physicsWorld.addBody(groundBody);

const floorGeo = new THREE.BoxGeometry(20, 30, 0.2);
const floorMat = new THREE.MeshBasicMaterial({ color: 'grey' });
const floorMesh = new THREE.Mesh(floorGeo, floorMat);
scene.add(floorMesh);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.rotation.x = -1;

//SPHERE

const radius = 1;
const sphereBody = new CANNON.Body({
  mass: 7,
  shape: new CANNON.Sphere(radius),
});
sphereBody.position.set(0, 20, -10);
physicsWorld.addBody(sphereBody);

//SPHERE GEOMETRY
const sphereGeo = new THREE.SphereGeometry(radius);
const sphereMat = new THREE.MeshNormalMaterial();
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphereMesh);

//PLAYER
const playerBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
});

playerBody.position.set(0, -2, 6);
playerBody.quaternion.setFromEuler(3.7, 0, 0);
physicsWorld.addBody(playerBody);

const playerGeo = new THREE.BoxGeometry(2, 2, 2);
const playerMat = new THREE.MeshNormalMaterial();
const playerMesh = new THREE.Mesh(playerGeo, playerMat);
scene.add(playerMesh);
playerMesh.position.y = 0;

const cannonDebugger = new CannonDebugger(scene, physicsWorld, {});

//ANIMATE
function animate() {
  physicsWorld.fixedStep();
  cannonDebugger.update();
  sphereMesh.position.copy(sphereBody.position);
  sphereMesh.quaternion.copy(sphereBody.quaternion);
  playerMesh.position.copy(playerBody.position);
  playerMesh.quaternion.copy(playerBody.quaternion);
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

//EVENT HANDLER
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//PLAYER KEYBOARD CONTROLS
document.addEventListener('keydown', onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  console.log(event.which);
  let keyCode = event.which;
  if (keyCode == 65) {
    playerMesh.position.x -= xSpeed;
    playerBody.position.x -= xSpeed;
  } else if (keyCode == 68) {
    playerMesh.position.x += xSpeed;
    playerBody.position.x += xSpeed;
  }
  //space bar
  // else if (keyCode == 32) {
  //   playerMesh.position.set(0, 0, 0);
  //   playerBody.position.set(0, 0, 0);
  // }
}
