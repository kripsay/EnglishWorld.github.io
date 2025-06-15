document.addEventListener('DOMContentLoaded', async () => {
    const nav = document.querySelector('.header__nav');
    const loginBtn = document.querySelector('.header__login-btn');
    const startTrainingBtn = document.querySelector('#start-training-btn');

    const authResponse = await fetch('/api/user');
    const userData = await authResponse.json();

    if (userData.loggedIn && loginBtn) {
        loginBtn.remove();

        const coursesLink = document.createElement('a');
        coursesLink.className = 'header__link';
        coursesLink.href = `/${userData.language_level}-module`;
        coursesLink.textContent = 'Мои курсы';
        nav.appendChild(coursesLink);

        const logoutButton = document.createElement('button');
        logoutButton.className = 'user-menu__logout';
        logoutButton.textContent = 'Выйти';
        nav.appendChild(logoutButton);

        if (startTrainingBtn) {
            startTrainingBtn.href = `/${userData.language_level}-module`;
        }

        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/logout');
                const data = await response.json();
                if (data.success) {
                    window.location.reload();
                }
            } catch (error) {
                console.error('Ошибка при выходе:', error);
            }
        });
    }

    const hamb = document.querySelector('#hamb');
    const popup = document.querySelector('#popup');
    const body = document.body;
    const menu = document.querySelector('#menu').cloneNode(true);

    hamb.addEventListener('click', hambHandler);

    function hambHandler(e) {
        e.preventDefault();
        popup.classList.toggle('open');
        hamb.classList.toggle('active');
        body.classList.toggle('no-scroll');
        renderPopup();
    }

    function renderPopup() {
        const menuOriginal = document.querySelector('#menu');
        const menu = menuOriginal.cloneNode(true);
        popup.innerHTML = '';
        popup.appendChild(menu);
    
        const links = Array.from(menu.querySelectorAll('.header__link, .header__login-btn, .user-menu__logout'));
        links.forEach(link => {
            link.addEventListener('click', closeOnClick);
        });
    
        const contactsLink = menu.querySelector('[data-modal="contacts"]');
        if (contactsLink) {
            contactsLink.addEventListener('click', (e) => {
                e.preventDefault();
                const contactsModal = document.getElementById('contacts-modal');
                contactsModal.style.display = 'flex';
                contactsModal.classList.add('visible');
                closeOnClick();
            });
        }
    
        const logoutBtn = menu.querySelector('.user-menu__logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const response = await fetch('/api/logout');
                    const data = await response.json();
                    if (data.success) {
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Ошибка при выходе:', error);
                }
            });
        }
    }
    

    function closeOnClick() {
        popup.classList.remove('open');
        hamb.classList.remove('active');
        body.classList.remove('no-scroll');
    }

    const contactsLink = menu.querySelector('[data-modal="contacts"]');
    if (contactsLink) {
        contactsLink.addEventListener('click', (e) => {
            closeOnClick();
        });
    }
});