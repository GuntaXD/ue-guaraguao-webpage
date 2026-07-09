// Configura los datos de tu repositorio
const USUARIO_GITHUB = "GuntaXD";
const REPOSITORIO = "ue-guaraguao-webpage";
const CARPETA_BLOG = "blog";

function normalizarUrlImagen(url) {
    if (!url || typeof url !== 'string') return '';

    const limpia = url.trim();
    if (/^https?:\/\//i.test(limpia)) return limpia;

    if (limpia.startsWith('/assets/images/')) {
        return limpia.replace(/^\/+/, '');
    }

    if (limpia.startsWith('assets/images/')) {
        return limpia;
    }

    return `assets/images/${limpia.replace(/^\/+/, '')}`;
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';

    const fecha = new Date(fechaISO);
    if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible';

    return new Intl.DateTimeFormat('es-VE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(fecha);
}

const contenedorBlog = document.getElementById('actividades-grid');

function mostrarErrorCargaActividades(error) {
    if (!contenedorBlog) return;

    contenedorBlog.innerHTML = `
        <div class="actividades-error-wrap w-100" role="alert" aria-live="polite">
            <article class="actividades-error-card">
                <div class="actividades-error-icon" aria-hidden="true">
                    <span>!</span>
                </div>
                <h3 class="actividades-error-title">No pudimos cargar las actividades</h3>
                <p class="actividades-error-text mb-0">Parece que hubo un problema al consultar las publicaciones. Revisa tu conexion e intenta de nuevo.</p>
                <div class="d-flex justify-content-center mt-4">
                    <button type="button" class="btn btn-primary px-4" id="reintentar-carga-actividades">Intentar nuevamente</button>
                </div>
            </article>
        </div>
    `;

    const botonReintentar = document.getElementById('reintentar-carga-actividades');
    if (botonReintentar) {
        botonReintentar.addEventListener('click', () => {
            cargarBlog();
        }, { once: true });
    }
}

function mostrarSinActividades() {
    if (!contenedorBlog) return;

    contenedorBlog.innerHTML = `
        <div class="actividades-vacio-wrap w-100" role="status" aria-live="polite">
            <article class="actividades-vacio-card">
                <div class="actividades-vacio-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 10v6"></path>
                        <path d="M12 7h.01"></path>
                    </svg>
                </div>
                <h3 class="actividades-vacio-title">No hay actividades publicadas por ahora</h3>
                <p class="actividades-vacio-text mb-0">Estamos preparando nuevas publicaciones para esta seccion. Vuelve pronto para ver las proximas actividades academicas.</p>
                <div class="d-flex justify-content-center mt-4">
                    <button type="button" class="btn btn-outline-primary px-4" id="recargar-actividades">Actualizar</button>
                </div>
            </article>
        </div>
    `;

    const botonActualizar = document.getElementById('recargar-actividades');
    if (botonActualizar) {
        botonActualizar.addEventListener('click', () => {
            cargarBlog();
        }, { once: true });
    }
}

async function cargarBlog() {
    if (!contenedorBlog) return;

    try {
        // 1. Le pedimos a GitHub la lista de archivos en la carpeta src/blog
        const urlAPI = `https://api.github.com/repos/${USUARIO_GITHUB}/${REPOSITORIO}/contents/${CARPETA_BLOG}`;
        const respuestaGitHub = await fetch(urlAPI);
        if (!respuestaGitHub.ok) {
            throw new Error(`No se pudo cargar la lista de posts (${respuestaGitHub.status})`);
        }
        const archivos = await respuestaGitHub.json();

        // 2. Filtramos para asegurarnos de leer solo archivos .json
        const archivosJSON = archivos.filter(archivo => archivo.name.endsWith('.json'));
        //const archivosJSON = []

        contenedorBlog.innerHTML = '';

        // 3. Recorremos cada archivo encontrado
        for (const archivo of archivosJSON) {
            // Obtenemos el contenido real del JSON (usamos download_url para saltar el formato API)
            const respuestaPost = await fetch(archivo.download_url);
            if (!respuestaPost.ok) continue;
            const post = await respuestaPost.json();

            // 4. Creamos el HTML para la tarjeta del blog
            const tarjeta = document.createElement('article');
            tarjeta.className = 'actividad-item';

            const postId = archivo.name.replace('.json', '');
            const modalId = `vistaCardModal-${postId}`;
            const carouselId = `carousel-${postId}`;
            const fechaFormateada = formatearFecha(post.date);
            const resumen = post.description || 'Sin descripcion disponible.';
            const cuerpoFormateado = post.body
                ? post.body
                    .split(/\n\s*\n/)
                    .map(parrafo => `<p class="actividad-modal-body-paragraph">${parrafo.replace(/\n/g, '<br>')}</p>`)
                    .join('')
                : '<p class="actividad-modal-body-paragraph mb-0">Sin contenido adicional.</p>';
            const imagenesOriginales = Array.isArray(post.images) && post.images.length > 0
                            ? post.images
                            : (post.image ? [post.image] : []);
            const imagenes = imagenesOriginales.map(normalizarUrlImagen).filter(Boolean);
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

                        <div class="col-md-4 p-4 d-flex flex-column actividad-modal-side">
                            <div class="actividad-modal-text">
                                <div class="actividad-modal-text-header d-flex justify-content-between align-items-start gap-3">
                                    <div>
                                        <h3 class="modal-title fw-bold actividad-modal-title">${post.title}</h3>
                                    </div>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>

                                <p class="actividad-modal-date mb-3">Fecha: ${fechaFormateada}</p>
                                <p class="actividad-modal-summary">${resumen}</p>
                                <hr class="actividad-modal-divider">

                                <div class="actividad-modal-body">
                                    ${cuerpoFormateado}
                                </div>
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

        if (!contenedorBlog.children.length) {
            mostrarSinActividades();
        }
    } catch (error) {
        console.error("Error al cargar el blog:", error);
        mostrarErrorCargaActividades(error);
    }
}

// Ejecutar la función
export { cargarBlog };