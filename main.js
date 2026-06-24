import * as THREE from 'https://esm.sh/three@0.165.0';
import { GLTFLoader } from 'https://esm.sh/three@0.165.0/examples/jsm/loaders/GLTFLoader.js';

export function init() {

  const container = document.getElementById('3d-model-container');

  if (!container) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    1, // lo actualizamos luego en resize()
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });

  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const light = new THREE.DirectionalLight(0xffffff, 1.8);
    light.position.set(5, 5, 5);
    scene.add(light);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
    fillLight.position.set(-3, 2, 4);
    scene.add(fillLight);

  container.appendChild(renderer.domElement);



  const loader = new GLTFLoader();
  const clock = new THREE.Clock();
  const swingAmplitude = Math.PI / 7; // ~22.5 grados
  const swingSpeed = 0.8;

  let model;

  loader.load(
    './assets/EscudoGuaraguaoPrueba.glb', 
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


  camera.position.z = 3.3;
  camera.position.y = .8;

  // 🔹 RESIZE FUNCTION
  function resize() {
    const rect = container.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) return;

    renderer.setSize(rect.width, rect.height, false);

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
      const elapsed = clock.getElapsedTime();
      model.rotation.y = Math.sin(elapsed * swingSpeed) * swingAmplitude;
    }

    renderer.render(scene, camera);
  }

  animate();
}