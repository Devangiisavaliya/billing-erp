const API_URL = "http://127.0.0.1:5000";

const token =
localStorage.getItem("token");

if(!token){
    window.location.href = "/login";
}

// ======================
// LOAD ANALYTICS
// ======================

async function loadAnalytics(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/analytics",
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

        if(data.success){

            document.getElementById(
                "totalRevenue"
            ).innerText =
            "₹" +
            Number(
                data.total_revenue
            ).toFixed(2);

            document.getElementById(
                "totalExpenses"
            ).innerText =
            "₹" +
            Number(
                data.total_expenses
            ).toFixed(2);

            document.getElementById(
                "netProfit"
            ).innerText =
            "₹" +
            Number(
                data.net_profit
            ).toFixed(2);

            document.getElementById(
                "totalSales"
            ).innerText =
            data.total_sales;

            document.getElementById(
                "bestProduct"
            ).innerText =
            data.best_selling_product || "-";

            document.getElementById(
                "bestProductQty"
            ).innerText =
            data.best_selling_qty || 0;

            document.getElementById(
                "topCustomer"
            ).innerText =
            data.top_customer || "-";

            document.getElementById(
                "topCustomerAmount"
            ).innerText =
            Number(
                data.top_customer_amount || 0
            ).toFixed(2);

        }

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// DAILY REPORT
// ======================

async function loadDailyReport(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/reports/daily",
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
            "dailySales"
        ).innerText =
        "₹" +
        Number(
            data.total_sales
        ).toFixed(2);

        document.getElementById(
            "dailyBills"
        ).innerText =
        data.total_bills;

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
            "/api/reports/monthly",
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
            "monthlySales"
        ).innerText =
        "₹" +
        Number(
            data.total_sales
        ).toFixed(2);

        document.getElementById(
            "monthlyBills"
        ).innerText =
        data.total_bills;

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// YEARLY REPORT
// ======================

async function loadYearlyReport(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/reports/yearly",
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
            "yearlySales"
        ).innerText =
        "₹" +
        Number(
            data.total_sales
        ).toFixed(2);

        document.getElementById(
            "yearlyBills"
        ).innerText =
        data.total_bills;

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// GST REPORT
// ======================

async function loadGSTReport(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/reports/gst",
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
            "gstAmount"
        ).innerText =
        "₹" +
        Number(
            data.total_gst
        ).toFixed(2);

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// CUSTOMER REPORT
// ======================

async function loadCustomerReport(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/reports/customer",
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

        const table =
        document.getElementById(
            "customerReportTable"
        );

        table.innerHTML = "";

        customers.forEach(
            customer => {

            table.innerHTML +=
            `
            <tr>

                <td>
                    ${customer.customer_id}
                </td>

                <td>
                    ${customer.customer_name}
                </td>

                <td>
                    ${customer.mobile || ""}
                </td>

                <td>
                    ₹${Number(
                        customer.total_purchase
                    ).toFixed(2)}
                </td>

            </tr>
            `;

        });

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// PRODUCT SALES REPORT
// ======================

async function loadProductSalesReport(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/reports/product-sales",
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

        const table =
        document.getElementById(
            "productReportTable"
        );

        table.innerHTML = "";

        products.forEach(
            product => {

            table.innerHTML +=
            `
            <tr>

                <td>
                    ${product.product_name}
                </td>

                <td>
                    ${product.quantity_sold}
                </td>

            </tr>
            `;

        });

    }
    catch(error){

        console.error(error);

    }

}

// ======================
// INIT
// ======================

async function init(){

    await loadAnalytics();

    await loadDailyReport();

    await loadMonthlyReport();

    await loadYearlyReport();

    await loadGSTReport();

    await loadCustomerReport();

    await loadProductSalesReport();

}

init();