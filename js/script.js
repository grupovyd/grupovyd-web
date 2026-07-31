const slides = [

{
    image: "imagenes/hero/biomont.jpg",
    title: "POTENCIAMOS",
    subtitle: "Creamos espacios que fortalecen la presencia de tu marca."
},

{
    image: "imagenes/hero/ferreyros.jpg",
    title: "DISEÑAMOS",
    subtitle: "Diseños estratégicos para ferias y exposiciones."
},

{
    image: "imagenes/hero/esenttia.jpg",
    title: "FABRICAMOS",
    subtitle: "Producción propia con acabados de alta calidad."
},

{
    image: "imagenes/hero/smurfitwestrock.png",
    title: "IMPLEMENTAMOS",
    subtitle: "Montaje profesional para ferias, eventos y exposiciones."
},

{
    image: "imagenes/hero/australia2024.jpg",
    title: "INTEGRAMOS",
    subtitle: "Coordinamos diseño, producción y montaje para un proyecto exitoso."
}

];

let currentSlide = 0;

const heroSlider = document.querySelector(".hero-slider");
const heroTitle = document.getElementById("hero-title");
const heroSubtitle = document.getElementById("hero-subtitle");
const menuToggle = document.getElementById("menuToggle");
const menu = document.querySelector(".menu");

//==========================
// CARGAR PRIMER SLIDE
//==========================

heroSlider.style.backgroundImage = `url('${slides[0].image}')`;

heroTitle.textContent = slides[0].title;

heroSubtitle.textContent = slides[0].subtitle;

function changeSlide(){

    currentSlide++;

    if(currentSlide >= slides.length){
        currentSlide = 0;
    }

    heroSlider.style.opacity = "0";

    setTimeout(() => {

        heroSlider.style.backgroundImage =
        `url('${slides[currentSlide].image}')`;

        heroTitle.textContent =
        slides[currentSlide].title;

        heroSubtitle.textContent =
        slides[currentSlide].subtitle;

        heroSlider.style.opacity = "1";

    }, 400);
}

setInterval(changeSlide, 3000);

//==========================
// MODAL COTIZACIÓN
//==========================

const botonModal = document.getElementById("abrirModal");

const botonModalNosotros =
document.getElementById("abrirModalNosotros");

const botonModalContacto =
document.getElementById("abrirModalContacto");

const modal = document.getElementById("modalCotizacion");
const contenidoModal =
document.querySelector(".modal-contenido");

const modalExito =
document.getElementById("modalExito");

const cerrar = document.querySelector(".cerrar-modal");

//==========================
// ORIGEN DE SOLICITUD
//==========================

let origenSolicitud = "HERO";

//==========================
// LIMPIAR FORMULARIO MODAL
//==========================

function limpiarFormularioModal(){

    const formModal = document.querySelector(".modal-form form");

    if(formModal){

        formModal.reset();

    }

}

const formularioHero = document.querySelector(".hero-form form");

botonModal.addEventListener("click", function(e){

    e.preventDefault();

    origenSolicitud = "NAVBAR";

    limpiarFormularioModal();

    formularioHero.reset();

    modal.style.display = "flex";

    requestAnimationFrame(() => {

        contenidoModal.scrollTop = 0;

    });

});

botonModalNosotros.addEventListener("click", function(e){

    e.preventDefault();

    origenSolicitud = "NOSOTROS";

    limpiarFormularioModal();

    formularioHero.reset();

    modal.style.display = "flex";

    requestAnimationFrame(() => {

        contenidoModal.scrollTop = 0;

    });

});

botonModalContacto.addEventListener("click", function(e){

    e.preventDefault();

    origenSolicitud = "CONTACTO";

    limpiarFormularioModal();

    formularioHero.reset();

    modal.style.display = "flex";

    requestAnimationFrame(() => {

        contenidoModal.scrollTop = 0;

    });

});

cerrar.addEventListener("click", function(){

    limpiarFormularioModal();

    modal.style.display = "none";

});

window.addEventListener("click", function(e){

    if(e.target === modal){
        
        limpiarFormularioModal();

        modal.style.display = "none";

    }

});

//==========================
// CERRAR MODALES CON ESC
//==========================

document.addEventListener("keydown", function(e){

    if(e.key !== "Escape") return;

    // Cierra el modal de cotización
    if(modal.style.display === "flex"){

        limpiarFormularioModal();

        modal.style.display = "none";

    }

    // Cierra el modal de éxito
    if(modalExito.style.display === "flex"){

        modalExito.style.display = "none";

        if(formularioActivo){

            formularioActivo.reset();

        }

    }

});

const comentario = document.querySelector(".hero-form textarea");

comentario.addEventListener("input", function () {

    if (this.value.trim() !== "") {

        this.style.border = "2px solid #8FC74A";

    } else {

        this.style.border = "1px solid #ddd";

    }

});

//==================================================
// WEB APP - SOLICITUDES
//==================================================

const URL_WEB_APP =
"https://script.google.com/macros/s/AKfycbw2cEEIOR-9rktmyHtfbpIEsQJRybcIZoa7YURX-MAoGTzVR_vHnDBoHHGXiMXKJ2nslQ/exec";

//==================================================
// ENVÍO REAL DE FORMULARIOS
//==================================================

let formularioActivo = null;

document.addEventListener("submit", async function(e){

    if(!e.target.matches("#formHero, #formModal")){

        return;

    }

    e.preventDefault();

    formularioActivo = e.target;

    const formulario = e.target;

    const botonEnviar =
    formulario.querySelector('button[type="submit"]');

    const textoOriginalBoton =
    botonEnviar.textContent;

    let origenFinal = "HERO";

    if(formulario.id === "formModal"){

        origenFinal = origenSolicitud;

    }


    //==================================================
    // DATOS DEL FORMULARIO
    //==================================================

    const datos = {

        origen: origenFinal,

        nombre:
        formulario.elements["nombre"].value,

        empresa:
        formulario.elements["empresa"].value,

        ruc:
        formulario.elements["ruc"].value,

        correo:
        formulario.elements["correo"].value,

        telefono:
        formulario.elements["telefono"].value,

        feria:
        formulario.elements["feria"].value,

        tipoStand:
        formulario.elements["tipoStand"].value,

        medidas:
        formulario.elements["medidas"].value,

        presupuesto:
        formulario.elements["presupuesto"].value,

        comentarios:
        formulario.elements["comentarios"].value,

        website:
        formulario.elements["website"].value

    };


    //==================================================
    // ESTADO DE ENVÍO
    //==================================================

    botonEnviar.disabled = true;

    botonEnviar.textContent = "Enviando...";


    try {

        const respuesta = await fetch(URL_WEB_APP, {
           method: "POST",
           body: JSON.stringify(datos),
           redirect: "follow"
        });


        const resultado = await respuesta.json();


        if(!resultado.success){

            throw new Error(
                resultado.message ||
                "No se pudo registrar la solicitud"
            );

        }


        //==================================================
        // ENVÍO CORRECTO
        //==================================================

        modal.style.display = "none";

        modalExito.style.display = "flex";


    } catch(error){

        console.error(
            "Error enviando solicitud:",
            error
        );

        alert(
            "No pudimos enviar tu solicitud en este momento. " +
            "Por favor, inténtalo nuevamente."
        );

    } finally {

        botonEnviar.disabled = false;

        botonEnviar.textContent =
        textoOriginalBoton;

    }

});

//==================================================
// BOTONES DEL MODAL DE ÉXITO
//==================================================

const btnNuevoFormulario = document.getElementById("nuevoFormulario");

const btnCerrarExito = document.getElementById("cerrarExito");

const btnWhatsappExito = document.getElementById("btnWhatsappExito");

btnCerrarExito.addEventListener("click", ()=>{

    modalExito.style.display = "none";

    if(formularioActivo){

        formularioActivo.reset();

    }

});

btnNuevoFormulario.addEventListener("click", ()=>{

    modalExito.style.display = "none";

    if(formularioActivo){

        formularioActivo.reset();

    }

    if(formularioActivo.closest(".modal-form")){

        modal.style.display = "flex";

        requestAnimationFrame(() => {

            contenidoModal.scrollTop = 0;
        });    

    }

});

btnWhatsappExito.addEventListener("click", ()=>{

    // Cierra el modal de éxito
    modalExito.style.display = "none";

    // Limpia el formulario que originó la solicitud
    if(formularioActivo){

        formularioActivo.reset();

    }

    // Si fue desde el modal, asegúrate de que permanezca cerrado
    modal.style.display = "none";

});

document.querySelectorAll(".menu a").forEach(link=>{

    link.addEventListener("click",()=>{

        formularioHero.reset();

    });

});

//=========================================
// MODAL FERIAS
//=========================================

const btnAbrirFerias = document.getElementById("abrirFerias");

const modalFerias = document.getElementById("modalFerias");

const cerrarFerias = document.querySelector(".cerrar-ferias");

btnAbrirFerias.addEventListener("click",()=>{

    modalFerias.classList.add("show");

    document.querySelector(".modal-ferias-content").scrollTop = 0;

});

cerrarFerias.addEventListener("click", () => {

    modalFerias.classList.remove("show");

});

modalFerias.addEventListener("click", (e) => {

    if(e.target === modalFerias){

        modalFerias.classList.remove("show");

    }

});

document.addEventListener("keydown", (e)=>{

    if(e.key === "Escape"){

        modalFerias.classList.remove("show");

    }

});

//==================================================
// CARRUSEL PORTAFOLIO
//==================================================

const track = document.querySelector(".portafolio-track");
const cards = [...document.querySelectorAll(".portafolio-card")];
const prev = document.querySelector(".portafolio-prev");
const next = document.querySelector(".portafolio-next");
const dotsContainer = document.querySelector(".portafolio-dots");

let cardsPerView = 3;
let currentPage = 0;
let totalPages = 0;

function calcularCardsPorVista() {
    cardsPerView = window.innerWidth <= 768 ? 1 : 3;
}

function crearDots() {

    dotsContainer.innerHTML = "";

    totalPages = Math.ceil(cards.length / cardsPerView);

    for (let i = 0; i < totalPages; i++) {

        const dot = document.createElement("span");

        if (i === currentPage) dot.classList.add("active");

        dot.addEventListener("click", () => {

            currentPage = i;

            actualizarCarrusel();

        });

        dotsContainer.appendChild(dot);

    }

}

function actualizarDots() {

    [...dotsContainer.children].forEach((dot, index) => {

        dot.classList.toggle("active", index === currentPage);

    });

}

function actualizarCarrusel() {

    calcularCardsPorVista();

    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;

    const cardWidth = cards[0].offsetWidth + gap;

    track.style.transform =
        `translateX(-${currentPage * cardWidth * cardsPerView}px)`;

    actualizarDots();

}

function reiniciarCarrusel() {

    calcularCardsPorVista();

    totalPages = Math.ceil(cards.length / cardsPerView);

    if (currentPage >= totalPages) {

        currentPage = totalPages - 1;

    }

    crearDots();

    actualizarCarrusel();

}

next.addEventListener("click", () => {

    currentPage++;

    if (currentPage >= totalPages) currentPage = 0;

    actualizarCarrusel();

});

prev.addEventListener("click", () => {

    currentPage--;

    if (currentPage < 0) currentPage = totalPages - 1;

    actualizarCarrusel();

});

window.addEventListener("resize", reiniciarCarrusel);

reiniciarCarrusel();

//==================================================
// MENÚ MÓVIL
//==================================================

menuToggle.addEventListener("click", () => {

    menu.classList.toggle("active");

});

menu.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

        menu.classList.remove("active");

    });

});

document.addEventListener("click", (e) => {

    if(
        !menu.contains(e.target) &&
        !menuToggle.contains(e.target)
    ){

        menu.classList.remove("active");

    }

});

document.addEventListener("keydown", (e) => {

    if(e.key === "Escape"){

        menu.classList.remove("active");

    }

});

//==================================================
// CARRUSEL CLIENTES
//==================================================

const clientesTrack = document.querySelector(".clientes-track");

let posicionClientes = 0;

let velocidadClientes = window.innerWidth <= 768 ? 0.45 : 0.75;

let pausadoClientes = false;

function actualizarVelocidadClientes(){

    if(window.innerWidth <= 576){

        // Celulares
        velocidadClientes = 1.40;

    }else if(window.innerWidth <= 992){

        // Tablets
        velocidadClientes = 1.00;

    }else{

        // Escritorio
        velocidadClientes = 0.75;

    }

}

function moverClientes(){

    if(!pausadoClientes){

        posicionClientes -= velocidadClientes;

        const mitad = clientesTrack.scrollWidth / 2;

        if(Math.abs(posicionClientes) >= mitad){

            posicionClientes = 0;

        }

        clientesTrack.style.transform =
            `translateX(${posicionClientes}px)`;

    }

    requestAnimationFrame(moverClientes);

}

clientesTrack.addEventListener("mouseenter",()=>{

    pausadoClientes = true;

});

clientesTrack.addEventListener("mouseleave",()=>{

    pausadoClientes = false;

});

window.addEventListener("resize",actualizarVelocidadClientes);

actualizarVelocidadClientes();

moverClientes();

document.querySelectorAll("*").forEach(el => {
  if (el.scrollWidth > document.documentElement.clientWidth) {
    console.log(el);
  }
});