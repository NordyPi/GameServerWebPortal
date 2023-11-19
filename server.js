// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const cheerio = require('cheerio');

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

const getSteamPlayerCount = async (apiEndpoint) => {
    try {
        const response = await axios.get(apiEndpoint);
        return response.data.response.player_count;
    } catch (error) {
        console.error('Error fetching player count:', error.message);
        return 'Error fetching player count';
    }
};

async function scrapeMinecraftPlayerCount() {
    const url = 'https://playercounter.com/minecraft/';
    let response = await axios.get(url);
    let $ = cheerio.load(response.data);
    let count = $('.code-block.code-block-1').first().next().text();
    return count;
};

app.get('/console', async (req, res) => {
    if (req.session.user) {
        let pageData = {
            valheimPlayers: await getSteamPlayerCount(valheimApiEndpoint),
            vrisingPlayers: await getSteamPlayerCount(vrisingApiEndpoint),
            minecraftPlayers: await scrapeMinecraftPlayerCount()
        };
        res.render('console', pageData);
    } else {
        res.redirect('/');
    }
});

app.post('/run-script', async (req, res) => {
    try {
        // Adjust this command to run your specific shell script
        const scriptCommand = 'sudo sh /home/minecraft/test_server/start.sh';

        exec(scriptCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing script:', error.message);
                res.status(500).send('Internal Server Error');
                return;
            }

            console.log('Script executed successfully:', stdout);
            res.status(200).send('Script executed successfully');
        });
    } catch (error) {
        console.error('Error running script:', error.message);
        res.status(500).send('Internal Server Error');
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