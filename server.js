// load required modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const cheerio = require('cheerio');

// grab api key from file, set up endpoints using hardcoded steam game numbers
const apiKeys = fs.readFileSync("steamkey.json", 'utf-8');
const steamApiKey = JSON.parse(apiKeys).steam_id;
const valheimAppId = 892970;
const vrisingAppId = 1604030;
const valheimApiEndpoint = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${valheimAppId}&key=${steamApiKey}`;
const vrisingApiEndpoint = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${vrisingAppId}&key=${steamApiKey}`;

// configure app using express on port 3000
const app = express();
const PORT = 3000;

// Middleware to allow session use and passing information through forms with json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
// configure static referencing for images and stylesheets to public folder
app.use(express.static('public'));
// Set the view engine to EJS
app.set('view engine', 'ejs');

// pull credentials file into object for authentication
const usersData = fs.readFileSync('credentials.json');
const users = JSON.parse(usersData).users;

// modular activity log that takes in action and username, writes activity to a log with timestamp
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


// default route, render login page
app.get('/', (req, res) => {
    res.render('login');
});

// on recieving login post from button, check authentication.
app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    const user = users.find(u => u.username === username && u.password === password);
    // if authenticated, log activity, set up session, and move to console
    if (user) {
        req.session.user = user;
        logActivity('has logged in', username);
        res.redirect('/console');
    // otherwise report login attempt and go back to login page
    } else {
        logActivity('attempted to log in with password: ' + password, username);
        res.redirect('/');
    }
});

// modular function to get player count for a steam game passing in the appropriate api
const getSteamPlayerCount = async (apiEndpoint) => {
    try {
        const response = await axios.get(apiEndpoint);
        return response.data.response.player_count;
    } catch (error) {
        console.error('Error fetching player count:', error.message);
        return 'Error fetching player count';
    }
};

// function to scrape a webpage with live player counts for minecraft using cheerio
async function scrapeMinecraftPlayerCount() {
    const url = 'https://playercounter.com/minecraft/';
    let response = await axios.get(url);
    let $ = cheerio.load(response.data);
    let count = $('.code-block.code-block-1').first().next().text();
    return count;
};

// loads the console, passing in values for playercounts using express
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

// modular function to handle button requests from the user to start game servers
app.post('/start-game-server', async (req, res) => {
    try {
        // get user, get specified game service, and log activity
        const username = req.session.user ? req.session.user.username : 'Unknown user';
        const serverName = req.body.script;
        const scriptCommand = 'sh start_${serverName}.sh';
        logActivity('started ' + serverName + ' game server.', username);
        // attempt to run script in the shell using exec
        exec(scriptCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing script:', error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            // report errors if it doesn't run
            console.log('Script executed successfully:', stdout);
            res.status(200).send('Script executed successfully');
        });
    // report errors if it doesn't run
    } catch (error) {
        console.error('Error running script:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// simliar to above, but for stopping game service
app.post('/stop-game-server', async (req, res) => {
    const username = req.session.user ? req.session.user.username : 'Unknown user';

    if (req.body.script == "minecraft"){
        // implement logic 
    } else if (req.body.script == "vrising"){
        // implement logic 
    } else if (req.body.script == "valheim") {
        // implement logic 
    }
    logActivity('stopped ' + req.body.script + ' game server.', username);
});

// handles the user clicking the log out button at the top of the console. ends the session and logs it
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