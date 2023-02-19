let g_order = null

function updateCartButton() {
    if(typeof(initOrderTable) === 'function') {
		initOrderTable()
	}
    const navBarEnd = document.getElementById('navbar-end')
    const cartHeaderButton = document.getElementById('cart-header-button')
    if(!navBarEnd || !g_order) {
        return
    }
    let productCount = 0;
    for(const el of Object.values(g_order.content)) {
        productCount+=el
    }
    let productCountBadge = '';
    if(productCount > 0) {
        productCountBadge = `<span class="badge is-cart-badge">${productCount}</span>`
    }
    let productsHTMLElements = ``
    let sendOrderBtn = ``
    let totalPrice = 0;
    for (const [product_id, product_quantity] of Object.entries(g_order.content)) {
        productsHTMLElements += generateCartProduct(product_id, product_quantity)
        let productInfo = g_productList.find(el => el.id == product_id)
        totalPrice += productInfo.finalPrice * product_quantity
    }
    if (productsHTMLElements.length === 0) {
        productsHTMLElements = `
        <a class="navbar-item" style="pointer-events: none;">Your cart is empty.</a>
        `
    } else {
        sendOrderBtn = `
        <div class="is-flex is-justify-content-space-around">
            <div class="m-auto"><span class="title is-6">Total: ${totalPrice} lei</span></div>
            <button class="button is-success m-auto is-small" title="Send order" onclick="go2buyNow()">Send order</button>
        </div>
        `
    }
    if (!cartHeaderButton) {
        navBarEnd.innerHTML += `
        <div class="navbar-item has-dropdown is-hoverable " id="cart-header-button">
            <a class="navbar-link is-arrowless mobile-hidden">
            <i class="fa-solid fa-shopping-cart"></i>
            ${productCountBadge}
            </a>

            <div class="navbar-dropdown is-right is-cart-dropdown">
            ${productsHTMLElements}
            <hr class="navbar-divider">
            ${sendOrderBtn}
            </div>
        </div>
    `
    } else {
        cartHeaderButton.innerHTML = `
        <a class="navbar-link is-arrowless mobile-hidden">
        <i class="fa-solid fa-shopping-cart"></i>
        ${productCountBadge}
        </a>

        <div class="navbar-dropdown is-right is-cart-dropdown">
        ${productsHTMLElements}
        <hr class="navbar-divider">
        ${sendOrderBtn}
        </div>
        `
    }
}

function generateCartProduct(product_id, product_quantity) {
    let productInfo = g_productList.find(el => el.id == product_id)
    let productElement = `
    <a class="m-auto">
        <div class="m-2 p-2">
            <article class="media">
                <div class="media-left" onclick="openCardInfo(${productInfo.id})">
                <figure class="image cart-product-image-container">
                    <img src="${productInfo.imgurl}" alt="Image" class="cart-product-image">
                </figure>
                </div>
                <div class="media-content">
                <div class="content is-flex" onclick="openCardInfo(${productInfo.id})">
                    <p>
                    <span class="is-cart-product-title"><strong>${productInfo.name}</strong></span>
                    <small>${product_quantity} unit${product_quantity > 1 ? 's': ''}</small>
                    </p>
                    <p class="m-auto">
                    <span class="is-cart-product-price"><strong>${productInfo.finalPrice} lei</strong></span>
                    </p>
                </div>
                <nav class="level is-mobile is-flex-direction-row-reverse">
                    <div class="level-right">
                    <a class="level-item" aria-label="Descrese quantity" onclick="changeProductQuantity(${product_id}, ${product_quantity -1})">
                        <span class="icon is-small">
                        <i class="fa-solid ${product_quantity > 1 ? 'fa-minus' : 'fa-trash-can'}" aria-hidden="true"></i>
                        </span>
                    </a>
                    <a class="level-item" aria-label="Increase quantity" onclick="changeProductQuantity(${product_id}, ${product_quantity +1})">
                        <span class="icon is-small">
                        <i class="fa-solid fa-plus" aria-hidden="true"></i>
                        </span>
                    </a>
                    </div>
                </nav>
                </div>
            </article>
        </div>
    </a>
    `
    return productElement
}

async function changeProductQuantity(product_id, product_quantity) {
    if(!g_order) {
        return
    }
    if (g_order.content?.hasOwnProperty(product_id)) {
        if(product_quantity == 0) {
            delete g_order.content[product_id]
        } else {
            g_order.content[product_id] = product_quantity
        }
    }
    await api_updateOrder()
    updateCartButton()
}

async function finishOrder() {
    if(!g_order) {
        return
    }
    const address = document.getElementById('buynow-delivery-address')
    if(!address) {
        return
    }
    if(!address.value && address.value.length === 0) {
        alert('Address is required')
        return
    }
    g_order.address = address.value
    g_order.state = 'sold'
    await api_updateOrder()
    window.location.reload()
}

async function buyNowProduct(product_id) {
    await addProduct2Cart(product_id)
    go2buyNow()
}

function go2buyNow() {
    if (!window.location.href.includes('buynow.html')) {
		window.location = '../html/buynow.html';
	}
}

async function addProduct2Cart(product_id) {
    if(!g_order) {
        return
    }
    if (g_order.content?.hasOwnProperty(product_id)) {
        g_order.content[product_id] += 1
    } else {
        g_order.content[product_id] = 1
    }
    console.log(g_order)
    await api_updateOrder()
    updateCartButton()
}

async function api_updateOrder(){
    if(!g_order) {
        return
    }
    try {
        let apidata = {
            state: g_order.state,
            content: g_order.content,
        }
        if(g_order.address) {
            apidata.address = g_order.address
        }
		let posRes = axios({
            method: 'patch',
            data: apidata,
            url: url+`orders/${g_order.id}`,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
        })
        if(posRes.data) {
            g_order = posRes.data
        }
	} catch (e) {
		console.log(e);
		alert(e.response.statusText);
	}
}

async function initCart() {
    await api_getShoppingCart()
    if (!g_order) {
        await api_createNewOrder()
    }
    updateCartButton()
}

async function api_createNewOrder() {
    if(!g_user) {
        return
    }
	try {
		let posRes = await axios({
            method: 'post',
            data: {
                user_id: g_user.id,
                state: 'new',
                content: {}
            },
            url: url+`orders`,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
        })
        if(posRes.data) {
            g_order = posRes.data
        }
	} catch (e) {
		console.log(e);
		alert(e.response.statusText);
	}
}

async function api_getShoppingCart() {
    if(!g_user) {
        return
    }
	try {
		let posRes = await axios({
            method: 'get',
            url: url+`orders?user_id=${g_user.id}&&state=new`,
        })
        if(posRes.data && posRes.data.length > 0) {
            g_order = posRes.data[0]
        } else {
            g_order = null
        }
	} catch (e) {
		console.log(e);
		alert(e.response.statusText);
	}
}

window.addEventListener('DOMContentLoaded', () => {

});