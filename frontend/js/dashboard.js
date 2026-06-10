const API_URL = "http://127.0.0.1:5000";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/login";
}

// Username
document.getElementById("username").innerText =
    localStorage.getItem("username") || "User";

// Logout
document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");

        window.location.href = "/login";
    });


// =========================
// LOAD DASHBOARD DATA
// =========================

async function loadDashboard() {

    try {

        const response = await fetch(
            API_URL + "/api/dashboard",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        const data = await response.json();

        document.getElementById(
            "today_sales"
        ).innerText =
            "₹" + data.today_sales;

        document.getElementById(
            "today_bills"
        ).innerText =
            data.today_bills;

        document.getElementById(
            "monthly_revenue"
        ).innerText =
            "₹" + data.monthly_revenue;

        document.getElementById(
            "total_customers"
        ).innerText =
            data.total_customers;

        document.getElementById(
            "total_products"
        ).innerText =
            data.total_products;

        document.getElementById(
            "total_suppliers"
        ).innerText =
            data.total_suppliers;

        document.getElementById(
            "total_purchases"
        ).innerText =
            data.total_purchases;

    } catch (error) {

        console.error(
            "Dashboard Error",
            error
        );

    }

}


// =========================
// LOAD ANALYTICS
// =========================

async function loadAnalytics() {

    try {

        const response = await fetch(
            API_URL + "/api/analytics",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        const data = await response.json();

        document.getElementById(
            "net_profit"
        ).innerText =
            "₹" + data.net_profit;

        document.getElementById(
            "best_selling_product"
        ).innerText =
            data.best_selling_product;

        document.getElementById(
            "best_selling_qty"
        ).innerText =
            data.best_selling_qty;

        document.getElementById(
            "top_customer"
        ).innerText =
            data.top_customer;

        document.getElementById(
            "top_customer_amount"
        ).innerText =
            data.top_customer_amount;

        createRevenueChart(data);

        createSalesChart(data);

    } catch (error) {

        console.error(
            "Analytics Error",
            error
        );

    }

}


// =========================
// REVENUE CHART
// =========================

function createRevenueChart(data) {

    const ctx =
        document
        .getElementById(
            "revenueChart"
        );

    new Chart(ctx, {

        type: "bar",

        data: {

            labels: [
                "Revenue",
                "Profit",
                "Expenses"
            ],

            datasets: [{

                label:
                    "Amount",

                data: [

                    data.total_revenue,

                    data.net_profit,

                    data.total_expenses

                ]

            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}


// =========================
// SALES CHART
// =========================

function createSalesChart(data) {

    const ctx =
        document
        .getElementById(
            "salesChart"
        );

    new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [

                "Sales",

                "Customers",

                "Products"

            ],

            datasets: [{

                data: [

                    data.total_sales,

                    data.total_customers,

                    data.total_products

                ]

            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}
async function loadLowStock(){

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

    const products =
    await response.json();

    const lowStock =
    products.filter(
        p =>
        Number(p.stock_qty)
        <=
        Number(p.low_stock_limit)
    );

    document.getElementById(
        "lowStockAlert"
    ).innerText =
    lowStock.length;

    const warningBox =
    document.getElementById(
        "warningBox"
    );

    warningBox.innerHTML = "";

    lowStock.forEach(product => {

        warningBox.innerHTML +=
        `
        <div class="warning-item">
            ⚠️
            ${product.product_name}
            (Stock :
            ${product.stock_qty})
        </div>
        `;

    });

}
// =========================
// INIT
// =========================

loadDashboard();

loadAnalytics();

loadLowStock();