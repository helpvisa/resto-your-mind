// imports
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as CANNON from 'cannon-es';
// classes
import { PhysWorld } from './classes/PhysWorld';
import { Scene } from './classes/Scene';
import { Dice } from './classes/Dice';
import { Plane } from './classes/Plane';
// import debugger
import CannonDebugger from 'cannon-es-debugger';

// instantiate our scene
const world = new Scene();
// instantiate our physics
const physWorld = new PhysWorld();
// instantiate our controls
const controls = new OrbitControls(world.camera, world.renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.025;
controls.enablePan = false;
controls.enableZoom = false;

// create a plane
const groundPlane = new Plane(new THREE.Vector3(0, -5, 0), physWorld.world, new THREE.Vector3(Math.PI / 2, 0, 0));
const ceiling = new Plane(new THREE.Vector3(0, 5, 0), physWorld.world, new THREE.Vector3(-Math.PI / 2, 0, 0));
const backWall = new Plane(new THREE.Vector3(0, 0, -10), physWorld.world);
const frontWall = new Plane(new THREE.Vector3(0, 0, 10), physWorld.world);
const leftWall = new Plane(new THREE.Vector3(-10, 0, 0), physWorld.world, new THREE.Vector3(0, Math.PI / 2, 0));
const rightWall = new Plane(new THREE.Vector3(10, 0, 0), physWorld.world, new THREE.Vector3(0, Math.PI / 2, 0));
// create a visual representation for the ground
const visualPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x808080 })
);
visualPlane.rotateX(-Math.PI / 2);
visualPlane.position.y = -4.9;
visualPlane.receiveShadow = true;
// add the visual mesh to the scene
world.scene.add(visualPlane);

// create dice
const dice = [
  new Dice(8, 2, new THREE.Vector3(-3, 1, 0), world.scene, physWorld.world),
  new Dice(8, 2, new THREE.Vector3(3, 1, 0), world.scene, physWorld.world)
];

// create debugger
// const cannonDebugger = new CannonDebugger(world.scene, physWorld.world);

// check for input
document.addEventListener('keydown', () => {
  dice[0].roll();
  dice[1].roll();
});

// define our stepping function
function stepFrame() {
  // step our physics simulation
  physWorld.stepWorld();
  // update our debugger
  // cannonDebugger.update();
  // update our object positions
  dice.forEach((die) => {
    die.updateSelf();
  });
  // update our orbit controller
  controls.update();
  // render the scene
  world.renderScene();

  // start a loop
  requestAnimationFrame(stepFrame);
}

// init
stepFrame();