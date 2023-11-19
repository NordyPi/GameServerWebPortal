$(document).ready(function(){
    // game server control buttons
    var startVRisingBtn = $('#startVRising');
    var stopVRisingBtn = $('#stopVRising');
    var startValheimBtn = $('#startValheim');
    var stopValheimBtn = $('#stopVRising');
    var startMinecraftBtn = $('#startMinecraft');
    var stopMinecraftBtn = $('#stopMinecraft');

    var vrisingStatus = $('#vrisingStatus');
    var valheimStatus = $('#valheimStatus');
    var minecraftStatus = $('#minecraftStatus');

    startMinecraftBtn.click(() => {
        // Send a POST request to the server to run the specified script
        fetch('/run-script', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ script: startMinecraft }),
        })
        .then(response => response.text())
        .then(result => {
            console.log(result);
            minecraftStatus.text(" Running");
        })
        .catch(error => console.error('Error running script:', error));
    });

    stopMinecraftBtn.click(() => {
        minecraftStatus.text(" Stopped");
    });

    function startServer(serverName) {
    }
});
