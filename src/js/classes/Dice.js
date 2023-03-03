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
      die.children[0].castShadow = true;
      die.children[0].receiveShadow = true;
      if (die.material) {
        die.material.metalness = 0;
        die.material.roughness = 0;
      }
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
    if (this.body.angularVelocity.length() < 0.08 && this.body.velocity.length() < 0.08) {
      this.isStationary = true;
    } else {
      this.isStationary = false;
    }
  }

  roll() {
    if (this.audioTimeout < 1) {
      // stop the original sound
      this.audioPlayer.stop();
      // play a sound
      this.audioPlayer.setBuffer(this.rollSounds[0]);
      this.audioPlayer.play();
      // set audio timeout
      this.audioTimeout = 10;
    }

    // pick a random local point
    const localPoint = new CANNON.Vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    let pulse = new CANNON.Vec3(0, 5, 0).vsub(this.body.position);
    pulse = pulse.scale(12);
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
      this.audioPlayer.setVolume(0.03 * this.body.velocity.length())
      this.audioPlayer.play();
      // set audio timeout
      this.audioTimeout = 10;
      }
  }
}

export { Dice };