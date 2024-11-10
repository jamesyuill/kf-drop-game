import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

let xSpeed = 1;
let frames = 0;
let rateOfDroppage = 28;
let objects = [];
let isGameRunning = false;
let gameOver = false;
let timeStart, timeStop;
const startBtn = document.getElementById('startbtn');
const headerDiv = document.getElementById('header');

const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -10, 0),
});

//SCENE & CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 20, 35);
camera.rotation.set(-0.5, 0, 0);

//RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);

document.body.appendChild(renderer.domElement);

//LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

//FLOOR
const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Box(new CANNON.Vec3(12.3, 20, 0.1)),
});

groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
physicsWorld.addBody(groundBody);

const floorGeo = new THREE.BoxGeometry(24.5, 40, 0.2);
const floorMat = new THREE.MeshBasicMaterial({ color: 'grey' });
const floorMesh = new THREE.Mesh(floorGeo, floorMat);

scene.add(floorMesh);
floorMesh.rotation.x = -Math.PI / 2;

const positionArray = [
  -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
];

function createSphere() {
  //create random X position
  const randomX =
    positionArray[Math.floor(Math.random() * positionArray.length)];

  //PHYSICS SPHERE
  const randomRadius = Math.ceil(Math.random() * 2);

  const sphereBody = new CANNON.Body({
    mass: 100,
    shape: new CANNON.Sphere(2),
  });
  sphereBody.position.set(randomX, 3, -13);
  sphereBody.angularVelocity.set(20, 0, 0);
  physicsWorld.addBody(sphereBody);

  //GEOMETRY SPHERE
  const sphereGeo = new THREE.SphereGeometry(2);
  const sphereMat = new THREE.MeshMatcapMaterial({ color: 'white' });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphereMesh);

  return { sphereMesh, sphereBody };
}

//PLAYER
const playerBody = new CANNON.Body({
  mass: 2,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
});

playerBody.position.set(0, 1, 10);
playerBody.quaternion.setFromEuler(0, 0, 0);
physicsWorld.addBody(playerBody);

const playerGeo = new THREE.BoxGeometry(2, 2, 2);
const playerMat = new THREE.MeshMatcapMaterial({ color: 'red' });
const playerMesh = new THREE.Mesh(playerGeo, playerMat);

scene.add(playerMesh);
playerMesh.position.y = 0;

const cannonDebugger = new CannonDebugger(scene, physicsWorld, {});

//Check if player has fallen off the board
function checkHasFallen() {
  const pos = playerMesh.position.y;
  if (pos < -8) {
    gameOver = true;
    isGameRunning = false;
    timeStop = performance.now();
    // sound.stop();
    displayScore(gameOver);
  }
}

//display score
function displayScore(gameover) {
  if (gameover) {
    frames = 0;
    objects = [];
    rateOfDroppage = 40;
    let time = timeStop - timeStart;
    let secondsElapsed = Math.round(time / 1000);
    console.log(secondsElapsed);

    const container = document.getElementById('container');
    const scoreBoard = document.createElement('div');
    scoreBoard.setAttribute('id', 'scoreboard');
    scoreBoard.innerText = `Game Over Bro!
                  You lasted ${secondsElapsed} seconds`;
    container.appendChild(scoreBoard);
  }
}
//ANIMATE
function animate() {
  physicsWorld.fixedStep();
  // cannonDebugger.update();
  if (isGameRunning) {
    checkHasFallen();
    if (frames > 1200) {
      rateOfDroppage = 10;
      renderer.setClearColor(0x880021, 1);
    }
    if (frames % rateOfDroppage === 0) {
      const sphereBodyObj = createSphere();
      objects.push(sphereBodyObj);
    }

    if (objects.length) {
      for (let i = 0; i < objects.length; i++) {
        objects[i].sphereMesh.position.copy(objects[i].sphereBody.position);
        objects[i].sphereMesh.quaternion.copy(objects[i].sphereBody.quaternion);
      }
    }

    if (objects.length > 30) {
      const object = objects.shift();
      const sceneObj = scene.getObjectByProperty(
        'uuid',
        object.sphereMesh.uuid
      );

      sceneObj.geometry.dispose();

      sceneObj.material.dispose();
      scene.remove(sceneObj);
    }
  }
  playerMesh.position.copy(playerBody.position);
  playerMesh.quaternion.copy(playerBody.quaternion);

  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  if (isGameRunning) {
    frames += 1;
  }
}

animate();

//RESIZE WINDOW EVENT HANDLER
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//START BUTTON EVENT HANDLER
startBtn.addEventListener('click', () => {
  if (!isGameRunning) {
    isGameRunning = true;
    timeStart = performance.now();
    // sound.play();
    startBtn.remove();
    headerDiv.remove();
  }
});

//PLAYER KEYBOARD CONTROLS
document.addEventListener('keydown', onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  let keyCode = event.which;

  switch (keyCode) {
    case 37:
      playerMesh.position.x -= xSpeed;
      playerBody.position.x -= xSpeed;
      break;
    case 39:
      playerMesh.position.x += xSpeed;
      playerBody.position.x += xSpeed;
      break;
    case 38:
      playerMesh.position.z -= xSpeed;
      playerBody.position.z -= xSpeed;
      break;
    case 40:
      playerMesh.position.z += xSpeed;
      playerBody.position.z += xSpeed;
      break;
    case 32:
      playerMesh.position.y += xSpeed * 4;
      playerBody.position.y += xSpeed * 4;
      break;
  }
}
