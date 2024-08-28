// Cargar los juegos desde un archivo JSON utilizando fetch

fetch('./info.json')
    .then(response => response.json())
    .then(juegos => principal(juegos))
    .catch(error => console.error("Error al cargar los juegos:", error));

function principal(juegos) {
    // Reinicializar el carrito desde el localStorage al iniciar la aplicación
    let carrito = cargarCarritoDesdeStorage();
    crearCardsJuegos(juegos, carrito);
    crearFiltrosPorCategoria(juegos);

    let input = document.getElementById("buscador");
    let botonBuscar = document.getElementById("buscar");
    botonBuscar.addEventListener("click", () => filtraPorNombre(juegos, input.value));

    renderizarCarrito(carrito);
    actualizarContadorCarrito(carrito);
}

function filtrarPorCategoria(e, juegos) {
    let juegosFiltrados = juegos.filter(juego => juego.categoria.includes(e.target.value));
    crearCardsJuegos(juegosFiltrados, cargarCarritoDesdeStorage());
}

function filtraPorNombre(juegos, valorBusqueda) {
    let juegosFiltrados = juegos.filter(juego => juego.nombre.toLowerCase().includes(valorBusqueda.toLowerCase()));
    crearCardsJuegos(juegosFiltrados, cargarCarritoDesdeStorage());
}

function crearCardsJuegos(juegos, carrito) {
    let contenedorJuegos = document.getElementById("juegos");
    contenedorJuegos.innerHTML = "";

    juegos.forEach(juego => {
        contenedorJuegos.innerHTML += `
        <div class="juegos">
            <h3>${juego.nombre}</h3>
            <p>$${juego.precio}</p>
            <p>Quedan ${juego.stock} u.</p>
            <img src="./img/${juego.rutaImagen}">
            <button id="${juego.id}">Añadir al carrito</button>
        </div>
        `;
    });

    juegos.forEach(juego => {
        let botonAgregarAlCarrito = document.getElementById(juego.id);
        botonAgregarAlCarrito.addEventListener("click", (e) => agregarAlCarrito(e, juegos, carrito));
    });
}

//sweet ---------------------------------

function lanzarAlerta(title,text,icon,confirmButtonText) {
    Swal.fire({
        title: title,
        text,
        icon,
        confirmButtonText
      })
    }

function agregarAlCarrito(e, juegos, carrito) {
    let idJuego = Number(e.target.id);
    let juegoBuscado = juegos.find(juego => juego.id === idJuego);
    let juegoEnCarrito = carrito.find(juego => juego.id === idJuego);

    if (juegoBuscado.stock <= 0) {
       
        lanzarAlerta('No hay stock disponible',
            'Sin stock',
            'Pruebe mas tarde',
            'Aceptar');
        return;
        
    }
    

    if (juegoEnCarrito) {
        if (juegoEnCarrito.unidades < juegoBuscado.stock) {
            juegoEnCarrito.unidades++;
            juegoEnCarrito.subtotal += juegoBuscado.precio;
        } else {
          
           lanzarAlerta('Has alacanzado el limite de stock',
            'Stock no disponible',
            'Pruebe mas tarde',
            'Aceptar');

        }
    } else {
        carrito.push({
            id: juegoBuscado.id,
            nombre: juegoBuscado.nombre,
            precioUnitario: juegoBuscado.precio,
            unidades: 1,
            subtotal: juegoBuscado.precio
        });
    }


    guardarCarritoEnStorage(carrito);
    renderizarCarrito(carrito);
    actualizarContadorCarrito(carrito);

    // Ocultar el carrito al añadir un producto
    document.getElementById("paginaCarrito").classList.add("oculto");
    document.getElementById("paginaJuegos").classList.remove("oculto");
}

function renderizarCarrito(carrito) {
    let contenedorCarrito = document.getElementById("contenedorCarrito");
    contenedorCarrito.innerHTML = "";
    if (carrito.length > 0) {
        carrito.forEach(juego => {
            contenedorCarrito.innerHTML += `
            <div class="item-carrito">
                <p>${juego.nombre}</p>
                <p>Precio: $${juego.precioUnitario}</p>
                <p>Unidades: ${juego.unidades}</p>
                <p>Subtotal: $${juego.subtotal}</p>
                <button class="eliminar" data-id="${juego.id}">Eliminar</button>
            </div>
            `;
        });

        document.querySelectorAll(".eliminar").forEach(boton => {
            boton.addEventListener("click", (e) => eliminarDelCarrito(e, carrito));
        });
    } else {
        contenedorCarrito.innerHTML = "<p>El carrito está vacío.</p>";
    }
}

function eliminarDelCarrito(e, carrito) {
    let idJuego = Number(e.target.getAttribute("data-id"));
    let juegoIndex = carrito.findIndex(juego => juego.id === idJuego);

    if (juegoIndex > -1) {
        carrito.splice(juegoIndex, 1);
        guardarCarritoEnStorage(carrito);
        renderizarCarrito(carrito);
        actualizarContadorCarrito(carrito);
    }
}

function procesarCompra(carrito, juegos) {
    if (carrito.length > 0) {
        
        lanzarAlerta('Gracias por su compra!',
            'Le enviaremos su factura de compra por correo electronico',
            '',
            'Aceptar'
        );

    
        // Actualizar el stock de los juegos
        carrito.forEach(item => {
            let juego = juegos.find(j => j.id === item.id);
            if (juego) {
                juego.stock -= item.unidades;
            }
        });

        // Vaciar el carrito y eliminarlo del localStorage
        carrito.length = 0;
        guardarCarritoEnStorage(carrito);

        // Actualizar la interfaz del carrito y el contador
        renderizarCarrito(carrito);
        actualizarContadorCarrito(carrito);
    } else { 

       lanzarAlerta('El carrito esta vacio',
        'Agrega productos para comprar',
        '',
        'Aceptar');

    }
}

function guardarCarritoEnStorage(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarCarritoDesdeStorage() {
    let carritoJSON = localStorage.getItem("carrito");
    return carritoJSON ? JSON.parse(carritoJSON) : [];
}

function crearFiltrosPorCategoria(juegos) {
    let categorias = juegos.map(juego => juego.categoria);
    let categoriasUnicas = [...new Set(categorias)];

    let contenedorFiltros = document.getElementById("filtros");

    categoriasUnicas.forEach(categoria => {
        let botonFiltro = document.createElement("button");
        botonFiltro.classList.add("button");
        botonFiltro.innerText = categoria;
        botonFiltro.value = categoria;
        contenedorFiltros.appendChild(botonFiltro);

        botonFiltro.addEventListener("click", (e) => filtrarPorCategoria(e, juegos));
    });

    document.getElementById("Todos").addEventListener("click", () => {
        crearCardsJuegos(juegos, cargarCarritoDesdeStorage());
    });
}

document.getElementById("verCarrito").addEventListener("click", () => {
    let paginaJuegos = document.getElementById("paginaJuegos");
    let paginaCarrito = document.getElementById("paginaCarrito");

    if (paginaCarrito.classList.contains("oculto")) {
        paginaJuegos.classList.add("oculto");
        paginaCarrito.classList.remove("oculto");
    } else {
        paginaJuegos.classList.remove("oculto");
        paginaCarrito.classList.add("oculto");
    }
});

document.getElementById("comprar").addEventListener("click", () => {
    let carrito = cargarCarritoDesdeStorage();
    fetch('./info.json')
        .then(response => response.json())
        .then(juegos => procesarCompra(carrito, juegos))
        .catch(error => console.error("Error al procesar la compra:", error));
});

function actualizarContadorCarrito(carrito) {
    let contadorCarrito = document.getElementById("verCarrito");
    let totalUnidades = carrito.reduce((total, juego) => total + juego.unidades, 0);
    contadorCarrito.innerText = `CARRITO (${totalUnidades})`;
}




