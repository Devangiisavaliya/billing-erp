
const API_URL = "http://127.0.0.1:5000";

const token =
localStorage.getItem(
    "token"
);

if (!token) {

    window.location.href =
    "/login";

}

// ======================
// ELEMENTS
// ======================

const tableBody =
document.getElementById(
    "supplierTable"
);

const modal =
document.getElementById(
    "supplierModal"
);

const form =
document.getElementById(
    "supplierForm"
);

const searchInput =
document.getElementById(
    "searchInput"
);

const supplierCount =
document.getElementById(
    "supplierCount"
);

const activeSuppliers =
document.getElementById(
    "activeSuppliers"
);

const gstSuppliers =
document.getElementById(
    "gstSuppliers"
);

// ======================
// LOAD SUPPLIERS
// ======================

async function loadSuppliers() {

    try {

        const response =
        await fetch(
            API_URL +
            "/api/suppliers",
            {
                headers: {
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const suppliers =
        await response.json();

        renderSuppliers(
            suppliers
        );

        updateCards(
            suppliers
        );

    }
    catch(error){

        console.error(
            error
        );

    }

}

// ======================
// UPDATE CARDS
// ======================

function updateCards(
    suppliers
){

    supplierCount.innerText =
    suppliers.length;

    activeSuppliers.innerText =
    suppliers.length;

    const gstCount =
    suppliers.filter(
        supplier =>
        supplier.gst_number &&
        supplier.gst_number.trim() !== ""
    ).length;

    gstSuppliers.innerText =
    gstCount;

}

// ======================
// RENDER SUPPLIERS
// ======================

function renderSuppliers(
    suppliers
){

    tableBody.innerHTML = "";

    suppliers.forEach(
        supplier => {

        tableBody.innerHTML += `

        <tr>

            <td>
                ${supplier.id}
            </td>

            <td>
                ${supplier.supplier_name || ""}
            </td>

            <td>
                ${supplier.contact_person || ""}
            </td>

            <td>
                ${supplier.mobile || ""}
            </td>

            <td>
                ${supplier.email || ""}
            </td>

            <td>
                ${supplier.address || ""}
            </td>

            <td>
                ${supplier.gst_number || ""}
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editSupplier(${supplier.id})"
                >
                    Edit
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteSupplier(${supplier.id})"
                >
                    Delete
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
    "addSupplierBtn"
)
.addEventListener(
    "click",
    () => {

    form.reset();

    document.getElementById(
        "supplierId"
    ).value = "";

    document.getElementById(
        "modalTitle"
    ).innerText =
    "Add Supplier";

    modal.style.display =
    "flex";

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

// ======================
// SAVE SUPPLIER
// ======================

form.addEventListener(
    "submit",
    async function(e){

    e.preventDefault();

    const id =
    document.getElementById(
        "supplierId"
    ).value;

    const payload = {

        supplier_name:
        document.getElementById(
            "supplier_name"
        ).value,

        contact_person:
        document.getElementById(
            "contact_person"
        ).value,

        mobile:
        document.getElementById(
            "mobile"
        ).value,

        email:
        document.getElementById(
            "email"
        ).value,

        address:
        document.getElementById(
            "address"
        ).value,

        gst_number:
        document.getElementById(
            "gst_number"
        ).value

    };

    let url =
    API_URL +
    "/api/suppliers";

    let method =
    "POST";

    if(id){

        url =
        API_URL +
        "/api/suppliers/" +
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
                "Supplier Saved Successfully"
            );

            modal.style.display =
            "none";

            loadSuppliers();

        }

    }
    catch(error){

        console.error(
            error
        );

        alert(
            "Save Failed"
        );

    }

});

// ======================
// EDIT SUPPLIER
// ======================

async function editSupplier(id){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/suppliers/" +
            id,
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const supplier =
        await response.json();

        document.getElementById(
            "supplierId"
        ).value =
        supplier.id;

        document.getElementById(
            "supplier_name"
        ).value =
        supplier.supplier_name || "";

        document.getElementById(
            "contact_person"
        ).value =
        supplier.contact_person || "";

        document.getElementById(
            "mobile"
        ).value =
        supplier.mobile || "";

        document.getElementById(
            "email"
        ).value =
        supplier.email || "";

        document.getElementById(
            "address"
        ).value =
        supplier.address || "";

        document.getElementById(
            "gst_number"
        ).value =
        supplier.gst_number || "";

        document.getElementById(
            "modalTitle"
        ).innerText =
        "Edit Supplier";

        modal.style.display =
        "flex";

    }
    catch(error){

        console.error(
            error
        );

    }

}

// ======================
// DELETE SUPPLIER
// ======================

async function deleteSupplier(id){

    const confirmDelete =
    confirm(
        "Delete Supplier?"
    );

    if(!confirmDelete){
        return;
    }

    try{

        const response =
        await fetch(
            API_URL +
            "/api/suppliers/" +
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
                "Supplier Deleted Successfully"
            );

            loadSuppliers();

        }

    }
    catch(error){

        console.error(
            error
        );

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
            "/api/suppliers",
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const suppliers =
        await response.json();

        const filtered =
        suppliers.filter(
            supplier =>

            (supplier.supplier_name || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (supplier.contact_person || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (supplier.mobile || "")
            .includes(keyword)

            ||

            (supplier.email || "")
            .toLowerCase()
            .includes(keyword)
        );

        renderSuppliers(
            filtered
        );

    }
    catch(error){

        console.error(
            error
        );

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

// ======================
// INIT
// ======================

loadSuppliers();