
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
    "customerTable"
);

const modal =
document.getElementById(
    "customerModal"
);

const form =
document.getElementById(
    "customerForm"
);

const searchInput =
document.getElementById(
    "searchInput"
);

const customerCount =
document.getElementById(
    "customerCount"
);

const activeCustomers =
document.getElementById(
    "activeCustomers"
);

const totalOutstanding =
document.getElementById(
    "totalOutstanding"
);

// ======================
// LOAD CUSTOMERS
// ======================

async function loadCustomers() {

    try {

        const response =
        await fetch(
            API_URL +
            "/api/customers",
            {
                headers: {
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const customers =
        await response.json();

        renderCustomers(
            customers
        );

        updateCards(
            customers
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
    customers
){

    customerCount.innerText =
    customers.length;

    activeCustomers.innerText =
    customers.length;

    const total =
    customers.reduce(
        (
            sum,
            customer
        ) => {

            return (
                sum +
                parseFloat(
                    customer.outstanding_balance || 0
                )
            );

        },
        0
    );

    totalOutstanding.innerText =
    "₹" +
    total.toLocaleString();

}

// ======================
// RENDER CUSTOMERS
// ======================

function renderCustomers(
    customers
){

    tableBody.innerHTML = "";

    customers.forEach(
        customer => {

        tableBody.innerHTML += `

        <tr>

            <td>
                ${customer.id}
            </td>

            <td>
                ${customer.customer_name}
            </td>

            <td>
                ${customer.mobile || ""}
            </td>

            <td>
                ${customer.email || ""}
            </td>

            <td>
                ${customer.address || ""}
            </td>

            <td>
                ${customer.gst_number || ""}
            </td>

            <td>
                ₹${customer.outstanding_balance || 0}
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editCustomer(${customer.id})"
                >
                    Edit
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteCustomer(${customer.id})"
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
    "addCustomerBtn"
)
.addEventListener(
    "click",
    () => {

    form.reset();

    document.getElementById(
        "customerId"
    ).value = "";

    document.getElementById(
        "modalTitle"
    ).innerText =
    "Add Customer";

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
// SAVE CUSTOMER
// ======================

form.addEventListener(
    "submit",
    async function(e){

    e.preventDefault();

    const id =
    document.getElementById(
        "customerId"
    ).value;

    const payload = {

        customer_name:
        document.getElementById(
            "customer_name"
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
    "/api/customers";

    let method =
    "POST";

    if(id){

        url =
        API_URL +
        "/api/customers/" +
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
                "Customer Saved Successfully"
            );

            modal.style.display =
            "none";

            loadCustomers();

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
// EDIT CUSTOMER
// ======================

async function editCustomer(id){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/customers/" +
            id,
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const customer =
        await response.json();

        document.getElementById(
            "customerId"
        ).value =
        customer.id;

        document.getElementById(
            "customer_name"
        ).value =
        customer.customer_name;

        document.getElementById(
            "mobile"
        ).value =
        customer.mobile || "";

        document.getElementById(
            "email"
        ).value =
        customer.email || "";

        document.getElementById(
            "address"
        ).value =
        customer.address || "";

        document.getElementById(
            "gst_number"
        ).value =
        customer.gst_number || "";

        document.getElementById(
            "modalTitle"
        ).innerText =
        "Edit Customer";

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
// DELETE CUSTOMER
// ======================

async function deleteCustomer(id){

    const confirmDelete =
    confirm(
        "Are you sure you want to delete this customer?"
    );

    if(!confirmDelete){
        return;
    }

    try{

        const response =
        await fetch(
            API_URL +
            "/api/customers/" +
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
                "Customer Deleted Successfully"
            );

            loadCustomers();

        }
        else{

            alert(
                data.message
            );

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
            "/api/customers",
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const customers =
        await response.json();

        const filtered =
        customers.filter(
            customer =>

            customer.customer_name
            .toLowerCase()
            .includes(
                keyword
            )

            ||

            (customer.mobile || "")
            .includes(
                keyword
            )

            ||

            (customer.email || "")
            .toLowerCase()
            .includes(
                keyword
            )
        );

        renderCustomers(
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
// CLOSE MODAL CLICK OUTSIDE
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

loadCustomers();