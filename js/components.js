async function cargarComponente(id, archivo){

    const contenedor = document.getElementById(id);

    if(!contenedor) return;

    const respuesta = await fetch(archivo);

    contenedor.innerHTML = await respuesta.text();

}

async function iniciarComponentes(){

    await cargarComponente(
        "navbar-container",
        "/componentes/navbar.html"
    );

    await cargarComponente(
        "footer-container",
        "/componentes/footer.html"
    );

}

iniciarComponentes().then(() => {

    document.dispatchEvent(
        new Event("componentesListos")
    );

});