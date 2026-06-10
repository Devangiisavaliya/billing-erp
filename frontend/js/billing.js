
const API_URL = "http://127.0.0.1:5000";

const token =
localStorage.getItem("token");

if (!token) {
    window.location.href = "/login";
}

// ======================
// GLOBALS
// ======================

let products = [];
let customers = [];
let cart = [];

// ======================
// ELEMENTS
// ======================

const customerSelect =
document.getElementById(
    "customer_id"
);

const productSelect =
document.getElementById(
    "productSelect"
);

const qtyInput =
document.getElementById(
    "productQty"
);

const barcodeInput =
document.getElementById(
    "barcodeInput"
);

const cartTable =
document.getElementById(
    "cartTable"
);

const salesTable =
document.getElementById(
    "salesTable"
);
const startScannerBtn =
document.getElementById(
    "startScannerBtn"
);

startScannerBtn.addEventListener(
    "click",
    startScanner
);
function startScanner(){

    const scanner =
    new Html5Qrcode(
        "reader"
    );

    scanner.start(
    {
        facingMode: "environment"
    },
    {
        fps: 20,
        qrbox: {
            width: 350,
            height: 150
        }
    },
    onScanSuccess
);

}
// ======================
// LOAD CUSTOMERS
// ======================

async function loadCustomers(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/customers",
            {
                headers:{
                    Authorization:
                    "Bearer " + token
                }
            }
        );

        customers =
        await response.json();

        customerSelect.innerHTML =
        `
        <option value="">
            Select Customer
        </option>
        `;

        customers.forEach(customer => {

            customerSelect.innerHTML +=
            `
            <option value="${customer.id}">
                ${customer.customer_name}
            </option>
            `;

        });

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// LOAD PRODUCTS
// ======================

async function loadProducts(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/products",
            {
                headers:{
                    Authorization:
                    "Bearer " + token
                }
            }
        );

        products =
        await response.json();

        productSelect.innerHTML =
        `
        <option value="">
            Select Product
        </option>
        `;

        products.forEach(product => {

            productSelect.innerHTML +=
            `
            <option value="${product.id}">
                ${product.product_name}
            </option>
            `;

        });

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// ADD TO CART
// ======================

document
.getElementById(
    "addProductBtn"
)
.addEventListener(
    "click",
    addToCart
);

function addToCart(){

    const productId =
    Number(
        productSelect.value
    );

    const qty =
    Number(
        qtyInput.value
    );

    if(!productId){

        alert(
            "Select Product"
        );

        return;
    }

    const product =
    products.find(
        p => p.id === productId
    );

    if(!product){
        return;
    }

    const existing =
    cart.find(
        item =>
        item.product_id ===
        productId
    );

    if(existing){

        existing.quantity += qty;

    }
    else{

        cart.push({

            product_id:
            product.id,

            product_name:
            product.product_name,

            price:
            Number(
                product.selling_price
            ),

            gst:
            Number(
                product.gst_percent
            ),

            quantity:
            qty

        });

    }

    renderCart();

}

// ======================
// RENDER CART
// ======================

function renderCart(){

    cartTable.innerHTML = "";

    cart.forEach(
        (item,index) => {

        const lineTotal =
        item.price *
        item.quantity;

        cartTable.innerHTML +=
        `
        <tr>

            <td>
                ${item.product_name}
            </td>

            <td>
                ₹${item.price}
            </td>

            <td>
                ${item.gst}%
            </td>

            <td>
                ${item.quantity}
            </td>

            <td>
                ₹${lineTotal.toFixed(2)}
            </td>

            <td>

                <button
                    class="remove-btn"
                    onclick="removeItem(${index})"
                >
                    Remove
                </button>

            </td>

        </tr>
        `;

    });

    calculateTotals();

}

// ======================
// REMOVE ITEM
// ======================

function removeItem(index){

    cart.splice(
        index,
        1
    );

    renderCart();

}

// ======================
// TOTALS
// ======================

function calculateTotals(){

    let subtotal = 0;

    let gst = 0;

    cart.forEach(item => {

        const amount =
        item.price *
        item.quantity;

        subtotal += amount;

        gst +=
        (
            amount *
            item.gst
        ) / 100;

    });

    const grand =
    subtotal + gst;

    document.getElementById(
        "subtotal"
    ).innerText =
    "₹" +
    subtotal.toFixed(2);

    document.getElementById(
        "gstAmount"
    ).innerText =
    "₹" +
    gst.toFixed(2);

    document.getElementById(
        "grandTotal"
    ).innerText =
    "₹" +
    grand.toFixed(2);

}

// ======================
// GENERATE BILL
// ======================

document
.getElementById(
    "generateBillBtn"
)
.addEventListener(
    "click",
    generateBill
);

async function generateBill(){

    if(cart.length === 0){

        alert(
            "Cart Empty"
        );

        return;
    }

    const customerId =
    customerSelect.value;

    if(!customerId){

        alert(
            "Select Customer"
        );

        return;
    }

    const payload = {

        customer_id:
        Number(customerId),

        payment_mode:
        document.getElementById(
            "payment_mode"
        ).value,

        payment_status:
        document.getElementById(
            "payment_status"
        ).value,

        items:
        cart.map(item => ({

            product_id:
            item.product_id,

            quantity:
            item.quantity

        }))

    };

    try{

        const response =
        await fetch(
            API_URL +
            "/api/sales",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json",

                    Authorization:
                    "Bearer " +
                    token
                },

                body:
                JSON.stringify(
                    payload
                )
            }
        );

        const data =
        await response.json();

        if(data.success){

            alert(
                "Invoice Created : " +
                data.invoice_no
            );

            cart = [];

            renderCart();

            loadSales();

        }
        else{

            alert(
                data.message
            );

        }

    }
    catch(error){

        console.error(error);

        alert(
            "Billing Failed"
        );

    }

}

// ======================
// LOAD SALES
// ======================

async function loadSales(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/sales",
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const sales =
        await response.json();

        renderSales(
            sales
        );

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// RENDER SALES
// ======================

function renderSales(sales){

    salesTable.innerHTML = "";

    sales.forEach(sale => {

        const badge =
        sale.payment_status ===
        "paid"
        ?
        "status-paid"
        :
        "status-pending";

        salesTable.innerHTML +=
        `
        <tr>

            <td>
                ${sale.id}
            </td>

            <td>
                ${sale.invoice_no}
            </td>

            <td>
                ${sale.customer_id}
            </td>

            <td>
                ₹${sale.total_amount}
            </td>

            <td>
                ${sale.payment_mode}
            </td>

            <td>
                <span class="${badge}">
                    ${sale.payment_status}
                </span>
            </td>

            <td>

            <button
                class="view-btn"
                onclick="viewInvoice(${sale.id})"
            >
                View
            </button>

                <button
            class="pdf-btn"
            onclick="downloadInvoice(${sale.id})"
        >
            DOWNLOAD
        </button>

            <button
                class="delete-sale-btn"
                onclick="deleteSale(${sale.id})"
            >
                Delete
            </button>

        </td>

        </tr>
        `;

    });

}
async function viewInvoice(id){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/sales/" +
            id,
            {
                headers:{
                    Authorization:
                    "Bearer " + token
                }
            }
        );

        const data =
        await response.json();

        const sale =
        data.sale;
const customer = data.customer;

        const items =
        data.items;

        let rows = "";

        items.forEach(item => {

            rows += `
            <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${item.total}</td>
            </tr>
            `;

        });

        const win =
        window.open(
            "",
            "_blank"
        );

        win.document.write(`
        <html>
        <head>
            <title>
                Invoice
            </title>
        <style>

        body{
            font-family:Arial;
            padding:20px;
        }

        table{
            width:100%;
            border-collapse:collapse;
        }

        th,td{
            border:1px solid #ddd;
            padding:8px;
        }

        /* PRINT BUTTON */

        .print-btn{
            background:#4f46e5;
            color:white;
            border:none;
            padding:12px 25px;
            border-radius:8px;
            cursor:pointer;
            font-size:14px;
            font-weight:600;
            margin-top:20px;
        }

        .print-btn:hover{
            background:#4338ca;
        }
        @media print{
            .print-btn{
                display:none;
            }

            body{
                padding:0;
            }
        }
        th{
            background:#4f46e5;
            color:white;
        }
            .print-btn{
            display:block;
            margin:20px auto;
        }
        </style>
                    
                </head>

                <body>
                <div style="text-align:center;">
                    <h1>Billing ERP</h1>
                    <h2>TAX INVOICE</h2>
                    <hr>
                </div>

                    <table style="margin-bottom:20px;">
        <tr>
            <td><b>Invoice No</b></td>
            <td>${sale.invoice_no}</td>
        </tr>
        <tr>
            <td><b>Customer ID</b></td>
            <td>${sale.customer_id}</td>
        </tr>

        <tr>
            <td><b>Customer Name</b></td>
            <td>${customer.name}</td>
        </tr>
        <tr>
            <td><b>Mobile</b></td>
            <td>${customer.mobile}</td>
        </tr>

        <tr>
            <td><b>Address</b></td>
            <td>${customer.address}</td>
        </tr>
        <tr>
            <td><b>Payment Mode</b></td>
            <td>${sale.payment_mode}</td>
        </tr>

        <tr>
            <td><b>Status</b></td>
            <td>${sale.payment_status}</td>
        </tr>
        <tr>
            <td><b>Date</b></td>
            <td>${sale.sale_date}</td>
        </tr>
        </table>
            <table>

                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>

                ${rows}

            </table>

            <h3>
                GST :
                ₹${sale.gst_amount}
            </h3>

            <h2>
                Grand Total :
                ₹${sale.total_amount}
            </h2>

            <button
                class="print-btn"
                onclick="window.print()"
            >
                🖨 Print Invoice
            </button>
                        <hr>

            <div style="text-align:center;margin-top:20px;">
                <h3>Thank You For Your Purchase</h3>
            </div>
                    </body>

        </html>
        `);

    }
    catch(error){

        console.error(error);

    }

}
async function downloadInvoice(id){

    window.open(
        API_URL +
        "/api/sales/pdf/" +
        id +
        "?token=" +
        token,
        "_blank"
    );

}
// ======================
// DELETE SALE
// ======================

async function deleteSale(id){

    if(
        !confirm(
            "Delete Sale ?"
        )
    ){
        return;
    }

    try{

        const response =
        await fetch(
            API_URL +
            "/api/sales/" +
            id,
            {
                method:"DELETE",

                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const data =
        await response.json();
        console.log(data);
        if(data.success){

            alert(
                data.message
            );

            loadSales();

        }

    }
    catch(error){

        console.error(error);

    }

}
async function onScanSuccess(decodedText){

    const response = await fetch(
        API_URL +
        "/api/products/barcode/" +
        decodedText,
        {
            headers:{
                Authorization:
                "Bearer " + token
            }
        }
    );

    const data = await response.json();
    const sale = data.sale;
    const customer = data.customer;
    const items = data.items;

    if(!data.success){
        alert("Product Not Found");
        return;
    }

    const product = data.product;

    const existing =
    cart.find(
        item =>
        item.product_id === product.id
    );

    if(existing){
        existing.quantity++;
    }
    else{

        cart.push({
            product_id: product.id,
            product_name: product.product_name,
            price: Number(product.selling_price),
            gst: Number(product.gst_percent),
            quantity: 1
        });

    }

    renderCart();
}

// ======================
// INIT
// ======================

(async function(){

    await loadCustomers();

    await loadProducts();

    await loadSales();

})();