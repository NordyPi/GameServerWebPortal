const axios = require('axios');
const fs = require('fs');

$(document).ready(function(){
    const apiKeys = fs.readFileSync("steamkey.json", 'utf-8');
    const steamApiKey = JSON.parse(apiKeys).steam_id;

    const valheimAppId = 892970;
    const vrisingAppId = 1604030;
    // Steam Web API endpoint to get the number of players for a specific app
    const steamApiEndpoint = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${valheimAppId}&key=${steamApiKey}`;

    // Make the HTTP request to the Steam Web API
    axios.get(steamApiEndpoint)
        .then(response => {
            const valheimCurrentPlayers = response.data.response.player_count;
            console.log(`Current number of players for Valheim: ${numberOfPlayers}`);
        })
        .catch(error => {
            console.error('Error fetching player count:', error.message);
        });
    
    // game server control buttons
    var startVRisingBtn = $('#startVRising');
    var stopVRisingBtn = $('#stopVRising');
    var startValheimBtn = $('#startValheim');
    var stopValheimBtn = $('#stopVRising');
    var startMinecraftBtn = $('#startMinecraft');
    var stopMinecraftBtn = $('#stopMinecraft');

    // live game player count <span>s
    var vrsingPlayerCount = $('#vrsingPlayerCount');
    var valheimPlayerCount = $('#valheimPlayerCount');
    var minecraftPlayerCount = $('#minecraftPlayerCount');
    // set them to 0 for now
    vrsingPlayerCount.text("0");
    valheimPlayerCount.text(valheimCurrentPlayers);
    minecraftPlayerCount.text("0");

});
