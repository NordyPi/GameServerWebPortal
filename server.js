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
const usersData = fs.readFileSync('credentials.json');
const users = JSON.parse(usersData).users;


const logActivity = (activity, username) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${username} ${activity} at ${timestamp}\n`;

    fs.appendFile('user_activity.log', logEntry, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};


// Routes
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    console.log(username + ", " + password);
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = user;
        logActivity('has logged in', username);
        res.redirect('/console');
    } else {
        console.log("didnt find username");
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
    const username = req.session.user ? req.session.user.username : 'Unknown user';
    logActivity('has logged out', username);
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});