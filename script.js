document.getElementById('sendButton').addEventListener('click', function () {
    let command = document.getElementById('commandInput').value;
    fetch('/command', {
        method: 'POST',
        body: JSON.stringify({ command: command }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => alert(data.response));
});

document.getElementById('voiceButton').addEventListener('click', function () {
    fetch('/listen', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.command) {
            alert("You said: " + data.command);
        } else {
            alert(data.error);
        }
    });
});

let isMuted = false;
document.getElementById('muteButton').addEventListener('click', function () {
    let audio = document.getElementById('background-music');
    isMuted = !isMuted;
    audio.muted = isMuted;
    this.innerText = isMuted ? "🔇 Mute" : "🔉 Unmute";
});

document.getElementById('volumeButton').addEventListener('click', function () {
    let audio = document.getElementById('background-music');
    let volume = prompt("Set volume (0 to 1):");
    audio.volume = Math.min(Math.max(volume, 0), 1);
});
