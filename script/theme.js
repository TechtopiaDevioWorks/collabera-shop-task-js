function setDarkTheme() {
    let elements = document.getElementsByTagName("*");
    let themableClass= ['card', 'navbar', 'container', 'footer', 'navbar-dropdown', 'navbar-item', 'navbar-link', 'modal-card', 'modal-card-head', 'modal-card-body', 'modal-card-foot']
    for(const element of elements) {
        element.classList.add('has-text-white')
        for(const themClass of themableClass) {
            if(element.classList.contains(themClass)) {
                element.classList.add('has-background-black')
            }
        }
        /*if(element.classList.contains('input')) {
            element.classList.add('has-background-dark')
        }*/
    }
    const themeButton = document.getElementById('theme-changer-button')
    themeButton.innerHTML = '<i class="fa-solid fa-sun"></i>'
}

function setLightTheme() {
    let elements = document.getElementsByTagName("*");
    for(const element of elements) {
        element.classList.remove('has-background-black', 'has-text-white', 'has-background-dark')
    }
    const themeButton = document.getElementById('theme-changer-button')
    themeButton.innerHTML = '<i class="fa-solid fa-moon"></i>'
}


function changeTheme() {
    const themeButton = document.getElementById('theme-changer-button')
    if (themeButton.hasAttribute('data-theme-light')) {
        setDarkTheme()
        themeButton.removeAttribute('data-theme-light')
    } else {
        setLightTheme()
        themeButton.setAttribute('data-theme-light', 'true')
    }
}