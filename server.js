// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');

const app = express();
const PORT = 80;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
// configure static referencing for images and stylesheets to public folder
app.use(express.static('public'));
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Mock user data (replace with pulling from credentials.txt file)
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' },
];

// Routes
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = user;
        res.redirect('/console');
    } else {
        res.redirect('/');
    }
});

app.get('/console', (req, res) => {
    if (req.session.user) {
        res.render('console');
    } else {
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});