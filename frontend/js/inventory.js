
const API_URL = "http://127.0.0.1:5000";

const token =
localStorage.getItem("token");

if (!token) {
    window.location.href = "/login";
}

// ======================
// ELEMENTS
// ======================

const inventoryTable =
document.getElementById(
    "inventoryTable"
);

const searchInput =
document.getElementById(
    "searchInput"
);

const modal =
document.getElementById(
    "stockModal"
);

const quantityInput =
document.getElementById(
    "quantity"
);

const productIdInput =
document.getElementById(
    "productId"
);

const modalTitle =
document.getElementById(
    "modalTitle"
);

const totalProducts =
document.getElementById(
    "totalProducts"
);

const totalStock =
document.getElementById(
    "totalStock"
);

const lowStockCount =
document.getElementById(
    "lowStockCount"
);

const outOfStockCount =
document.getElementById(
    "outOfStockCount"
);

let currentAction =
"stock-in";

// ======================
// LOAD INVENTORY
// ======================

async function loadInventory(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/inventory/stock",
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const products =
        await response.json();

        renderInventory(
            products
        );

        updateCards(
            products
        );

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// UPDATE CARDS
// ======================

function updateCards(products){

    totalProducts.innerText =
    products.length;

    let stockQty = 0;

    let lowStock = 0;

    let outStock = 0;

    products.forEach(product => {

        stockQty +=
        Number(
            product.stock_qty || 0
        );

        if(
            Number(product.stock_qty)
            === 0
        ){
            outStock++;
        }

        if(
            Number(product.stock_qty)
            <=
            Number(product.low_stock_limit)
        ){
            lowStock++;
        }

    });

    totalStock.innerText =
    stockQty;

    lowStockCount.innerText =
    lowStock;

    outOfStockCount.innerText =
    outStock;

}

// ======================
// RENDER INVENTORY
// ======================

function renderInventory(products){

    inventoryTable.innerHTML = "";

    products.forEach(product => {

        let statusClass =
        "status-good";

        let statusText =
        "In Stock";

        if(
            Number(product.stock_qty)
            === 0
        ){

            statusClass =
            "status-out";

            statusText =
            "Out Of Stock";

        }
        else if(
            Number(product.stock_qty)
            <=
            Number(product.low_stock_limit)
        ){

            statusClass =
            "status-low";

            statusText =
            "Low Stock";

        }

        inventoryTable.innerHTML +=
        `
        <tr>

            <td>
                ${product.id}
            </td>

            <td>
                ${product.product_name}
            </td>

            <td>
                ${product.stock_qty}
            </td>

            <td>
                ${product.low_stock_limit}
            </td>

            <td>

                <span class="${statusClass}">
                    ${statusText}
                </span>

            </td>

            <td>

                <button
                    class="stock-in-btn"
                    onclick="openStockModal(
                        ${product.id},
                        'stock-in'
                    )"
                >
                    Stock In
                </button>

                <button
                    class="stock-out-btn"
                    onclick="openStockModal(
                        ${product.id},
                        'stock-out'
                    )"
                >
                    Stock Out
                </button>

            </td>

        </tr>
        `;

    });

}

// ======================
// OPEN MODAL
// ======================

function openStockModal(
    productId,
    action
){

    currentAction =
    action;

    productIdInput.value =
    productId;

    quantityInput.value =
    "";

    if(
        action ===
        "stock-in"
    ){

        modalTitle.innerText =
        "Stock In";

    }
    else{

        modalTitle.innerText =
        "Stock Out";

    }

    modal.style.display =
    "flex";

}

// ======================
// CLOSE MODAL
// ======================

document
.getElementById(
    "closeModal"
)
.addEventListener(
    "click",
    () => {

    modal.style.display =
    "none";

});

// ======================
// SAVE STOCK
// ======================

document
.getElementById(
    "saveStockBtn"
)
.addEventListener(
    "click",
    async function(){

    const productId =
    Number(
        productIdInput.value
    );

    const quantity =
    Number(
        quantityInput.value
    );

    if(
        !quantity ||
        quantity <= 0
    ){

        alert(
            "Enter Valid Quantity"
        );

        return;
    }

    let endpoint =
    "/api/inventory/stock-in";

    if(
        currentAction ===
        "stock-out"
    ){

        endpoint =
        "/api/inventory/stock-out";

    }

    try{

        const response =
        await fetch(
            API_URL +
            endpoint,
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
                JSON.stringify({
                    product_id:
                    productId,

                    quantity:
                    quantity
                })
            }
        );

        const data =
        await response.json();

        if(data.success){

            alert(
                data.message
            );

            modal.style.display =
            "none";

            loadInventory();

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
            "Stock Update Failed"
        );

    }

});

// ======================
// SEARCH
// ======================

searchInput.addEventListener(
    "keyup",
    async function(){

    const keyword =
    this.value
    .toLowerCase();

    try{

        const response =
        await fetch(
            API_URL +
            "/api/inventory/stock",
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const products =
        await response.json();

        const filtered =
        products.filter(
            product =>

            product.product_name
            .toLowerCase()
            .includes(
                keyword
            )
        );

        renderInventory(
            filtered
        );

    }
    catch(error){

        console.error(error);

    }

});

// ======================
// REFRESH BUTTON
// ======================

document
.getElementById(
    "refreshBtn"
)
.addEventListener(
    "click",
    loadInventory
);

// ======================
// CLOSE MODAL OUTSIDE
// ======================

window.addEventListener(
    "click",
    function(e){

    if(
        e.target === modal
    ){

        modal.style.display =
        "none";

    }

});

// ======================
// INIT
// ======================

loadInventory();