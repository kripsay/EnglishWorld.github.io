const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to database');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        language_level TEXT CHECK(language_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL
    )`);
});

const requireAuth = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/auth.html');
    next();
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

app.post('/api/check-email', (req, res) => {
    const { email } = req.body;
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Неверный формат электронной почты' });
    }
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        if (user) {
            return res.status(400).json({ error: 'Аккаунт с данной почтой уже существует' });
        }
        res.json({ success: true });
    });
});

app.post('/api/register', async (req, res) => {
    const { email, password, language_level } = req.body;

    if (!validateEmail(email)) return res.status(400).json({ error: 'Неверный формат электронной почты' });
    if (!['beginner', 'intermediate', 'advanced'].includes(language_level)) {
        return res.status(400).json({ error: 'Invalid language level' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            'INSERT INTO users (email, password, language_level) VALUES (?, ?, ?)',
            [email, hashedPassword, language_level],
            function(err) {
                if (err) return res.status(400).json({ error: 'Аккаунт с данной почтой уже существует' });
                req.session.userId = this.lastID;
                res.json({ success: true, language_level });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Неверные учетные данные' });
        }
        req.session.userId = user.id;
        res.json({ success: true, language_level: user.language_level });
    });
});

app.get('/api/user', (req, res) => {
    if (!req.session.userId) return res.json({ loggedIn: false });
    db.get('SELECT email, language_level FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user) return res.json({ loggedIn: false });
        res.json({ loggedIn: true, email: user.email, language_level: user.language_level });
    });
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.get('/:level-module', requireAuth, (req, res) => {
    const level = req.params.level;
    if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
        return res.status(404).send('Модуль не найден');
    }
    res.sendFile(__dirname + `/public/modules/${level}.html`);
});

app.listen(port, () => console.log(`Сервер, запущенный по адресу http://localhost:${port}`));