/* ==================================================
   GRUPO V&D — VISOR DEL BROCHURE
   ================================================== */

/* ==================================================
   GRUPO V&D — VISOR DEL BROCHURE
   CARGA OPTIMIZADA / LAZY RENDERING
   ================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const pdfViewer =
        document.getElementById("pdfViewer");

    const pdfLoading =
        document.getElementById("pdfLoading");

    const currentPageElement =
        document.getElementById("currentPage");

    const totalPagesElement =
        document.getElementById("totalPages");

    const zoomLevelElement =
        document.getElementById("zoomLevel");

    const zoomInButton =
        document.getElementById("zoomIn");

    const zoomOutButton =
        document.getElementById("zoomOut");

    const fullscreenButton =
        document.getElementById("fullscreenButton");


    // ==================================================
    // VALIDACIÓN
    // ==================================================

    if(!pdfViewer){

        console.error(
            "BROCHURE: No se encontró #pdfViewer"
        );

        return;

    }


    // ==================================================
    // CONFIGURACIÓN
    // ==================================================

    const pdfURL =
        "/pdf/brochure-vyd.pdf";


    let pdfDocument = null;


    let zoom = 1;

    const zoomStep = 0.1;

    const minZoom = 0.7;

    const maxZoom = 1.8;


    let escalaBase = 1;


    // ==================================================
    // CONTROL DE PÁGINAS
    // ==================================================

    const paginas = new Map();

    let paginaActiva = 1;

    let observadorPaginas = null;


    // ==================================================
    // CARGAR PDF.JS
    // ==================================================

    const pdfScript =
        document.createElement("script");


    pdfScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";


    pdfScript.onload = () => {

        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


        cargarPDF();

    };


    pdfScript.onerror = () => {

        mostrarError(
            "No fue posible cargar el visor del brochure."
        );

    };


    document.head.appendChild(pdfScript);


    // ==================================================
    // CARGAR DOCUMENTO
    // ==================================================

    async function cargarPDF(){

        try{

            pdfDocument =
                await pdfjsLib
                    .getDocument(pdfURL)
                    .promise;


            totalPagesElement.textContent =
                pdfDocument.numPages;


            /*
             * Calculamos el tamaño base
             * utilizando únicamente la primera página.
             */

            const primeraPagina =
                await pdfDocument.getPage(1);


            escalaBase =
                calcularEscalaBase(
                    primeraPagina
                );


            /*
             * Ocultamos el mensaje de carga.
             */

            if(pdfLoading){

                pdfLoading.style.display =
                    "none";

            }


            /*
             * Creamos únicamente los espacios
             * de las páginas.
             *
             * TODAVÍA NO dibujamos las 33.
             */

            await crearEstructuraPaginas(
                primeraPagina
            );


            /*
             * Activamos la carga inteligente.
             */

            iniciarObservador();


            /*
             * Renderizamos inmediatamente
             * solamente las primeras páginas.
             */

            await renderizarPagina(1);

            if(pdfDocument.numPages >= 2){

                renderizarPagina(2);

            }

            if(pdfDocument.numPages >= 3){

                renderizarPagina(3);

            }


            actualizarPaginaVisible();


        }

        catch(error){

            console.error(
                "Error cargando el PDF:",
                error
            );


            mostrarError(
                "No fue posible cargar el brochure."
            );

        }

    }


    // ==================================================
    // CALCULAR ESCALA BASE
    // ==================================================

function calcularEscalaBase(page){

    const viewportBase =
        page.getViewport({
            scale: 1
        });


    const anchoDisponible =
        Math.max(
            pdfViewer.clientWidth - 40,
            100
        );


    return anchoDisponible /
           viewportBase.width;

}


    // ==================================================
    // CREAR ESTRUCTURA DE PÁGINAS
    // ==================================================

    async function crearEstructuraPaginas(
        primeraPagina
    ){

        pdfViewer
            .querySelectorAll(".pdf-page-shell")
            .forEach(elemento => elemento.remove());


        const viewportBase =
            primeraPagina.getViewport({
                scale: 1
            });


        const relacion =
            viewportBase.height /
            viewportBase.width;


        for(
            let numeroPagina = 1;
            numeroPagina <= pdfDocument.numPages;
            numeroPagina++
        ){

            const shell =
                document.createElement("div");


            shell.className =
                "pdf-page-shell";


            shell.dataset.page =
                numeroPagina;


            /*
             * Reservamos el espacio visual
             * sin crear todavía el canvas.
             */

            shell.style.aspectRatio =
                `${viewportBase.width} / ${viewportBase.height}`;


            shell.style.width =
                "min(100%, 900px)";


            shell.style.maxWidth =
                "100%";


            shell.style.margin =
                "0 auto 25px";


            shell.style.background =
                "#ffffff";


            shell.style.boxShadow =
                "0 5px 20px rgba(0, 0, 0, 0.25)";


            shell.style.position =
                "relative";


            shell.style.overflow =
                "hidden";


            /*
             * Indicador discreto mientras
             * la página todavía no se renderiza.
             */

            const indicador =
                document.createElement("div");


            indicador.className =
                "pdf-page-loading";


            indicador.textContent =
                "Cargando página...";


            shell.appendChild(
                indicador
            );


            pdfViewer.appendChild(
                shell
            );


            paginas.set(
                numeroPagina,
                {
                    shell,
                    renderizada: false,
                    renderizando: false,
                    canvas: null
                }
            );

        }

    }


    // ==================================================
    // OBSERVADOR DE PÁGINAS
    // ==================================================

    function iniciarObservador(){

        if(observadorPaginas){

            observadorPaginas.disconnect();

        }


        observadorPaginas =
            new IntersectionObserver(

                entradas => {

                    entradas.forEach(
                        entrada => {

                            if(!entrada.isIntersecting){

                                return;

                            }


                            const numeroPagina =
                                Number(
                                    entrada
                                        .target
                                        .dataset
                                        .page
                                );


                            /*
                             * Renderizamos la página
                             * cuando entra en la zona cercana
                             * al usuario.
                             */

                            renderizarPagina(
                                numeroPagina
                            );

                        }
                    );

                },

                {
                    root: pdfViewer,

                    rootMargin:
                        "1000px 0px 1000px 0px",

                    threshold: 0

                }

            );


        paginas.forEach(
            pagina => {

                observadorPaginas.observe(
                    pagina.shell
                );

            }
        );

    }


    // ==================================================
    // RENDERIZAR UNA PÁGINA
    // ==================================================

async function renderizarPagina(
    numeroPagina,
    forzar = false
){

    const datos =
        paginas.get(numeroPagina);

    if(!datos){

        return;

    }


    if(
        datos.renderizada &&
        !forzar
    ){

        return;

    }


    if(datos.renderizando){

        return;

    }


    datos.renderizando = true;


    try{

        const page =
            await pdfDocument.getPage(
                numeroPagina
            );


        /*
         * Tamaño original de la página.
         */

        const viewportBase =
            page.getViewport({
                scale: 1
            });


        /*
         * Escala final.
         */

        const escalaFinal =
            escalaBase * zoom;


        const viewport =
            page.getViewport({
                scale: escalaFinal
            });


        /*
         * ==================================================
         * ACTUALIZAR TAMAÑO REAL DEL SHELL
         * ==================================================
         *
         * El contenedor y el canvas deben tener
         * exactamente la misma proporción.
         */

        datos.shell.style.width =
            `${viewport.width}px`;

        datos.shell.style.height =
            `${viewport.height}px`;


        /*
         * Permitimos que el visor pueda contener
         * páginas más grandes cuando hacemos zoom.
         */

        datos.shell.style.maxWidth =
            "none";


        /*
         * Eliminamos el canvas anterior.
         */

        datos.shell.innerHTML = "";


        /*
         * ==================================================
         * CREAR CANVAS
         * ==================================================
         */

        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.className =
            "pdf-page";


        const context =
            canvas.getContext(
                "2d",
                {
                    alpha: false
                }
            );


        /*
         * Resolución interna.
         *
         * Limitamos a 1.5 para evitar que
         * los dispositivos móviles tengan
         * que procesar demasiados píxeles.
         */

        const pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                1.5
            );


        canvas.width =
            Math.floor(
                viewport.width *
                pixelRatio
            );


        canvas.height =
            Math.floor(
                viewport.height *
                pixelRatio
            );


        /*
         * Tamaño visual exacto.
         */

        canvas.style.width =
            `${viewport.width}px`;

        canvas.style.height =
            `${viewport.height}px`;


        canvas.dataset.page =
            numeroPagina;


        datos.shell.appendChild(
            canvas
        );


        datos.canvas =
            canvas;


        /*
         * ==================================================
         * RENDER
         * ==================================================
         */

        await page.render({

            canvasContext:
                context,

            viewport:
                viewport,

            transform:
                pixelRatio !== 1
                    ? [
                        pixelRatio,
                        0,
                        0,
                        pixelRatio,
                        0,
                        0
                    ]
                    : null

        }).promise;


        datos.renderizada =
            true;


    }

    catch(error){

        console.error(
            `Error renderizando página ${numeroPagina}:`,
            error
        );

    }

    finally{

        datos.renderizando =
            false;

    }

}

    // ==================================================
    // DETECTAR PÁGINA VISIBLE
    // ==================================================

    pdfViewer.addEventListener(
        "scroll",
        actualizarPaginaVisible
    );


    function actualizarPaginaVisible(){

        const shells =
            pdfViewer.querySelectorAll(
                ".pdf-page-shell"
            );


        if(!shells.length){

            return;

        }


        const centro =
            pdfViewer.scrollTop +
            (
                pdfViewer.clientHeight /
                2
            );


        let paginaActual =
            1;


        shells.forEach(
            (shell, index) => {

                const centroPagina =
                    shell.offsetTop +
                    (
                        shell.offsetHeight /
                        2
                    );


                if(
                    centroPagina <=
                    centro
                ){

                    paginaActual =
                        index + 1;

                }

            }
        );


        paginaActiva =
            paginaActual;


        if(currentPageElement){

            currentPageElement.textContent =
                paginaActual;

        }

    }

    // ==================================================
// ZOOM
// ==================================================

async function cambiarZoom(nuevoZoom){

    /*
     * Evitamos valores fuera del rango.
     */

    nuevoZoom =
        Math.max(
            minZoom,
            Math.min(
                maxZoom,
                nuevoZoom
            )
        );


    /*
     * Redondeamos.
     */

    zoom =
        Math.round(
            nuevoZoom * 10
        ) / 10;


    actualizarZoom();


    /*
     * La página que el usuario está leyendo
     * es la única que necesitamos recalcular
     * inmediatamente.
     */

    const pagina =
        paginaActiva;


    /*
     * Evitamos que el navegador se bloquee
     * mientras cambia el tamaño.
     */

    await new Promise(
        resolve =>
            requestAnimationFrame(resolve)
    );


    await renderizarPagina(
        pagina,
        true
    );


    /*
     * Actualizamos únicamente las páginas
     * inmediatamente cercanas.
     *
     * No renderizamos las 33.
     */

    const paginaAnterior =
        pagina - 1;

    const paginaSiguiente =
        pagina + 1;


    if(
        paginaAnterior >= 1
    ){

        renderizarPagina(
            paginaAnterior,
            true
        );

    }


    if(
        paginaSiguiente <=
        pdfDocument.numPages
    ){

        renderizarPagina(
            paginaSiguiente,
            true
        );

    }

}


// ==================================================
// BOTÓN ZOOM +
// ==================================================

if(zoomInButton){

    zoomInButton.addEventListener(
        "click",
        () => {

            if(
                zoom >= maxZoom
            ){

                return;

            }


            cambiarZoom(
                zoom + zoomStep
            );

        }
    );

}


// ==================================================
// BOTÓN ZOOM -
// ==================================================

if(zoomOutButton){

    zoomOutButton.addEventListener(
        "click",
        () => {

            if(
                zoom <= minZoom
            ){

                return;

            }


            cambiarZoom(
                zoom - zoomStep
            );

        }
    );

}


// ==================================================
// ACTUALIZAR INDICADOR
// ==================================================

function actualizarZoom(){

    if(!zoomLevelElement){

        return;

    }


    zoomLevelElement.textContent =
        Math.round(
            zoom * 100
        ) + "%";

}

    // ==================================================
    // PANTALLA COMPLETA
    // ==================================================

    if(fullscreenButton){

        fullscreenButton.addEventListener(
            "click",
            () => {

                const visor =
                    document.querySelector(
                        ".brochure-viewer"
                    );


                if(!visor){

                    return;

                }


                if(
                    !document.fullscreenElement
                ){

                    visor
                        .requestFullscreen()
                        .catch(error => {

                            console.error(
                                "No se pudo activar pantalla completa:",
                                error
                            );

                        });

                }

                else{

                    document.exitFullscreen();

                }

            }
        );

    }


    // ==================================================
    // ACTUALIZAR TEXTO PANTALLA COMPLETA
    // ==================================================

    document.addEventListener(
        "fullscreenchange",
        () => {

            if(!fullscreenButton){

                return;

            }


            const texto =
                fullscreenButton.querySelector(
                    "span"
                );


            if(!texto){

                return;

            }


            if(
                document.fullscreenElement
            ){

                texto.textContent =
                    "Salir de pantalla completa";

            }

            else{

                texto.textContent =
                    "Pantalla completa";

            }

        }
    );


    // ==================================================
    // MENSAJE DE ERROR
    // ==================================================

    function mostrarError(mensaje){

        if(!pdfLoading){

            return;

        }


        pdfLoading.textContent =
            mensaje;


        pdfLoading.style.display =
            "block";

    }

});

//==================================================
// FUNCIONALIDAD DEL BROCHURE
//==================================================

document.addEventListener("componentesListos", () => {

    //==================================================
    // ELEMENTOS DEL MODAL
    //==================================================

    const botonModal =
    document.getElementById("abrirModal");

    const modal =
    document.getElementById("modalCotizacion");

    const modalExito =
    document.getElementById("modalExito");

    const cerrarModal =
    document.querySelector(".cerrar-modal");

    const contenidoModal =
    document.querySelector(".modal-contenido");

    const formulario =
    document.getElementById("formModal");

    const btnNuevoFormulario =
    document.getElementById("nuevoFormulario");

    const btnCerrarExito =
    document.getElementById("cerrarExito");

    const btnWhatsappExito =
    document.getElementById("btnWhatsappExito");


    //==================================================
    // VALIDACIÓN DE ELEMENTOS
    //==================================================

    if(!botonModal){

        console.warn(
            "BROCHURE: No se encontró #abrirModal"
        );

        return;

    }

    if(!modal){

        console.warn(
            "BROCHURE: No se encontró #modalCotizacion"
        );

        return;

    }

    if(!formulario){

        console.warn(
            "BROCHURE: No se encontró #formModal"
        );

        return;

    }


    //==================================================
    // ABRIR MODAL DE COTIZACIÓN
    //==================================================

    botonModal.addEventListener("click", function(e){

        e.preventDefault();

        formulario.reset();

        modal.style.display = "flex";

        requestAnimationFrame(() => {

            if(contenidoModal){

                contenidoModal.scrollTop = 0;

            }

        });

    });


    //==================================================
    // CERRAR MODAL
    //==================================================

    if(cerrarModal){

        cerrarModal.addEventListener("click", function(){

            formulario.reset();

            modal.style.display = "none";

        });

    }


    //==================================================
    // CERRAR AL HACER CLICK FUERA
    //==================================================

    window.addEventListener("click", function(e){

        if(e.target === modal){

            formulario.reset();

            modal.style.display = "none";

        }

    });


    //==================================================
    // CERRAR CON ESC
    //==================================================

    document.addEventListener("keydown", function(e){

        if(e.key !== "Escape") return;


        if(modal.style.display === "flex"){

            formulario.reset();

            modal.style.display = "none";

        }


        if(
            modalExito &&
            modalExito.style.display === "flex"
        ){

            modalExito.style.display = "none";

            formulario.reset();

        }

    });


    //==================================================
    // WEB APP - SOLICITUDES
    //==================================================

    const URL_WEB_APP =
    "https://script.google.com/macros/s/AKfycbw2cEEIOR-9rktmyHtfbpIEsQJRybcIZoa7YURX-MAoGTzVR_vHnDBoHHGXiMXKJ2nslQ/exec";


    //==================================================
    // FORMULARIO ACTIVO
    //==================================================

    let formularioActivo = null;


    //==================================================
    // ENVÍO DEL FORMULARIO
    //==================================================

    formulario.addEventListener("submit", async function(e){

        e.preventDefault();

        formularioActivo = formulario;


        const botonEnviar =
        formulario.querySelector(
            'button[type="submit"]'
        );


        const textoOriginalBoton =
        botonEnviar.textContent;


        //==================================================
        // DATOS
        //==================================================

        const datos = {

            origen: "BROCHURE",

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


        try{

            const respuesta = await fetch(
                URL_WEB_APP,
                {
                    method: "POST",
                    body: JSON.stringify(datos),
                    redirect: "follow"
                }
            );


            const textoRespuesta = await respuesta.text();

            console.log("RESPUESTA GOOGLE APPS SCRIPT:");
            console.log(textoRespuesta);

            let resultado;

            try {

               resultado = JSON.parse(textoRespuesta);

            } catch(error) {

               console.error(
               "La respuesta de Google no es JSON válido:",
               textoRespuesta
               );

               throw new Error(
               "Respuesta inválida del servidor"
               );

            }


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

            if(modalExito){

                modalExito.style.display = "flex";

            }


        }catch(error){

            console.error(
                "Error enviando solicitud:",
                error
            );


            alert(
                "No pudimos enviar tu solicitud en este momento. " +
                "Por favor, inténtalo nuevamente."
            );


        }finally{

            botonEnviar.disabled = false;

            botonEnviar.textContent =
            textoOriginalBoton;

        }

    });


    //==================================================
    // BOTÓN: ENVIAR OTRA SOLICITUD
    //==================================================

    if(btnNuevoFormulario){

        btnNuevoFormulario.addEventListener(
            "click",
            function(){

                if(modalExito){

                    modalExito.style.display =
                    "none";

                }

                formulario.reset();

                modal.style.display = "flex";


                requestAnimationFrame(() => {

                    if(contenidoModal){

                        contenidoModal.scrollTop = 0;

                    }

                });

            }
        );

    }


    //==================================================
    // BOTÓN: CONTINUAR NAVEGANDO
    //==================================================

    if(btnCerrarExito){

        btnCerrarExito.addEventListener(
            "click",
            function(){

                if(modalExito){

                    modalExito.style.display =
                    "none";

                }

                formulario.reset();

            }
        );

    }


    //==================================================
    // BOTÓN: WHATSAPP DESDE ÉXITO
    //==================================================

    if(btnWhatsappExito){

        btnWhatsappExito.addEventListener(
            "click",
            function(){

                if(modalExito){

                    modalExito.style.display =
                    "none";

                }

                formulario.reset();

                modal.style.display = "none";

            }
        );

    }

});