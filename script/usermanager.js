const url = `http://localhost:3000/`

let g_user = {
    token: window.localStorage.getItem('token'),
    username: window.localStorage.getItem('username'),
    id: window.localStorage.getItem('userid'),
    firstname: window.localStorage.getItem('firstname'),
    lastname: window.localStorage.getItem('lastname'),
    business: window.localStorage.getItem('business') === 'true' ? true : false,
    businessName: window.localStorage.getItem('businessName')
}

function generateLoginToken() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for(let i = 0; i < 30; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}

function api_tryLogin(username, password) {
    window.localStorage.clear()
    axios({
        method: 'get',
        url: url+`users?username=${username}&&password=${password}`,
    }).then((posRes) => {
        if (posRes.data) {
            if (posRes.data.length > 0) {
                let userToken = generateLoginToken()
                window.localStorage.setItem("token", userToken)
                window.localStorage.setItem("username", posRes.data[0].username)
                window.localStorage.setItem("userid", posRes.data[0].id)
                window.localStorage.setItem("firstname", posRes.data[0].firstname)
                window.localStorage.setItem("lastname", posRes.data[0].lastname)
                window.localStorage.setItem("business", posRes.data[0].business)
                window.localStorage.setItem("businessName", posRes.data[0].business_name ? posRes.data[0].business_name : '')
                api_writeToken(posRes.data[0].id, userToken)
            } else {
                window.localStorage.clear()
                alert("Username or password is wrong.")
            }
        }
    }, (errRes) => {
        console.log(errRes);
        alert(errRes.response.statusText);
    })
}

function api_checkRegister(username, firstname, lastname, businessName, password, business) {
    axios({
        method: 'get',
        url: url+`users?username=${username}`,
    }).then((posRes) => {
        if (posRes.data) {
            if (posRes.data.length > 0) {
                alert("Username already in use.")
            } else {
                api_tryRegister(username, firstname, lastname, businessName, password, business)
            }
        }
    }, (errRes) => {
        console.log(errRes);
        alert(errRes.response.statusText);
    })
}

function api_tryRegister(username, firstname, lastname, businessName, password, business) {
    let userToken = generateLoginToken()
    axios({
        method: 'post',
        data: {
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname,
            token: userToken,
            business: business,
            business_name: businessName
        },
        url: url+`users`,
    }).then((posRes) => {
        if (posRes.data) {
            window.localStorage.setItem("token", userToken)
            window.localStorage.setItem("username", posRes.data.username)
            window.localStorage.setItem("userid", posRes.data.id)
            window.localStorage.setItem("firstname", posRes.data.firstname)
            window.localStorage.setItem("lastname", posRes.data.lastname)
            window.localStorage.setItem("business", posRes.data.business)
            window.localStorage.setItem("businessName", posRes.data.business_name ? posRes.data.business_name : '')
            window.location.replace('../html/dashboard.html');
        } else {
            window.localStorage.clear()
            alert("Could not register")
        }
        
    }, (errRes) => {
        console.log(errRes);
        alert(errRes.response.statusText);
    })
}

function loginUser() {
    const lf_username = document.getElementById('lf_username')
    const lf_password = document.getElementById('lf_password')
    if(!lf_username || !lf_password) {
        console.error('One or more login fields not found.')
        return
    }
    if(lf_username.value.length === 0 || lf_password.value.length === 0) {
        alert('Both username and password are required.')
        return
    }
    api_tryLogin(lf_username.value, lf_password.value)
}

function registerAccount() {
    const rf_username = document.getElementById('rf_username')
    const rf_firstname = document.getElementById('rf_firstname')
    const rf_lastname = document.getElementById('rf_lastname')
    const rf_business = document.getElementById('rf_business')
    const rf_password = document.getElementById('rf_password')
    const rf_passwordc = document.getElementById('rf_passwordc')
    const rf_business_switch = document.getElementById('rf_business_switch')
    if(!rf_username || !rf_firstname || !rf_lastname || !rf_business || !rf_password || !rf_passwordc || !rf_business_switch) {
        console.log('One or more registration fields not found.')
        return
    }
    if(rf_password.value !== rf_passwordc.value) {
        alert('Passwords do not match.')
        return
    }
    if(rf_username.value.length < 4) {
        alert('Username must be at least 4 characters long.')
        return
    }
    if(rf_password.value.length < 6) {
        alert('Password must be at least 6 characters long.')
        return
    }
    const r_user = {
        username: rf_username.value,
        firstname: rf_firstname.value,
        lastname: rf_lastname.value,
        businessName: rf_business.value,
        password: rf_password.value,
        business: rf_business_switch.checked
    }
    if(!r_user.business) {
        r_user.businessName = null;
    }
    api_checkRegister(r_user.username, r_user.firstname, r_user.lastname, r_user.businessName, r_user.password, r_user.business)

}

function api_writeToken(userid, userToken) {
    axios({
        method: 'patch',
        url: url+'users'+'/'+userid,
        data: {"token": userToken},
    }).then((posRes) => {
        console.log(posRes);
        window.location.replace('../html/dashboard.html');
        //alert(posRes.statusText);
    }, (errRes) => {
        console.log(errRes);
        alert(errRes.response.statusText);
    })
}

function api_checkLogin(id, userToken) {
    axios({
        method: 'get',
        url: url+`users?id=${id}&&token=${userToken}`,
    }).then((posRes) => {
        if (posRes.data && posRes.data.length > 0) {
            if(window.location.href.includes('login.html')) {
                window.location.replace('../html/dashboard.html');
            }
        } else {
            window.localStorage.clear()
            alert("Session expired. Please login again!")
            if(!window.location.href.includes('login.html')) {
                window.location.replace('../html/login.html');
            }
        }
        setNavBar()
    }, (errRes) => {
        console.log(errRes);
        alert(errRes.response.statusText);
        setNavBar()
    })
}

function checkLogin() {
    let loggedin = true;
    for(const key in g_user) {
        if(g_user[key] === null) {
            loggedin = false;
            break;
        }
    }
    if (loggedin === false) {
        window.localStorage.clear()
        g_user = null;
        setNavBar()
    } else {
        api_checkLogin(g_user.id, g_user.token)
    }
}

function setNavBar() {
    const navBarEnd = document.getElementById('navbar-end')
    if(!navBarEnd) {
        return
    }
    if (g_user) {
        let businessItem = ''
        if (g_user.businessName) {
            businessItem = `<a class="navbar-item" style="pointer-events: none;">${g_user.businessName}</a>`
        }
        navBarEnd.innerHTML = `
        <a class="navbar-item" onclick="changeTheme()" id="theme-changer-button" data-theme-light="true">
            <i class="fa-solid fa-moon"></i>
        </a>
        <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link is-arrowless mobile-hidden"><i class="fa-solid fa-user"></i></a>

            <div class="navbar-dropdown is-right">
            ${businessItem}
            <a class="navbar-item" style="pointer-events: none;">${g_user.firstname} ${g_user.lastname}</a>
            <hr class="navbar-divider">
            <a class="navbar-item" onclick="logoutUser()">Logout</a>
            </div>
        </div>
      `
    } else {
        navBarEnd.innerHTML = `
        <a class="navbar-item" onclick="changeTheme()" id="theme-changer-button" data-theme-light="true">
            <i class="fa-solid fa-moon"></i>
        </a>
        <div class="navbar-item">
            <div class="buttons">
                <a class="button is-primary" href="../html/login.html?new=true">
                    <strong>Sign up</strong>
                </a>
                <a class="button is-light" href="../html/login.html"> Log in </a>
            </div>
        </div>
        `
    }
}

function logoutUser() {
    window.localStorage.clear()
    g_user = null;
    if(!window.location.href.includes('login.html')) {
        window.location.replace('../html/login.html?logout=true');
    }
}

function go2Login() {
    const loginContainer = document.getElementById('form-container-login')
    const registerContainer = document.getElementById('form-container-register')
    if(loginContainer && registerContainer) {
        loginContainer.classList.remove('is-hidden')
        registerContainer.classList.add('is-hidden')
    } else {
        console.error('Could not find login/register container.')
    }
}

function go2Register() {
    const loginContainer = document.getElementById('form-container-login')
    const registerContainer = document.getElementById('form-container-register')
    if(loginContainer && registerContainer) {
        registerContainer.classList.remove('is-hidden')
        loginContainer.classList.add('is-hidden')
    } else {
        console.error('Could not find login/register container.')
    }
}

function toggleBusinessRegistration() {
    const businessCheckbox = document.getElementById('rf_business_switch')
    const businessNameField = document.getElementById('rf_business_field')
    if(businessCheckbox && businessNameField){
        if(businessCheckbox.checked === true) {
            businessNameField.classList.remove('is-hidden')
        } else {
            businessNameField.classList.add('is-hidden')
        }
    } else {
        console.error('Could not find business checkbox/field.')
    }
}

function logoutNotification() {
    console.log('Logout')
}


function checkLoginPageParams() {
    if(window.location.href.includes('login.html')) {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        if(params.hasOwnProperty('new')) {
            window.history.pushState({}, document.title, window.location.pathname);
            go2Register()
        }
        else if(params.hasOwnProperty('logout')) {
            window.history.pushState({}, document.title, window.location.pathname);
            logoutNotification();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    checkLogin()
    checkLoginPageParams()
})

console.log(window.location)