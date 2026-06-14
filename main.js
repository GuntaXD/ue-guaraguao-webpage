import * as THREE from 'https://esm.sh/three@0.165.0';
import { GLTFLoader } from 'https://esm.sh/three@0.165.0/examples/jsm/loaders/GLTFLoader.js';

export function init() {

  const container = document.getElementById('3d-model-container');

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    1, // lo actualizamos luego en resize()
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({
    alpha: true
});

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

  container.appendChild(renderer.domElement);



  const loader = new GLTFLoader();

  let model;

  loader.load(
    './assets/EscudoGuaraguao.glb', 
    (gltf) => {
      model = gltf.scene;
      scene.add(model);

      // opcional: ajustar tamaño
      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);
    },
    undefined,
    (error) => {
      console.error('Error cargando modelo:', error);
    }
  );


  camera.position.z = 5;

  // 🔹 RESIZE FUNCTION
  function resize() {
    const rect = container.getBoundingClientRect();

    renderer.setSize(rect.width, rect.height);

    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  // inicializa tamaño correcto
  resize();

  // observer para cambios del contenedor
  const observer = new ResizeObserver(() => {
    resize();
  });

  observer.observe(container);

    function animate() {
    requestAnimationFrame(animate);

    if (model) {
      model.rotation.y += 0.01; // opcional animación
    }

    renderer.render(scene, camera);
  }

  animate();
}