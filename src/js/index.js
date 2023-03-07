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
let dice = [
  new Dice(8, 2, new THREE.Vector3(-1.2, 1, -1.2), world.scene, physWorld.world, world.listener),
  new Dice(8, 2, new THREE.Vector3(1.2, 1, 1.2), world.scene, physWorld.world, world.listener),
];

// create debugger
// const cannonDebugger = new CannonDebugger(world.scene, physWorld.world);

// create our 'ui'
const uiText = document.createElement("div");
uiText.className = "info fade-in";
uiText.textContent = "Use your mouse or finger to pan; start rolling!";
document.body.appendChild(uiText);
let introScreen = true; // if we haven't yet rolled, show an intro screen
let sleepTimer = 0; // cooldown to determine if a roll is finished after dice become stationary
let rollFinished = true; // have we got a number from our roll?

// buttons to set the number of dice
const selectorDiv = document.createElement("div");
selectorDiv.className = "btn-container";
const dieOne = document.createElement("button");
const dieTwo = document.createElement("button");
const dieThree = document.createElement("button");
const dieFour = document.createElement("button");
const diceSelector = [dieOne, dieTwo, dieThree, dieFour];
// setup our buttons using the above array
for (let i = 0; i < diceSelector.length; i++) {
  let btn = diceSelector[i];
  btn.className = "user-input selector";
  btn.textContent = (i + 1);
  if (i === 0) {
    btn.textContent += " Die";
  } else {
    btn.textContent += " Dice";
  }
  // create an event listener for this specific btn
  btn.addEventListener('click', () => {
    // remove our existing dice from the world scene
    dice.forEach((die) => {
      world.scene.remove(die.mesh);
      physWorld.world.removeBody(die.body);
    });

    // re-create our dice array with the corresponding button's # of dice
    dice = []; // reset array
    for (let d = 0; d < i + 1; d++) {
      // set an x value for the die
      let x = 1.2 * (d + 1);
      if (d % 2 !== 0) {
        x *= -1; // negative x for odd numbers
      }
      dice.push(new Dice(8, 2, new THREE.Vector3(x, 1, x), world.scene, physWorld.world, world.listener));
    }
  });
  // add it to div
  selectorDiv.appendChild(btn);
}
// add our container div to the page
document.body.appendChild(selectorDiv);

// check for roll click
const rollButton = document.createElement("button"); // create our roll button
rollButton.className = "user-input unrollable";
rollButton.textContent = "ROLL";
document.body.appendChild(rollButton);
let isStationary = false; // variable determining if we are allowed to roll again
rollButton.addEventListener('click', () => {
  // user has interacted with the page; stop showing intro text
  introScreen = false;

  // restart listener context so audio begins upon first-time user interaction
  if (world.listener.context.state === "suspended") {
    world.listener.context.resume();
  }

  if (isStationary && rollFinished) {
    rollFinished = false;
    dice.forEach((die) => {
      die.roll();
    });
  }
});

// define our stepping function
function stepFrame() {
  // get our delta
  const delta = world.clock.getDelta();
  // step our physics simulation
  physWorld.stepWorld();
  // update our debugger
  // cannonDebugger.update();
  // update our object positions
  isStationary = true // can we roll the dice?
  dice.forEach((die) => {
    die.updateSelf();
    if (!die.isStationary) { // not rollable if even a single die is still moving
      isStationary = false;
      sleepTimer = 0;
    }
  });
  // if all dice are stationary, increment our sleep timer (the dice have come to a rest)
  if (isStationary) {
    sleepTimer += 1 * delta;
  }

  // check sleep timer and set a roll finished state if it is beyond a certain threshold
  if (sleepTimer > 0.5) {
    rollFinished = true;
  } else {
    rollFinished = false;
  }

  // update our orbit controller
  controls.update();
  // render the scene
  world.renderScene();

  // update our roll button's classes
  if (isStationary && rollFinished) {
    rollButton.className = "user-input rollable";
  } else {
    rollButton.className = "user-input unrollable";
  }

  if (!introScreen) { // only update info text if the info screen should no longer be shown
    if (rollFinished) {
      // some vars to calc a text string, and to store our final value
      let value = 0;
      let string = "";
      let calcValue = true;
      for (let i = 0; i < dice.length; i++) {
        if (dice[i].value) {
          value += dice[i].value;
          string += dice[i].value;
          if (i !== dice.length - 1) {
            string += " + ";
          }
        } else {
          dice[i].roll();
          calcValue = false;
        }
      }

      if (calcValue) { // if calcValue is false, one die does not have a value and has been rerolled, so we wait
        uiText.textContent = string + " = " + value;
        uiText.className = "info fade-in";
      }
    } else {
      uiText.className = "info fade-out";
    }
  }

  // start a loop
  requestAnimationFrame(stepFrame);
}

// init
stepFrame();