// dependencies
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class Plane {
  constructor(pos, physWorld, rot = new THREE.Vector3(0, 0, 0)) { // rot is euler rotation
    const shape = new CANNON.Box(new CANNON.Vec3(10, 10, 0.1));
    this.body = new CANNON.Body({ mass: 0, shape: shape });
    this.body.position.copy(pos);
    this.body.quaternion.setFromEuler(rot.x, rot.y, rot.z); // face up

    // add to respective worlds
    physWorld.addBody(this.body);
  }
}

export { Plane };