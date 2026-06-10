const API_URL = "http://127.0.0.1:5000";

const token =
localStorage.getItem("token");

if(!token){
    window.location.href = "/login";
}

// ======================
// ELEMENTS
// ======================

const form =
document.getElementById(
    "settingsForm"
);

// ======================
// LOAD SETTINGS
// ======================

async function loadSettings(){

    try{

        const response =
        await fetch(
            API_URL +
            "/api/settings",
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

        if(data.success === false){
            return;
        }

        document.getElementById(
            "company_name"
        ).value =
        data.company_name || "";

        document.getElementById(
            "address"
        ).value =
        data.address || "";

        document.getElementById(
            "mobile"
        ).value =
        data.mobile || "";

        document.getElementById(
            "email"
        ).value =
        data.email || "";

        document.getElementById(
            "gst_number"
        ).value =
        data.gst_number || "";

        document.getElementById(
            "invoice_prefix"
        ).value =
        data.invoice_prefix || "";

        updatePreview();

    }
    catch(error){

        console.error(error);

        alert(
            "Failed To Load Settings"
        );

    }

}

// ======================
// UPDATE PREVIEW
// ======================

function updatePreview(){

    document.getElementById(
        "previewCompany"
    ).innerText =
    document.getElementById(
        "company_name"
    ).value || "-";

    document.getElementById(
        "previewGST"
    ).innerText =
    document.getElementById(
        "gst_number"
    ).value || "-";

    document.getElementById(
        "previewMobile"
    ).innerText =
    document.getElementById(
        "mobile"
    ).value || "-";

    document.getElementById(
        "previewPrefix"
    ).innerText =
    document.getElementById(
        "invoice_prefix"
    ).value || "-";

}

// ======================
// LIVE PREVIEW
// ======================

[
    "company_name",
    "gst_number",
    "mobile",
    "invoice_prefix"
].forEach(id => {

    document
    .getElementById(id)
    .addEventListener(
        "input",
        updatePreview
    );

});

// ======================
// SAVE SETTINGS
// ======================

form.addEventListener(
    "submit",
    async function(e){

    e.preventDefault();

    const btn =
    document.getElementById(
        "saveSettingsBtn"
    );

    btn.disabled = true;

    btn.innerText =
    "Saving...";

    const payload = {

        company_name:
        document.getElementById(
            "company_name"
        ).value,

        address:
        document.getElementById(
            "address"
        ).value,

        mobile:
        document.getElementById(
            "mobile"
        ).value,

        email:
        document.getElementById(
            "email"
        ).value,

        gst_number:
        document.getElementById(
            "gst_number"
        ).value,

        invoice_prefix:
        document.getElementById(
            "invoice_prefix"
        ).value

    };

    try{

        const response =
        await fetch(
            API_URL +
            "/api/settings",
            {
                method:"PUT",

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
                "Settings Updated Successfully"
            );

            updatePreview();

        }
        else{

            alert(
                data.message ||
                "Update Failed"
            );

        }

    }
    catch(error){

        console.error(error);

        alert(
            "Server Error"
        );

    }

    btn.disabled = false;

    btn.innerText =
    "Save Settings";

});

// ======================
// INIT
// ======================

loadSettings();