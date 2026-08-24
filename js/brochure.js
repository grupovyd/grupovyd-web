/* ==================================================
   GRUPO V&D — VISOR DEL BROCHURE
   ================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const pdfViewer = document.getElementById("pdfViewer");
    const pdfLoading = document.getElementById("pdfLoading");

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


    /* ==================================================
       CONFIGURACIÓN
       ================================================== */

    const pdfURL = "/pdf/brochure-vyd.pdf";

    let pdfDocument = null;

    let zoom = 1;

    const zoomStep = 0.1;

    const minZoom = 0.6;

    const maxZoom = 2;


    /* ==================================================
       CARGAR PDF.JS
       ================================================== */

    const pdfScript = document.createElement("script");

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


    /* ==================================================
       CARGAR DOCUMENTO
       ================================================== */

    async function cargarPDF(){

        try {

            pdfDocument =
                await pdfjsLib.getDocument(pdfURL).promise;

            totalPagesElement.textContent =
                pdfDocument.numPages;

            pdfLoading.style.display = "none";

            await renderizarTodasLasPaginas();

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


    /* ==================================================
       RENDERIZAR TODAS LAS PÁGINAS
       ================================================== */

    async function renderizarTodasLasPaginas(){

        pdfViewer
            .querySelectorAll(".pdf-page")
            .forEach(page => page.remove());


        for(
            let numeroPagina = 1;
            numeroPagina <= pdfDocument.numPages;
            numeroPagina++
        ){

            await renderizarPagina(numeroPagina);

        }

    }


    /* ==================================================
       RENDERIZAR UNA PÁGINA
       ================================================== */

    async function renderizarPagina(numeroPagina){

        const page =
            await pdfDocument.getPage(numeroPagina);


        const viewport =
            page.getViewport({
                scale: zoom
            });


        const canvas =
            document.createElement("canvas");


        canvas.className =
            "pdf-page";


        const context =
            canvas.getContext("2d");


        canvas.width =
            viewport.width;


        canvas.height =
            viewport.height;


        canvas.dataset.page =
            numeroPagina;


        pdfViewer.appendChild(canvas);


        await page.render({

            canvasContext: context,

            viewport: viewport

        }).promise;

    }


    /* ==================================================
       ZOOM
       ================================================== */

    zoomInButton.addEventListener(
        "click",
        async () => {

            if(zoom >= maxZoom){
                return;
            }

            zoom += zoomStep;

            zoom =
                Math.round(zoom * 10) / 10;

            actualizarZoom();

            await renderizarTodasLasPaginas();

        }
    );


    zoomOutButton.addEventListener(
        "click",
        async () => {

            if(zoom <= minZoom){
                return;
            }

            zoom -= zoomStep;

            zoom =
                Math.round(zoom * 10) / 10;

            actualizarZoom();

            await renderizarTodasLasPaginas();

        }
    );


    function actualizarZoom(){

        zoomLevelElement.textContent =
            Math.round(zoom * 100) + "%";

    }


    /* ==================================================
       DETECTAR PÁGINA VISIBLE
       ================================================== */

    pdfViewer.addEventListener(
        "scroll",
        actualizarPaginaVisible
    );


    function actualizarPaginaVisible(){

        const paginas =
            pdfViewer.querySelectorAll(".pdf-page");


        if(!paginas.length){
            return;
        }


        const centro =
            pdfViewer.scrollTop +
            (pdfViewer.clientHeight / 2);


        let paginaActual = 1;


        paginas.forEach(
            (pagina, index) => {

                const paginaCentro =
                    pagina.offsetTop +
                    (pagina.offsetHeight / 2);


                if(paginaCentro <= centro){

                    paginaActual =
                        index + 1;

                }

            }
        );


        currentPageElement.textContent =
            paginaActual;

    }


    /* ==================================================
       PANTALLA COMPLETA
       ================================================== */

    fullscreenButton.addEventListener(
        "click",
        () => {

            const visor =
                document.querySelector(
                    ".brochure-viewer"
                );


            if(!document.fullscreenElement){

                visor.requestFullscreen()
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


    /* ==================================================
       ACTUALIZAR BOTÓN DE PANTALLA COMPLETA
       ================================================== */

    document.addEventListener(
        "fullscreenchange",
        () => {

            if(document.fullscreenElement){

                fullscreenButton
                    .querySelector("span")
                    .textContent =
                    "Salir de pantalla completa";

            }

            else{

                fullscreenButton
                    .querySelector("span")
                    .textContent =
                    "Pantalla completa";

            }

        }
    );


    /* ==================================================
       MENSAJE DE ERROR
       ================================================== */

    function mostrarError(mensaje){

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