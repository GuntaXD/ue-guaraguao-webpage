import * as THREE from 'https://esm.sh/three@0.165.0';
import { GLTFLoader } from 'https://esm.sh/three@0.165.0/examples/jsm/loaders/GLTFLoader.js';

const USUARIO_GITHUB = 'GuntaXD';
const REPOSITORIO = 'ue-guaraguao-webpage';
const CARPETA_BLOG = 'blog';
const BASE_ASSETS_IMAGES_URL = 'https://guntaxd.github.io/ue-guaraguao-webpage/assets/images/';

function normalizarUrlImagen(url) {
  if (!url || typeof url !== 'string') return '';

  if (/^https?:\/\//i.test(url)) return url;

  if (url.startsWith('/assets/images/')) {
    return `${BASE_ASSETS_IMAGES_URL}${url.replace('/assets/images/', '')}`;
  }

  if (url.startsWith('assets/images/')) {
    return `${BASE_ASSETS_IMAGES_URL}${url.replace('assets/images/', '')}`;
  }

  return url;
}

function obtenerImagenPrincipal(post) {
  const imagenesOriginales = Array.isArray(post.images) && post.images.length > 0
    ? post.images
    : (post.image ? [post.image] : []);

  const imagenes = imagenesOriginales.map(normalizarUrlImagen).filter(Boolean);
  return imagenes[0] || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80';
}

function ordenarPostsPorFechaDesc(posts) {
  return posts.sort((a, b) => {
    const fechaA = new Date(a.date || 0).getTime();
    const fechaB = new Date(b.date || 0).getTime();
    return fechaB - fechaA;
  });
}

function crearTarjetaActividadHome(post, index) {
  const colClass = (index % 4 === 0 || index % 4 === 3) ? 'col-12 col-lg-4' : 'col-12 col-lg-8';
  const col = document.createElement('div');
  col.className = colClass;

  const titulo = post.title || 'Actividad academica';
  const descripcion = post.description || 'Sin descripcion disponible.';
  const imagen = obtenerImagenPrincipal(post);

  col.innerHTML = `
    <div class="activity-card" style="background-image: url('${imagen}');">
      <div class="activity-overlay">
        <h5 class="activity-title">${titulo}</h5>
        <p class="activity-description">${descripcion}</p>
      </div>
    </div>
  `;

  return col;
}

async function cargarUltimasActividadesHome() {
  const contenedor = document.getElementById('home-actividades-grid');
  if (!contenedor) return;

  try {
    const urlAPI = `https://api.github.com/repos/${USUARIO_GITHUB}/${REPOSITORIO}/contents/${CARPETA_BLOG}`;
    const respuesta = await fetch(urlAPI);
    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar la lista de posts (${respuesta.status})`);
    }

    const archivos = await respuesta.json();
    const archivosJSON = archivos.filter((archivo) => archivo.name.endsWith('.json'));

    const posts = [];
    for (const archivo of archivosJSON) {
      const respuestaPost = await fetch(archivo.download_url);
      if (!respuestaPost.ok) continue;
      const post = await respuestaPost.json();
      posts.push(post);
    }

    const ultimosCuatro = ordenarPostsPorFechaDesc(posts).slice(0, 4);
    contenedor.innerHTML = '';

    if (!ultimosCuatro.length) {
      contenedor.innerHTML = `
        <div class="text-center py-4">
          <p class="mb-0">No hay actividades publicadas por ahora.</p>
        </div>
      `;
      return;
    }

    const fila1 = document.createElement('div');
    fila1.className = 'row g-4 mb-4';

    const fila2 = document.createElement('div');
    fila2.className = 'row g-4';

    ultimosCuatro.forEach((post, index) => {
      const tarjeta = crearTarjetaActividadHome(post, index);
      if (index < 2) {
        fila1.appendChild(tarjeta);
      } else {
        fila2.appendChild(tarjeta);
      }
    });

    contenedor.appendChild(fila1);
    if (ultimosCuatro.length > 2) {
      contenedor.appendChild(fila2);
    }
  } catch (error) {
    console.error('Error cargando actividades de inicio:', error);
    contenedor.innerHTML = `
      <div class="text-center py-4">
        <p class="mb-0">No se pudieron cargar las actividades en este momento.</p>
      </div>
    `;
  }
}

export function init() {
  cargarUltimasActividadesHome();

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