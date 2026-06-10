
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
    "categoryTable"
);

const modal =
document.getElementById(
    "categoryModal"
);

const form =
document.getElementById(
    "categoryForm"
);

const searchInput =
document.getElementById(
    "searchInput"
);

const categoryCount =
document.getElementById(
    "categoryCount"
);

const activeCategories =
document.getElementById(
    "activeCategories"
);

const productGroups =
document.getElementById(
    "productGroups"
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
                    "Bearer " +
                    token
                }
            }
        );

        const categories =
        await response.json();

        renderCategories(
            categories
        );

        updateCards(
            categories
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
    categories
){

    categoryCount.innerText =
    categories.length;

    activeCategories.innerText =
    categories.length;

    productGroups.innerText =
    categories.length;

}

// ======================
// RENDER TABLE
// ======================

function renderCategories(
    categories
){

    tableBody.innerHTML = "";

    categories.forEach(
        category => {

        tableBody.innerHTML += `

        <tr>

            <td>
                ${category.id}
            </td>

            <td>
                ${category.category_name}
            </td>

            <td>
                ${category.description || ""}
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editCategory(${category.id})"
                >
                    Edit
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteCategory(${category.id})"
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
    "addCategoryBtn"
)
.addEventListener(
    "click",
    () => {

    form.reset();

    document.getElementById(
        "categoryId"
    ).value = "";

    document.getElementById(
        "modalTitle"
    ).innerText =
    "Add Category";

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
// SAVE CATEGORY
// ======================

form.addEventListener(
    "submit",
    async function(e){

    e.preventDefault();

    const id =
    document.getElementById(
        "categoryId"
    ).value;

    const payload = {

        category_name:
        document.getElementById(
            "category_name"
        ).value,

        description:
        document.getElementById(
            "description"
        ).value

    };

    let url =
    API_URL +
    "/api/categories";

    let method =
    "POST";

    if(id){

        url =
        API_URL +
        "/api/categories/" +
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
                "Category Saved Successfully"
            );

            modal.style.display =
            "none";

            loadCategories();

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
// EDIT CATEGORY
// ======================

async function editCategory(id){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/categories/" +
            id,
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const category =
        await response.json();

        document.getElementById(
            "categoryId"
        ).value =
        category.id;

        document.getElementById(
            "category_name"
        ).value =
        category.category_name;

        document.getElementById(
            "description"
        ).value =
        category.description || "";

        document.getElementById(
            "modalTitle"
        ).innerText =
        "Edit Category";

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
// DELETE CATEGORY
// ======================

async function deleteCategory(id){

    const confirmDelete =
    confirm(
        "Are you sure you want to delete this category?"
    );

    if(!confirmDelete){
        return;
    }

    try{

        const response =
        await fetch(
            API_URL +
            "/api/categories/" +
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
                "Category Deleted Successfully"
            );

            loadCategories();

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
            "/api/categories",
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const categories =
        await response.json();

        const filtered =
        categories.filter(
            category =>

            category.category_name
            .toLowerCase()
            .includes(
                keyword
            )

            ||

            (category.description || "")
            .toLowerCase()
            .includes(
                keyword
            )
        );

        renderCategories(
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

loadCategories();
