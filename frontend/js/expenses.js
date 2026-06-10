const API_URL = "http://127.0.0.1:5000";

const token =
localStorage.getItem("token");

if(!token){
    window.location.href = "/login";
}

// ======================
// ELEMENTS
// ======================

const expenseTable =
document.getElementById(
    "expenseTable"
);

const modal =
document.getElementById(
    "expenseModal"
);

const form =
document.getElementById(
    "expenseForm"
);

const searchInput =
document.getElementById(
    "searchInput"
);

let allExpenses = [];

// ======================
// LOAD EXPENSES
// ======================

async function loadExpenses(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/expenses",
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const expenses =
        await response.json();

        allExpenses =
        expenses;

        renderExpenses(
            expenses
        );

        updateStats(
            expenses
        );

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// MONTHLY REPORT
// ======================

async function loadMonthlyReport(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/expenses/monthly-report",
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const data =
        await response.json();

        document.getElementById(
            "monthlyExpense"
        ).innerText =
        "₹" +
        Number(
            data.total_expense || 0
        ).toFixed(2);

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// UPDATE STATS
// ======================

function updateStats(expenses){

    let total = 0;

    expenses.forEach(expense => {

        total +=
        Number(
            expense.amount || 0
        );

    });

    document.getElementById(
        "totalExpense"
    ).innerText =
    "₹" +
    total.toFixed(2);

    document.getElementById(
        "expenseCount"
    ).innerText =
    expenses.length;

}

// ======================
// RENDER TABLE
// ======================

function renderExpenses(expenses){

    expenseTable.innerHTML = "";

    expenses.forEach(expense => {

        expenseTable.innerHTML +=
        `
        <tr>

            <td>
                ${expense.id}
            </td>

            <td>
                ${expense.expense_name}
            </td>

            <td>
                ${expense.expense_category}
            </td>

            <td>
                ₹${expense.amount}
            </td>

            <td>
                ${expense.expense_date}
            </td>

            <td>
                ${expense.notes || ""}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editExpense(${expense.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})"
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
    "addExpenseBtn"
)
.addEventListener(
    "click",
    () => {

    document.getElementById(
        "modalTitle"
    ).innerText =
    "Add Expense";

    form.reset();

    document.getElementById(
        "expenseId"
    ).value = "";

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
// SAVE EXPENSE
// ======================

form.addEventListener(
    "submit",
    async function(e){

    e.preventDefault();

    const expenseId =
    document.getElementById(
        "expenseId"
    ).value;

    const payload = {

        expense_name:
        document.getElementById(
            "expense_name"
        ).value,

        expense_category:
        document.getElementById(
            "expense_category"
        ).value,

        amount:
        document.getElementById(
            "amount"
        ).value,

        expense_date:
        document.getElementById(
            "expense_date"
        ).value,

        notes:
        document.getElementById(
            "notes"
        ).value

    };

    let url =
    API_URL +
    "/api/expenses";

    let method =
    "POST";

    if(expenseId){

        url =
        API_URL +
        "/api/expenses/" +
        expenseId;

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
                data.message
            );

            modal.style.display =
            "none";

            loadExpenses();

            loadMonthlyReport();

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
            "Save Failed"
        );

    }

});

// ======================
// EDIT EXPENSE
// ======================

async function editExpense(id){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/expenses/" +
            id,
            {
                headers:{
                    Authorization:
                    "Bearer " +
                    token
                }
            }
        );

        const expense =
        await response.json();

        document.getElementById(
            "expenseId"
        ).value =
        expense.id;

        document.getElementById(
            "expense_name"
        ).value =
        expense.expense_name || "";

        document.getElementById(
            "expense_category"
        ).value =
        expense.expense_category || "";

        document.getElementById(
            "amount"
        ).value =
        expense.amount || "";

        document.getElementById(
            "expense_date"
        ).value =
        expense.expense_date || "";

        document.getElementById(
            "notes"
        ).value =
        expense.notes || "";

        document.getElementById(
            "modalTitle"
        ).innerText =
        "Edit Expense";

        modal.style.display =
        "flex";

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// DELETE EXPENSE
// ======================

async function deleteExpense(id){

    if(
        !confirm(
            "Delete Expense?"
        )
    ){
        return;
    }

    try{

        const response =
        await fetch(
            API_URL +
            "/api/expenses/" +
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
                data.message
            );

            loadExpenses();

            loadMonthlyReport();

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
    function(){

    const keyword =
    this.value
    .toLowerCase();

    const filtered =
    allExpenses.filter(
        expense =>

        expense.expense_name
        .toLowerCase()
        .includes(keyword)

        ||

        expense.expense_category
        .toLowerCase()
        .includes(keyword)
    );

    renderExpenses(
        filtered
    );

});

// ======================
// CLOSE OUTSIDE
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

async function init(){

    await loadExpenses();

    await loadMonthlyReport();

}

init();