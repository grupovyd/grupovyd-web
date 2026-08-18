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