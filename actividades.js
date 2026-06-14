// Configura los datos de tu repositorio
const USUARIO_GITHUB = "GuntaXD";
const REPOSITORIO = "ue-guaraguao-webpage";
const CARPETA_BLOG = "src/blog";

const contenedorBlog = document.getElementById('actividades-grid');

async function cargarBlog() {
    try {
        // 1. Le pedimos a GitHub la lista de archivos en la carpeta src/blog
        const urlAPI = `https://api.github.com/repos/${USUARIO_GITHUB}/${REPOSITORIO}/contents/${CARPETA_BLOG}`;
        const respuestaGitHub = await fetch(urlAPI);
        const archivos = await respuestaGitHub.json();

        // 2. Filtramos para asegurarnos de leer solo archivos .json
        const archivosJSON = archivos.filter(archivo => archivo.name.endsWith('.json'));

        // 3. Recorremos cada archivo encontrado
        for (const archivo of archivosJSON) {
            // Obtenemos el contenido real del JSON (usamos download_url para saltar el formato API)
            const respuestaPost = await fetch(archivo.download_url);
            const post = await respuestaPost.json();

            // 4. Creamos el HTML para la tarjeta del blog
            const tarjeta = document.createElement('article');
            tarjeta.className = 'actividad-item';

            const postId = archivo.name.replace('.json', '');
            const modalId = `vistaCardModal-${postId}`;
            const carouselId = `carousel-${postId}`;
            const imagenes = Array.isArray(post.images) && post.images.length > 0
                            ? post.images
                            : (post.image ? [post.image] : []);
            const carouselItemsHTML = imagenes.map((img, index) =>  `<div class="carousel-item ${index === 0 ? 'active' : ''}">      <img src="${img}" class="actividad-modal-image" alt="${post.title} - imagen ${index + 1}">  </div>` ).join('');
            
            tarjeta.innerHTML = `
                <div class="activity-card">
                    <img class="activity-image" src="${imagenes[0]}" alt="${post.title}">
                    <div class="activity-content">
                        <p class="activity-meta">Actividad academica</p>
                        <h5 class="activity-title">${post.title}</h5>
                        <p class="activity-description">${post.description}</p>
                        <a href="" class="activity-link" data-bs-toggle="modal" data-bs-target="#${modalId}">Leer mas <i class="bx bx-right-arrow-alt"></i></a>
                    </div>
                </div>

                <div class="modal fade actividad-modal" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-xl actividad-modal-dialog"> <div class="modal-content border-0 shadow-lg actividad-modal-content"> <div class="modal-body p-0 h-100"> <div class="row g-0 h-100">
                    <div class="col-md-8">
                        <div id="${carouselId}" class="carousel slide h-100 actividad-modal-carousel">
                        <div class="carousel-inner">
                            ${carouselItemsHTML}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                        </div>
                    </div>

                        <div class="col-md-4 p-4 d-flex flex-column justify-content-between">
                            <div>
                            <div class="d-flex justify-content-between align-items-start">
                                <h3 class="modal-title fw-bold">${post.title}</h3>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                                <p class="text-muted small mb-3">Fecha: ${post.date}</p>
                                <p class="text-secondary">${post.description}</p>
                            </div>
                            
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            `;

            contenedorBlog.appendChild(tarjeta);
        }
    } catch (error) {
        console.error("Error al cargar el blog:", error);
        contenedorBlog.innerHTML = "<p>No se pudieron cargar las entradas en este momento.</p>";
    }
}

// Ejecutar la función
export { cargarBlog };