CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    language_level TEXT CHECK(language_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL
);