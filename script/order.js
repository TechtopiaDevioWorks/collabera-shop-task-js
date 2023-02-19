function initOrderTable() {
    const orderContainer = document.getElementById('order-container')
    if(!orderContainer) {
        return
    }
    if(!g_order || Object.keys(g_order.content).length === 0) {
        orderContainer.innerHTML = `
        <div class="notification is-warning">
            <h5 class="title is-5">Your shopping cart is empty.</h5>
            <p>Continue shopping on My shop. View <a href="../html/dashboard.html">all products</a> <!--or choose one of our most visited categories: <a href="../html/dashboard.html?category=phones">Phones</a>, <a  href="../html/dashboard.html?category=computers">Computers</a>-->.</p>
            <br>
            <p>If you encounter any problems in sending your order please contact us.</p>
        </div>
        `
    } else {
        const tableBody = generateOrderTable()
        const tableFooter = generateOrderTableFooter()
        const deliveryForm = generateDeliveryForm()
        orderContainer.innerHTML = `
        <div class="card">
        <header class="card-header">
            <p class="card-header-title is-justify-content-center title is-5">
            Your cart
            </p>
        </header>
        <table class="card-content table">
        <thead>
            <tr>
            <th>Product</th>
            <th>Title</th>
            <th>Quantity</th>
            <th>Unit price w/o tax</th>
            <th>Tax rate</th>
            <th>Unit tax</th>
            <th>Total unit price</th>
            <th>Total</th>
            </tr>
        </thead>
        <tfoot>
        ${tableFooter}
        </tfoot>
        <tbody>
        ${tableBody}
        </tbody>
        </table>
        <div class="card-content">
            ${deliveryForm}
        </div>
        <footer class="card-footer">
            <button class="card-footer-item button is-primary" onclick="finishOrder()">Place order</button>
        </footer>
        </div
        `
    }
}

function generateDeliveryForm() {
    let deliveryForm = `
    <div class="card">
        <header class="card-header">
            <p class="card-header-title is-justify-content-center title is-6">
            Delivery details
            </p>
        </header>
        <div class="card-content">
            <section class="section">
            <h6 class="title is-5">Delivery address</h6>
            <div class="field">

                <div class="control">
                    <input class="input" type="text" placeholder="Input your address" id="buynow-delivery-address">
                </div>
            </div>
            </section>
        </div>
    </div>
    `
    return deliveryForm
}

function generateOrderTableFooter() {
    let total_quantity = 0
    let total_tax=0
    let total_total = 0
    for (const [product_id, product_quantity] of Object.entries(g_order.content)) {
        let productInfo = g_productList.find(el => el.id == product_id)
        let taxRate = 0;
        let productCategory = g_categoryList.find((el) => el.id === productInfo.category_id);
        if (!g_user || g_user.business === false) {
            taxRate = productCategory.taxrate;
        }
        total_quantity += product_quantity
        total_total += productInfo.finalPrice * product_quantity
        total_tax += productInfo.price * taxRate /100 * product_quantity
    }
    let footerHTML = `
    <tr style="border-bottom: hidden;">
        <th></th>
        <th></th>
        <th>No products</th>
        <th></th>
        <th></th>
        <th>Total tax</th>
        <th></th>
        <th>Total</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th class="has-text-centered">${total_quantity}</th>
        <th></th>
        <th></th>
        <th class="has-text-centered" >${total_tax} lei</th>
        <th></th>
        <th class="has-text-centered">${total_total} lei</th>
    </tr>
    `
    return footerHTML
}

function generateOrderTable() {
    let tableBody = '';
    for (const [product_id, product_quantity] of Object.entries(g_order.content)) {
        tableBody+=generateOrderTableEntry(product_id, product_quantity)
    }
    return tableBody
}

function generateOrderTableEntry(product_id, product_quantity) {
    let productInfo = g_productList.find(el => el.id == product_id)
    let taxRate = 0;
	let productCategory = g_categoryList.find((el) => el.id === productInfo.category_id);
	if (!g_user || g_user.business === false) {
		taxRate = productCategory.taxrate;
	}
    let productHTML = '<tr>'
    productHTML += `<td>
    <figure class="image cart-product-image-container">
        <img src="${productInfo.imgurl}" alt="Image" class="cart-product-image">
    </figure>
    </td>` // image
    productHTML +=`<td>${productInfo.name}</td>`
    productHTML +=`<td>
    <span style="
    text-align: center;
    display: flex;
    margin: auto;
    justify-content: center;">${product_quantity}</span>
    <div class="level-left is-justify-content-center">
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
    </td>`
    productHTML +=`<td>${productInfo.price} lei</td>`
    productHTML +=`<td>${taxRate} %</td>`
    productHTML +=`<td>${productInfo.price * taxRate/100} lei</td>`
    productHTML +=`<td>${productInfo.finalPrice} lei</td>`
    productHTML +=`<td>${productInfo.finalPrice * product_quantity} lei</td>`
    productHTML += '</tr>'
    return productHTML
}