let g_productList = [];
let g_categoryList = [];

async function api_getProductList() {
	try {
		let res = await axios({
			method: 'get',
			url: url + 'products',
		});
		if (res.data) {
			g_productList = res.data;
		}
	} catch (e) {
		console.log(e);
		alert(e.response.statusText);
	}
	console.log(g_productList);
}

async function api_getCategoryList() {
	try {
		let res = await axios({
			method: 'get',
			url: url + 'categories',
		});
		if (res.data) {
			g_categoryList = res.data;
			generateCategories();
		}
	} catch (e) {
		console.log(e);
		alert(e.response.statusText);
	}
	console.log(g_categoryList);
}

async function loadProducts() {
	await api_getCategoryList();
	await api_getProductList();
	let productsContainter = document.getElementById('products-container');
	if(productsContainter) {
		productsContainter.innerHTML = '';
	}
	for (const product of g_productList) {
		const prodCard = generateProductCard(product);
		if(productsContainter) {
			productsContainter.innerHTML += prodCard;
		}
	}
	await initCart();
	if(typeof(initOrderTable) === 'function') {
		initOrderTable()
	}
}

function allProductsClick() {
	if (!window.location.href.includes('dashboard.html')) {
		window.location.replace('../html/dashboard.html');
	} else {
		filterProductsByCategory(null);
	}
}

function filterProductsByCategory(category_id) {
	let productsContainter = document.getElementById('products-container');
	let filteredProductList = g_productList;
	if (category_id !== null) {
		filteredProductList = filteredProductList.filter((el) => el.category_id === category_id);
	}
	if(productsContainter) {
		productsContainter.innerHTML = '';
	}
	for (const product of filteredProductList) {
		const prodCard = generateProductCard(product);
		if(productsContainter) {
			productsContainter.innerHTML += prodCard;
		}
	}
	displaySelectedCategory(category_id);
}

function displaySelectedCategory(category_id) {
	if (category_id === null) {
		for (const category of g_categoryList) {
			const element = document.getElementById(`filter-category-${category.id}`);
			element.classList.remove('is-active');
		}
		const allElement = document.getElementById(`filter-category-all`);
		allElement.classList.add('is-active');
		const categoryTab = document.getElementById(`filter-category-tab`);
		categoryTab.classList.remove('category-tab-active');
	} else {
		const allElement = document.getElementById(`filter-category-all`);
		allElement.classList.remove('is-active');
		const categoryTab = document.getElementById(`filter-category-tab`);
		categoryTab.classList.add('category-tab-active');
		for (const category of g_categoryList) {
			const element = document.getElementById(`filter-category-${category.id}`);
			if (category.id === category_id) {
				element.classList.add('is-active');
			} else {
				element.classList.remove('is-active');
			}
		}
	}
}

function generateCategories() {
	const categoryContainer = document.getElementById('navbar-categories');
	if (!categoryContainer) {
		console.error('Category container not found');
		return;
	}
	categoryContainer.innerHTML = '';
	for (const category of g_categoryList) {
		categoryContainer.innerHTML += `
        <a class="navbar-item is-tab" onclick="filterProductsByCategory(${category.id})" id="filter-category-${category.id}">${category.name}</a>
        `;
	}
}

function generateProductFinalPrice(price, taxrate) {
	return Math.floor(price * (1 + taxrate / 100) * 100) / 100;
}

function generateProductCard(prod) {
	let taxRate = 0;
	let productCategory = g_categoryList.find((el) => el.id === prod.category_id);
	if (!g_user || g_user.business === false) {
		taxRate = productCategory.taxrate;
	}
	let loggedin = !!g_user;
	let productFinalPrice = generateProductFinalPrice(prod.price, taxRate);
	let addProduct2CartCall = productFinalPrice === 0 || !loggedin ? '' : `onclick="addProduct2Cart(${prod.id})"`;
	let productBuynowCall = productFinalPrice === 0 || !loggedin ? '' : `onclick="buyNowProduct(${prod.id})"`;
	prod.finalPrice = productFinalPrice;
	let cardComponent = `
    <div class="card m-3" style="width: 300px">
        <div class="card-image">
            <figure class="image p-5" style="width: 300px; height: 225px;">
                <img src="${prod.imgurl}" alt="${
		prod.name
	}" style="max-height: 200px; width: auto; margin: auto;" class="product-image">
            </figure>
        </div>
        <div class="card-content">
            <div class="media" style="height: 3rem;">
                <div class="media-content is-clipped">
                    <p class="title is-6" style="height: 37px;text-overflow: ellipsis; overflow: hidden;">${prod.name}</p>
                    <p class="subtitle is-5 is-primary">${productFinalPrice === 0 ? '' : productFinalPrice + ' Lei'}</p>
                </div>
            </div>
            <div class="content is-flex is-flex-direction-column is-justify-content-space-around">
                <div class="is-flex w-100 p-2">
                    <button class="button is-info m-auto" title="Product info" onclick="openCardInfo(${prod.id})">Info</button>
                </div>
                <div class="is-flex w-100 p-2">
                    <button class="button is-warning m-auto" 
						${productFinalPrice === 0 || !loggedin ? 'disabled' : ''} 
						title="${productFinalPrice === 0 ? 'Coming soon' : loggedin ? 'Fast checkout' : 'Please login'}"
						${productBuynowCall}
						>Buy now
					</button>
                    <button class="button is-success m-auto" ${productFinalPrice === 0 || !loggedin ? 'disabled' : ''} 
						title="${productFinalPrice === 0 ? 'Coming soon' : loggedin ? 'Add to cart' : 'Please login'}" 
						${addProduct2CartCall}
						>Add to cart
					</button>
                </div>
          </div>
        </div>
    </div>
    `;
	return cardComponent;
}

function openCardInfo(prodId) {
	const prod = g_productList.find((el) => el.id === prodId);
	const infoModal = document.getElementById('product-info-modal');
	const infoModalTitle = document.getElementById('product-info-modal-title');
	const infoModalContent = document.getElementById('product-info-modal-body');
	if (!infoModal || !infoModalTitle || !infoModalContent || !prod) {
		console.error('Could not find modal or product');
		return;
	}
	infoModalTitle.innerHTML = prod.name;
	infoModalContent.innerHTML = prod.description;
	infoModal.classList.add('is-active');
}

function closeCardInfo() {}

window.addEventListener('DOMContentLoaded', () => {
	loadProducts();
	function closeModal(el) {
		el.classList.remove('is-active');
	}
	(
		document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') ||
		[]
	).forEach((close) => {
		const target = close.closest('.modal');

		close.addEventListener('click', () => {
			closeModal(target);
		});
	});
	document.querySelector('.navbar-burger').addEventListener('click', () => {
		document.querySelector('.navbar-burger').classList.toggle('is-active');
		document.querySelector('.navbar-menu').classList.toggle('is-active');
	});
});

function zoomImage(event) {
	console.log(event);
}
