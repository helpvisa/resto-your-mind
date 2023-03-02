// import our dependencies
import * as THREE from 'three';

class Scene {
  constructor() {
    // construct our world scene and setup three.js
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);

    // setup our internal clock
    this.clock = new THREE.Clock();

    // create a scene
    this.scene = new THREE.Scene();

    // setup camera
    this.cameraRatio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(this.cameraRatio * 20 / -2, this.cameraRatio * 20 / 2, 20 / 2, 20 / -2, -1000, 1000);
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);

    // setup lights
    this.spotlight = new THREE.SpotLight(0x88FFFF);
    this.spotlight.position.set(0, 10, 0);
    this.spotlight.castShadow = true;
    this.spotlight.shadow.bias = -0.001;
    this.spotlight.shadow.mapSize.width = 512;
    this.spotlight.shadow.mapSize.height = 512;
    // setup spotlight
    this.spotlight.angle = 0.8;
    this.spotlight.penumbra = 0.2;
    // add the lights to our scene
    this.scene.add(this.spotlight);

    // window resize function (resizes canvas)
    window.addEventListener("resize", () => {
      this.cameraRatio = window.innerWidth / window.innerHeight;
      this.camera.left = this.cameraRatio * 20 / -2;
      this.camera.right = this.cameraRatio * 20 / 2;
      this.camera.top = 20 / 2;
      this.camera.bottom = 20 / -2;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);
    }, false);

    // add canvas to page
    document.body.appendChild(this.renderer.domElement);
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }
}

export { Scene };