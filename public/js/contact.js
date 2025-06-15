document.addEventListener('DOMContentLoaded', async () => {
    const contactsModal = document.getElementById('contacts-modal');
    const closeModalBtn = contactsModal.querySelector('.modal__close');

    document.querySelectorAll('[data-modal="contacts"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            contactsModal.style.display = 'flex';
            contactsModal.classList.add('visible');
        });
    });

    closeModalBtn.addEventListener('click', () => {
        contactsModal.classList.remove('visible');
        contactsModal.style.display = 'none';
    });

    contactsModal.addEventListener('click', (e) => {
        if (e.target === contactsModal) {
            contactsModal.classList.remove('visible');
            contactsModal.style.display = 'none';
        }
    });
});