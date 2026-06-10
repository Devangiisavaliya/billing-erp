
const API_URL = "http://127.0.0.1:5000";

const token =
localStorage.getItem("token");

if (!token) {
    window.location.href =
    "/login";
}

// ======================
// ELEMENTS
// ======================

const tableBody =
document.getElementById(
    "productTable"
);

const modal =
document.getElementById(
    "productModal"
);

const form =
document.getElementById(
    "productForm"
);

const searchInput =
document.getElementById(
    "searchInput"
);

const categoryDropdown =
document.getElementById(
    "category_id"
);

const productCount =
document.getElementById(
    "productCount"
);

const totalStock =
document.getElementById(
    "totalStock"
);

const lowStockCount =
document.getElementById(
    "lowStockCount"
);

// ======================
// LOAD CATEGORIES
// ======================

async function loadCategories() {

    try {

        const response =
        await fetch(
            API_URL +
            "/api/categories",
            {
                headers: {
                    Authorization:
                    "Bearer " + token
                }
            }
        );

        const categories =
        await response.json();

        categoryDropdown.innerHTML =
        `
        <option value="">
            Select Category
        </option>
        `;

        categories.forEach(
            category => {

            categoryDropdown.innerHTML +=
            `
            <option value="${category.id}">
                ${category.category_name}
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

async function loadProducts() {

    try {

        const response =
        await fetch(
            API_URL +
            "/api/products",
            {
                headers: {
                    Authorization:
                    "Bearer " + token
                }
            }
        );

        const products =
        await response.json();

        renderProducts(
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

    productCount.innerText =
    products.length;

    let stock = 0;

    let lowStock = 0;

    products.forEach(product => {

        stock +=
        parseInt(
            product.stock_qty || 0
        );

        if(
            parseInt(product.stock_qty || 0)
            <=
            parseInt(product.low_stock_limit || 0)
        ){
            lowStock++;
        }
        setTimeout(() => {

    if(product.barcode){

        JsBarcode(
            `#barcode-${product.id}`,
            product.barcode,
            {
                format:"CODE128",
                width:1,
                height:35,
                displayValue:false
            }
        );

    }

},100);
    });

    totalStock.innerText =
    stock;

    lowStockCount.innerText =
    lowStock;

}

// ======================
// RENDER PRODUCTS
// ======================

function renderProducts(products){

    tableBody.innerHTML = "";

    products.forEach(product => {

        const stockClass =
        Number(product.stock_qty) <=
        Number(product.low_stock_limit)
        ?
        "low-stock"
        :
        "good-stock";

        tableBody.innerHTML += `

        <tr>

            <td>
                ${product.id}
            </td>

            <td>
                ${product.product_name}
            </td>

            <td>
                ${product.product_code || ""}
            </td>

            <td>
                ${product.barcode || ""}
            </td>

            <td>
                <svg
                    id="barcode-${product.id}"
                ></svg>
            </td>
            <td>
                ${product.category_id}
            </td>

            <td>
                ${product.hsn_code || ""}
            </td>

            <td>
                ₹${product.purchase_price || 0}
            </td>

            <td>
                ₹${product.selling_price || 0}
            </td>

            <td>
                ${product.gst_percent || 0}%
            </td>

            <td class="${stockClass}">
                ${product.stock_qty || 0}
            </td>

            <td>
                ${product.low_stock_limit || 0}
            </td>

            <td>

    <button
        class="action-btn edit-btn"
        onclick="editProduct(${product.id})"
    >
        Edit
    </button>

    <button
        class="action-btn delete-btn"
        onclick="deleteProduct(${product.id})"
    >
        Delete
    </button>

    <button
        class="action-btn"
        onclick="
            printBarcode(
                '${product.barcode}',
            )
        "
    >
        Print
    </button>

</td>

        </tr>

        `;

    });

}
// ======================
// OPEN MODAL
// ======================
document
.getElementById(
    "addProductBtn"
)
.addEventListener(
    "click",
    () => {

    form.reset();

    const barcode =
    generateBarcode();

    document.getElementById(
        "barcode"
    ).value =
    barcode;

    document.getElementById(
        "productId"
    ).value = "";

    document.getElementById(
        "modalTitle"
    ).innerText =
    "Add Product";

    modal.style.display =
    "flex";

    setTimeout(() => {

        JsBarcode(
            "#barcodeSticker",
            barcode,
            {
                format: "CODE128",
                width: 2,
                height: 60,
                displayValue: true
            }
        );

    }, 100);

});
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
function generateBarcode(){

    return (
        Date.now().toString() +
        Math.floor(
            Math.random() * 1000
        )
    );

}
// ======================
// SAVE PRODUCT
// ======================

form.addEventListener(
    "submit",
    async function(e){

    e.preventDefault();

    const id =
    document.getElementById(
        "productId"
    ).value;
    const barcodeValue =
document.getElementById(
    "barcode"
).value
||
generateBarcode();
    const payload = {

        product_code:
        document.getElementById(
            "product_code"
        ).value,

        barcode:
        barcodeValue,

        product_name:
        document.getElementById(
            "product_name"
        ).value,

        category_id:
        document.getElementById(
            "category_id"
        ).value,

        hsn_code:
        document.getElementById(
            "hsn_code"
        ).value,

        purchase_price:
        document.getElementById(
            "purchase_price"
        ).value,

        selling_price:
        document.getElementById(
            "selling_price"
        ).value,

        gst_percent:
        document.getElementById(
            "gst_percent"
        ).value,

        stock_qty:
        document.getElementById(
            "stock_qty"
        ).value,

        low_stock_limit:
        document.getElementById(
            "low_stock_limit"
        ).value

    };

    let url =
    API_URL +
    "/api/products";

    let method =
    "POST";

    if(id){

        url =
        API_URL +
        "/api/products/" +
        id;

        method =
        "PUT";

    }

    try{

        const response =
        await fetch(
            url,
            {
                method,

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
                "Product Saved Successfully"
            );

            modal.style.display =
            "none";

            loadProducts();

        }

    }
    catch(error){

        console.error(error);

        alert(
            "Save Failed"
        );

    }

});

// ======================
// EDIT PRODUCT
// ======================

async function editProduct(id){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/products/" +
            id,
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const product =
        await response.json();

        document.getElementById(
            "productId"
        ).value =
        product.id;

        document.getElementById(
            "product_code"
        ).value =
        product.product_code || "";

        document.getElementById(
            "barcode"
        ).value =
        product.barcode || "";
                JsBarcode(
            "#barcodeSticker",
            document.getElementById(
                "barcode"
            ).value,
            {
                format: "CODE128",
                width: 2,
                height: 60,
                displayValue: true
            }
        );
        document.getElementById(
            "product_name"
        ).value =
        product.product_name || "";

        document.getElementById(
            "category_id"
        ).value =
        product.category_id || "";

        document.getElementById(
            "hsn_code"
        ).value =
        product.hsn_code || "";

        document.getElementById(
            "purchase_price"
        ).value =
        product.purchase_price || "";

        document.getElementById(
            "selling_price"
        ).value =
        product.selling_price || "";

        document.getElementById(
            "gst_percent"
        ).value =
        product.gst_percent || "";

        document.getElementById(
            "stock_qty"
        ).value =
        product.stock_qty || "";

        document.getElementById(
            "low_stock_limit"
        ).value =
        product.low_stock_limit || "";

        document.getElementById(
            "modalTitle"
        ).innerText =
        "Edit Product";

        modal.style.display =
        "flex";

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// DELETE PRODUCT
// ======================

async function deleteProduct(id){

    const confirmDelete =
    confirm(
        "Delete Product?"
    );

    if(!confirmDelete){
        return;
    }

    try{

        const response =
        await fetch(
            API_URL +
            "/api/products/" +
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

            alert(
                "Product Deleted Successfully"
            );

            loadProducts();

        }

    }
    catch(error){

        console.error(error);

        alert(
            "Delete Failed"
        );

    }

}

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
            "/api/products",
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
            .includes(keyword)

            ||

            (product.barcode || "")
            .includes(keyword)

            ||

            (product.product_code || "")
            .toLowerCase()
            .includes(keyword)
        );

        renderProducts(
            filtered
        );

    }
    catch(error){

        console.error(error);

    }

});

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
function printBarcode(
    
    barcode,

){

    const win =
    window.open(
        "",
        "_blank"
    );

    win.document.write(`
        <html>

        <head>
            <title>Barcode Sticker</title>

            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>

        </head>

        <body
            style="
                text-align:center;
                font-family:Arial;
                padding:20px;
            "
        >
            <svg id="printBarcode"></svg>

            <p>${barcode}</p>


            <script>

                window.onload = function(){

                    JsBarcode(
                        "#printBarcode",
                        "${barcode}",
                        {
                            format:"CODE128",
                            width:2,
                            height:70,
                            displayValue:false
                        }
                    );

                    setTimeout(
                        function(){
                            window.print();
                        },
                        500
                    );

                };

            <\/script>

        </body>

        </html>
    `);

    win.document.close();

}
// ======================
// INIT
// ======================

loadCategories();
loadProducts();

