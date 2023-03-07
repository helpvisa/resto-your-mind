// import dependencies
import * as CANNON from 'cannon-es';

class PhysWorld {
  constructor() {
    // initialize cannon-es
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -38, 0),
      defaultContactMaterial: {
        friction: 0.5,
        restitution: 1
      }
    });
  }

  stepWorld() {
    this.world.fixedStep(1 / 120, 20);
  }
}

export { PhysWorld };