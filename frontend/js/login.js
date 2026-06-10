const API_URL =
"http://127.0.0.1:5000";


document
.getElementById("loginForm")
.addEventListener(
"submit",
async function(e){

    e.preventDefault();

    const username =
    document.getElementById(
        "username"
    ).value;

    const password =
    document.getElementById(
        "password"
    ).value;

    const message =
    document.getElementById(
        "message"
    );

    const btn =
    document.getElementById(
        "loginBtn"
    );

    btn.innerText =
    "Please Wait...";

    btn.disabled = true;

    try{

        const response =
        await fetch(
            API_URL +
            "/api/auth/login",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                    username,
                    password
                })
            }
        );

        const data =
        await response.json();

        if(data.success){

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "role",
                data.role
            );

            localStorage.setItem(
                "username",
                data.username
            );

            message.style.color =
            "green";

            message.innerText =
            "Login Successful";

            setTimeout(()=>{

                window.location.href =
                "/dashboard.html";

            },1000);

        }
        else{

            message.style.color =
            "red";

            message.innerText =
            "Invalid Credentials";
        }

    }
    catch(error){

        message.style.color =
        "red";

        message.innerText =
        "Server Error";
    }

    btn.innerText =
    "Login";

    btn.disabled = false;

});