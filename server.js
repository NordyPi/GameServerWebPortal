// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios');
const fs = require('fs');

const apiKeys = fs.readFileSync("steamkey.json", 'utf-8');
const steamApiKey = JSON.parse(apiKeys).steam_id;
const valheimAppId = 892970;
const vrisingAppId = 1604030;
const valheimApiEndpoint = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${valheimAppId}&key=${steamApiKey}`;
const vrisingApiEndpoint = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${vrisingAppId}&key=${steamApiKey}`;

const app = express();
const PORT = 3000;

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
    console.log(logEntry);

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
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = user;
        logActivity('has logged in', username);
        res.redirect('/console');
    } else {
        logActivity('attempted to log in with password: ' + password, username);
        res.redirect('/');
    }
});

app.get('/console', (req, res) => {
    if (req.session.user) {
        axios.get(valheimApiEndpoint)
            .then(response => {
                const valheimCurrentPlayers = response.data.response.player_count;
                console.log(`Current number of players for Valheim: ${numberOfPlayers}`);
            })
            .catch(error => {
                console.error('Error fetching player count:', error.message);
            });
        let pageData = {
            valheimPlayers: valheimCurrentPlayers
        };
        res.render('console', pageData);
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
    console.log(`Server is running on port: ${PORT}`);
});