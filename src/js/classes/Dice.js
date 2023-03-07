// import dependencies
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// create a dice class with rigidbody and mesh
class Dice {
  constructor(mass, size, pos, scene, physWorld, listener) {
    this.isStationary = false;

    this.createBody(mass, size, physWorld);
    this.createMesh(scene, size);

    this.body.position.copy(pos);

    // instantiate some audio
    this.audioTimeout = 0;
    this.createAudio(listener);
    // add an event listener to this body to play audio on collisions
    this.body.addEventListener("collide", (e) => {
      this.playImpactSound();
    });

    // our current value
    this.value = undefined; // set to undefined initially (no value as it is rolling)
  }

  // create our rigidbody
  createBody(mass, size, physWorld) {
    const shape = new CANNON.Box(new CANNON.Vec3(size * 0.5, size * 0.5, size * 0.5));
    this.body = new CANNON.Body({ mass: mass, shape: shape, restitution: 0.5 });
    physWorld.addBody(this.body);
  }

  // create our mesh
  createMesh(scene, size) {
    const loader = new GLTFLoader();

    loader.load('./assets/model/dice.glb', (gltf) => {
      let die = gltf.scene;
      // we know the model only has one child, and so we directly access it
      die.children[0].castShadow = true; // allow the die to cast a shadow
      die.children[0].receiveShadow = true; // and receive one
      die.scale.copy(new CANNON.Vec3(size, size, size));
      this.mesh = die;
      scene.add(die);
    }, undefined, (err) => { console.log(err) });
  }

  // create our audio files
  createAudio(listener) {
    this.impactSounds = [];
    this.rollSounds = [];
    // load our sfx
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/audio/land_01.ogg', (buffer) => {
      this.impactSounds.push(buffer);
    });
    audioLoader.load('assets/audio/land_02.ogg', (buffer) => {
      this.impactSounds.push(buffer);
    });
    audioLoader.load('assets/audio/land_03.ogg', (buffer) => {
      this.impactSounds.push(buffer);
    });
    audioLoader.load('assets/audio/roll.ogg', (buffer) => {
      this.rollSounds.push(buffer);
    });

    // create our sfx container
    this.audioPlayer = new THREE.PositionalAudio(listener); // assign our scene's listener
    this.audioPlayer.setRefDistance(10);
  }

  updateSelf() {
    // decrement audio timeout
    if (this.audioTimeout > 0) {
      this.audioTimeout -= 1;
    }

    if (this.mesh) {
      this.mesh.position.copy(this.body.position);
      this.mesh.quaternion.copy(this.body.quaternion);
    }

    this.audioPlayer.panner.setPosition(this.body.position.x, this.body.position.y, this.body.position.z);

    // check if it has finished rolling
    if (this.body.angularVelocity.length() < 0.25 && this.body.velocity.length() < 0.25) {
      this.isStationary = true;
    } else {
      this.isStationary = false;
    }

    // check value
    this.calculateValue();
  }

  roll() {
    if (this.audioTimeout < 1) {
      // stop the original sound
      this.audioPlayer.stop();
      // play a sound
      this.audioPlayer.setBuffer(this.rollSounds[0]);
      this.audioPlayer.setVolume(1); // reset our volume
      this.audioPlayer.play();
      // set audio timeout
      this.audioTimeout = 10;
    }

    // reset our value
    this.value = undefined;

    // pick a random local point
    const localPoint = new CANNON.Vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    let pulse = new CANNON.Vec3(0, 5, 0).vsub(this.body.position);
    pulse = pulse.scale(16);
    this.body.applyImpulse(pulse, localPoint);
  }

  playImpactSound() {
    if (this.audioTimeout < 1 && this.body.velocity.length() > 3.5) {
      // stop the original sound
      this.audioPlayer.stop();
      // randomly pick an impact sound
      const index = Math.floor(Math.random() * this.impactSounds.length);
      this.audioPlayer.setBuffer(this.impactSounds[index]);
      // set our volume and play
      this.audioPlayer.setVolume(0.06 * this.body.velocity.length())
      this.audioPlayer.play();
      // set audio timeout
      this.audioTimeout = 10;
      }
  }

  // determine which side of the die is facing up
  calculateValue() {
    const margin = 0.05; // rotational marging of error

    // get euler components of die
    const euler = new CANNON.Vec3();
    this.body.quaternion.toEuler(euler); // set from die's quaternion rotation

    // calculate which side is facing up based on the euler direction
    if (Math.abs(euler.z) < margin) { // if euler.z is equal to zero
      if (Math.abs(euler.x) < margin) { // if euler.x is also equal to zero
        this.value = 1;
      } else if (Math.abs(euler.x - 0.5 * Math.PI) < margin) { // if euler.x is equal to half pi
        this.value = 3;
      } else if (Math.abs(0.5 * Math.PI + euler.x) < margin) { // if euler.x is minus half pi
        this.value = 4;
      } else if (Math.abs(Math.PI - euler.x) < margin) { // if euler.x is flipped
        this.value = 6;
      } else {
        this.value = undefined; // no value determined (edge)
      }
    } else if (Math.abs(euler.z - 0.5 * Math.PI) < margin) {
      this.value = 5;
    } else if (Math.abs(0.5 * Math.PI + euler.z) < margin) {
      this.value = 2;
    } else {
      this.value = undefined; // edge
    }
  }
}

export { Dice };