// index.js

require('dotenv').config(); // Ladda miljövariabler från .env

const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const path = require('path');
const routes = require('./routes/routes'); // Kontrollera att vägen är korrekt för `routes.js`

const app = express();
const port = process.env.PORT || 1337; // Använd PORT från .env eller fallback till 1337
const sessionSecret = process.env.SESSION_SECRET || 'default_secret_key'; // Fallback för SESSION_SECRET

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Sätt sökvägen till dina EJS-mallar

// Middleware för att hantera URL-kodade data och JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfigurera session med secret från miljövariabler
app.use(session({
    secret: sessionSecret, // Använd SESSION_SECRET från .env eller fallback
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Sätt till true om du använder HTTPS
}));

// Statiska filer från public-mappen
app.use(express.static(path.join(__dirname, 'public')));

// Ställ in CSRF-skydd efter sessionen
const csrfProtection = csrf();
app.use(csrfProtection);

// Gör CSRF-token tillgänglig i alla vyer
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Använd routes
app.use('/', routes);

// Hantera CSRF-fel
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        // Hantera CSRF-tokenfel här
        res.status(403);
        res.send('Formuläret manipulerades.');
    } else {
        next(err);
    }
});

// Starta servern med felhantering
app.listen(port, (error) => {
    if (error) {
        console.error('Failed to start the server:', error);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});
