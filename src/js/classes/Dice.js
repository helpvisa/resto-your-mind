// import dependencies
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';

// create a dice class with rigidbody and mesh
class Dice {
  constructor(mass, size, pos, scene, physWorld) {
    this.createBody(mass, size, physWorld);
    this.createMesh(scene, size);

    this.body.position.copy(pos);
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

  updateSelf() {
    if (this.mesh) {
      this.mesh.position.copy(this.body.position);
      this.mesh.quaternion.copy(this.body.quaternion);
    }
  }

  roll() {
    // pick a random local point
    const localPoint = new CANNON.Vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    let pulse = new CANNON.Vec3(0, 5, 0).vsub(this.body.position);
    pulse = pulse.scale(12);
    this.body.applyImpulse(pulse, localPoint);
  }
}

export { Dice };