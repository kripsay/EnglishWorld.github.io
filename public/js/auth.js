document.addEventListener('DOMContentLoaded', () => {
    const authContent = document.querySelector('.auth-page__content');
    const toRegisterBtn = document.getElementById('to-register');
    const toLoginBtn = document.getElementById('to-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const levelModal = document.getElementById('level-modal');
    const levelButtons = document.querySelectorAll('.level-modal__btn');
    let selectedLevel = null;
    let pendingRegistration = null;

    setTimeout(() => authContent.classList.add('visible'), 10);

    toRegisterBtn.addEventListener('click', () => {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    });

    toLoginBtn.addEventListener('click', () => {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    async function handleFormSubmit(e, isLogin) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;

        if (!isLogin) {
            const errorDiv = registerForm.querySelector('.error-message');
            if (!validateEmail(email)) {
                errorDiv.textContent = 'Invalid email format';
                return;
            }

            try {
                const response = await fetch('/api/check-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                if (!response.ok) {
                    errorDiv.textContent = data.error;
                    return;
                }

                errorDiv.textContent = '';
                pendingRegistration = { email, password };

                authContent.classList.remove('visible');
                setTimeout(() => {
                    levelModal.style.display = 'flex';
                    setTimeout(() => levelModal.classList.add('visible'), 10);
                }, 400);
            } catch (error) {
                errorDiv.textContent = 'Аккаунт с данной почтой уже существует';
            }
            return;
        }

        // Логика для входа
        const errorDiv = loginForm.querySelector('.error-message');
        try {
            if (!validateEmail(email)) {
                errorDiv.textContent = 'Неверный формат электронной почты';
                return;
            }

            errorDiv.textContent = '';

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                errorDiv.textContent = 'Неверные учетные данные';
                return;
            }
            window.location.href = '/';
        } catch (error) {
            errorDiv.textContent = 'Неверные учетные данные';
        }
    }

    loginForm.querySelector('form').addEventListener('submit', (e) => handleFormSubmit(e, true));
    registerForm.querySelector('form').addEventListener('submit', (e) => handleFormSubmit(e, false));

    levelButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            selectedLevel = e.target.getAttribute('data-level');
            if (!pendingRegistration) return;

            const { email, password } = pendingRegistration;
            const errorDiv = registerForm.querySelector('.error-message');

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, language_level: selectedLevel })
                });
                const data = await response.json();
                if (!response.ok) {
                    errorDiv.textContent = data.error;
                    levelModal.classList.remove('visible');
                    setTimeout(() => {
                        levelModal.style.display = 'none';
                        authContent.classList.add('visible');
                    }, 400);
                    return;
                }
                levelModal.classList.remove('visible');
                setTimeout(() => {
                    levelModal.style.display = 'none';
                    window.location.href = '/';
                }, 400);
            } catch (error) {
                errorDiv.textContent = error.message;
                levelModal.classList.remove('visible');
                setTimeout(() => {
                    levelModal.style.display = 'none';
                    authContent.classList.add('visible');
                }, 400);
            }
        });
    });

    levelModal.addEventListener('click', (e) => {
        if (e.target === levelModal) {
            levelModal.classList.remove('visible');
            setTimeout(() => {
                levelModal.style.display = 'none';
                authContent.classList.add('visible');
            }, 400);
        }
    });
});