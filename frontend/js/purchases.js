
const API_URL = "http://127.0.0.1:5000";

const token =
localStorage.getItem("token");

if (!token) {
    window.location.href = "/login";
}

// ======================
// ELEMENTS
// ======================

const supplierSelect =
document.getElementById(
    "supplier_id"
);

const purchaseTable =
document.getElementById(
    "purchaseTable"
);

const purchaseItemsBody =
document.getElementById(
    "purchaseItemsBody"
);

const purchaseCount =
document.getElementById(
    "purchaseCount"
);

const purchaseAmount =
document.getElementById(
    "purchaseAmount"
);

const pendingPurchases =
document.getElementById(
    "pendingPurchases"
);

let products = [];

// ======================
// LOAD SUPPLIERS
// ======================

async function loadSuppliers(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/suppliers",
            {
                headers:{
                    Authorization:
                    "Bearer " + token
                }
            }
        );

        const suppliers =
        await response.json();

        supplierSelect.innerHTML =
        `
        <option value="">
        Select Supplier
        </option>
        `;

        suppliers.forEach(
            supplier => {

            supplierSelect.innerHTML +=
            `
            <option value="${supplier.id}">
                ${supplier.supplier_name}
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

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// PRODUCT DROPDOWN
// ======================

function getProductOptions(){

    let options =
    `<option value="">
        Select Product
    </option>`;

    products.forEach(
        product => {

        options +=
        `
        <option value="${product.id}">
            ${product.product_name}
        </option>
        `;

    });

    return options;

}

// ======================
// ADD ROW
// ======================

function addProductRow(){

    purchaseItemsBody.innerHTML +=
    `
    <tr>

        <td>
            <select
                class="product-select"
            >
                ${getProductOptions()}
            </select>
        </td>

        <td>
            <input
                type="number"
                class="qty"
                value="1"
                min="1"
            >
        </td>

        <td>
            <input
                type="number"
                class="price"
                value="0"
                step="0.01"
            >
        </td>

        <td>
            <input
                type="number"
                class="line-total"
                value="0"
                readonly
            >
        </td>

        <td>

            <button
                class="remove-btn"
                onclick="removeRow(this)"
            >
                Remove
            </button>

        </td>

    </tr>
    `;

    calculateTotals();

}

// ======================
// REMOVE ROW
// ======================

function removeRow(btn){

    btn.closest("tr").remove();

    calculateTotals();

}

// ======================
// AUTO CALCULATE
// ======================

document.addEventListener(
    "input",
    function(e){

    if(
        e.target.classList.contains("qty")
        ||
        e.target.classList.contains("price")
    ){

        const row =
        e.target.closest("tr");

        const qty =
        parseFloat(
            row.querySelector(".qty").value
        ) || 0;

        const price =
        parseFloat(
            row.querySelector(".price").value
        ) || 0;

        row.querySelector(
            ".line-total"
        ).value =
        (qty * price)
        .toFixed(2);

        calculateTotals();

    }

});

// ======================
// TOTALS
// ======================

function calculateTotals(){

    let subtotal = 0;

    document
    .querySelectorAll(
        ".line-total"
    )
    .forEach(input => {

        subtotal +=
        parseFloat(
            input.value
        ) || 0;

    });

    const gst =
    subtotal * 0.18;

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
// ADD ROW BUTTON
// ======================

document
.getElementById(
    "addRowBtn"
)
.addEventListener(
    "click",
    addProductRow
);

// ======================
// SAVE PURCHASE
// ======================

document
.getElementById(
    "savePurchaseBtn"
)
.addEventListener(
    "click",
    async function(){

    const items = [];

    document
    .querySelectorAll(
        "#purchaseItemsBody tr"
    )
    .forEach(row => {

        const product_id =
        row.querySelector(
            ".product-select"
        ).value;

        const quantity =
        row.querySelector(
            ".qty"
        ).value;

        const price =
        row.querySelector(
            ".price"
        ).value;

        const total =
        row.querySelector(
            ".line-total"
        ).value;

        if(product_id){

            items.push({

                product_id:
                Number(product_id),

                quantity:
                Number(quantity),

                price:
                Number(price),

                total:
                Number(total)

            });

        }

    });

    const subtotal =
    parseFloat(
        document
        .getElementById(
            "subtotal"
        )
        .innerText
        .replace("₹","")
    );

    const gst =
    parseFloat(
        document
        .getElementById(
            "gstAmount"
        )
        .innerText
        .replace("₹","")
    );

    const grand =
    parseFloat(
        document
        .getElementById(
            "grandTotal"
        )
        .innerText
        .replace("₹","")
    );

    const payload = {

        purchase_no:
        document.getElementById(
            "purchase_no"
        ).value,

        supplier_id:
        Number(
            document.getElementById(
                "supplier_id"
            ).value
        ),

        purchase_date:
        document.getElementById(
            "purchase_date"
        ).value,

        subtotal:
        subtotal,

        gst_amount:
        gst,

        total_amount:
        grand,

        payment_status:
        document.getElementById(
            "payment_status"
        ).value,

        items:
        items

    };

    try{

        const response =
        await fetch(
            API_URL +
            "/api/purchases",
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
                "Purchase Saved Successfully"
            );

            location.reload();

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
            "Purchase Save Failed"
        );

    }

});

// ======================
// LOAD PURCHASES
// ======================

async function loadPurchases(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/purchases",
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const purchases =
        await response.json();

        renderPurchases(
            purchases
        );

        updateCards(
            purchases
        );

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// CARDS
// ======================

function updateCards(
    purchases
){

    purchaseCount.innerText =
    purchases.length;

    let amount = 0;

    let pending = 0;

    purchases.forEach(
        purchase => {

        amount +=
        Number(
            purchase.total_amount || 0
        );

        if(
            purchase.payment_status
            ===
            "pending"
        ){
            pending++;
        }

    });

    purchaseAmount.innerText =
    "₹" +
    amount.toFixed(2);

    pendingPurchases.innerText =
    pending;

}

// ======================
// RENDER PURCHASES
// ======================

function renderPurchases(
    purchases
){

    purchaseTable.innerHTML = "";

    purchases.forEach(
        purchase => {

        const badge =
        purchase.payment_status
        ===
        "paid"
        ?
        "status-paid"
        :
        "status-pending";

        purchaseTable.innerHTML +=
        `
        <tr>

            <td>
                ${purchase.id}
            </td>

            <td>
                ${purchase.purchase_no}
            </td>

            <td>
                ${purchase.supplier_id}
            </td>

            <td>
                ${purchase.purchase_date}
            </td>

            <td>
                ₹${purchase.total_amount}
            </td>

            <td>
                <span class="${badge}">
                    ${purchase.payment_status}
                </span>
            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deletePurchase(${purchase.id})"
                >
                    Delete
                </button>

            </td>

        </tr>
        `;

    });

}

// ======================
// DELETE PURCHASE
// ======================

async function deletePurchase(id){

    if(
        !confirm(
            "Delete Purchase?"
        )
    ){
        return;
    }

    try{

        const response =
        await fetch(
            API_URL +
            "/api/purchases/" +
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

        if(data.success){

            loadPurchases();

        }

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// INIT
// ======================

(async function(){

    await loadProducts();

    await loadSuppliers();

    addProductRow();

    loadPurchases();

})();
