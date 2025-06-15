document.addEventListener('DOMContentLoaded', async () => {
    const menuBtn = document.querySelector('.module-content__menu-btn');
    const sidebar = document.querySelector('.module-content__sidebar');
    const avatarPlaceholder = document.querySelector('.user-avatar-placeholder');

    const authResponse = await fetch('/api/user');
    const userData = await authResponse.json();

    if (!userData.loggedIn) {
        window.location.href = '/auth.html';
        return;
    }

    if (avatarPlaceholder) {
        const navContainer = document.createElement('div');
        navContainer.className = 'module-header__nav';

        const logoutButton = document.createElement('button');
        logoutButton.className = 'module-header__link module-header__logout';
        logoutButton.textContent = 'Выйти';
        navContainer.appendChild(logoutButton);

        avatarPlaceholder.replaceWith(navContainer);

        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/logout');
                const data = await response.json();
                if (data.success) {
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Ошибка при выходе:', error);
            }
        });
    }

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            console.log('Menu button clicked');
            sidebar.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
});