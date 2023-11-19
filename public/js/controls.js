$(document).ready(function(){
    // game server control buttons
    var startVRisingBtn = $('#startVRising');
    var stopVRisingBtn = $('#stopVRising');
    var startValheimBtn = $('#startValheim');
    var stopValheimBtn = $('#stopValheim');
    var startMinecraftBtn = $('#startMinecraft');
    var stopMinecraftBtn = $('#stopMinecraft');
    // game server status text areas
    var vrisingStatus = $('#vrisingStatus');
    var valheimStatus = $('#valheimStatus');
    var minecraftStatus = $('#minecraftStatus');
    // setup onclicks for all of the buttons
    startMinecraftBtn.click(() => {startGameServer("minecraft", minecraftStatus)});
    stopMinecraftBtn.click(() => {stopGameServer("minecraft", minecraftStatus)});
    startVRisingBtn.click(() => {startGameServer("vrising", vrisingStatus)});
    stopVRisingBtn.click(() => {stopGameServer("vrising", vrisingStatus)});
    startValheimBtn.click(() => {startGameServer("valheim", valheimStatus)});
    stopValheimBtn.click(() => {stopGameServer("valheim", valheimStatus)});
    // function calls a post, passing in the serverName and status text to update
    function startGameServer(serverName, statusElement) {
        fetch('/start-game-server', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // sets body here so that the server.js can pull out the specified service
            body: JSON.stringify({ script: serverName }),
        })
        .then(response => response.text())
        .then(result => {
            // update status
            statusElement.text(" Running");
        })
        .catch(error => console.error('Error running script:', error));
    }
    // same as above, just posts to stop the game service instead.
    function stopGameServer(serverName, statusElement) {
        fetch('/stop-game-server', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ script: serverName }),
        })
        .then(response => response.text())
        .then(result => {
            statusElement.text(" Stopped");
        })
        .catch(error => console.error('Error running script:', error));
    }
});
