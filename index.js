// Selección de elementos del DOM
const btnCart = document.querySelector('.container-cart-icon'); 
const containerCartProducts = document.querySelector('.container-cart-products'); 

// Función para guardar el carrito en localStorage
const saveToLocalStorage = () => {
    localStorage.setItem('cartProducts', JSON.stringify(allProducts));
};

btnCart.addEventListener('click', () => {
	containerCartProducts.classList.toggle('hidden-cart');
});

/* ========================= */
const cartInfo = document.querySelector('.cart-product');
const rowProduct = document.querySelector('.row-product');

// Lista de todos los contenedores de productos
const productsList = document.querySelector('.container-items');

// Variable de arreglos de Productos
let allProducts = JSON.parse(localStorage.getItem('cartProducts')) || []; // Restaurar del storage si existe

const valorTotal = document.querySelector('.total-pagar');

const countProducts = document.querySelector('#contador-productos');

const cartEmpty = document.querySelector('.cart-empty');
const cartTotal = document.querySelector('.cart-total');

// Función para aplicar descuento si existe un código predefinido (sin prompt)
const discountCode = "DESC10"; // Código predefinido para prueba
const applyDiscount = (total) => {
    const discounts = {
        "DESC10": 0.10,
        "DESC20": 0.20,
    };
    return discounts[discountCode]
        ? total - (total * discounts[discountCode])
        : total;
};

// FETCH: Obtener productos dinámicamente
const fetchProducts = async () => {
    try {
        const response = await fetch('/path/to/products.json');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
};

// Función para renderizar productos en el DOM
const renderProducts = (products) => {
    products.forEach(product => {
        const productHTML = `
            <div class="product-item">
                <h2>${product.title}</h2>
                <p>${product.price}</p>
                <button class="btn-add-cart">Agregar al carrito</button>
            </div>
        `;
        productsList.insertAdjacentHTML('beforeend', productHTML);
    });
};

productsList.addEventListener('click', e => {
	if (e.target.classList.contains('btn-add-cart')) {
		const product = e.target.parentElement;

		const infoProduct = {
			quantity: 1,
			title: product.querySelector('h2').textContent,
			price: product.querySelector('p').textContent,
		};

		const exists = allProducts.some(product => product.title === infoProduct.title);

		allProducts = exists 
            ? allProducts.map(product => product.title === infoProduct.title 
                ? { ...product, quantity: product.quantity + 1 } 
                : product)
            : [...allProducts, infoProduct];

		showHTML();
		saveToLocalStorage(); // Guardar en localStorage

		// SweetAlert para notificar al usuario que se agregó un producto
		Swal.fire({
			title: 'Producto agregado',
			text: `${infoProduct.title} se ha añadido al carrito.`,
			icon: 'success',
			confirmButtonText: 'Ok'
		});
	}
});

rowProduct.addEventListener('click', e => {
	if (e.target.classList.contains('icon-close')) {
		const product = e.target.parentElement;
		const title = product.querySelector('p').textContent;

		allProducts = allProducts.filter(product => product.title !== title);

		showHTML();
		saveToLocalStorage(); // Actualizar localStorage
	}
});

// Función de orden superior para calcular el total con descuento si aplica
const calculateTotal = (products) => {
    const total = products.reduce((acc, product) => acc + product.quantity * parseFloat(product.price.slice(1)), 0);
    return applyDiscount(total);
};

// Funcion para mostrar HTML
const showHTML = () => {
	if (!allProducts.length) {
		cartEmpty.classList.remove('hidden');
		rowProduct.classList.add('hidden');
		cartTotal.classList.add('hidden');
	} else {
		cartEmpty.classList.add('hidden');
		rowProduct.classList.remove('hidden');
		cartTotal.classList.remove('hidden');
	}

	// Limpiar HTML
	rowProduct.innerHTML = '';

	let totalOfProducts = 0;

	allProducts.forEach(product => {
		const containerProduct = document.createElement('div');
		containerProduct.classList.add('cart-product');

		containerProduct.innerHTML = `
            <div class="info-cart-product">
                <span class="cantidad-producto-carrito">${product.quantity}</span>
                <p class="titulo-producto-carrito">${product.title}</p>
                <span class="precio-producto-carrito">${product.price}</span>
            </div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="icon-close"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        `;

		rowProduct.append(containerProduct);
		totalOfProducts += product.quantity;
	});

	valorTotal.innerText = `$${calculateTotal(allProducts)}`;
	countProducts.innerText = totalOfProducts;
};

// Inicialización
fetchProducts(); // Cargar productos
showHTML(); // Mostrar carrito si hay datos en localStorage