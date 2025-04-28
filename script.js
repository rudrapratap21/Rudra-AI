const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";

const output = document.getElementById("output");
const stopButton = document.getElementById("stopButton");
const arc = document.getElementById("reactor");
const stopListenButton = document.getElementById("stopListenButton");

let isListening = false;

// Start Listening
function startListening() {
    output.innerText = "Listening...";
    arc.style.background = "radial-gradient(circle, #0f0, #000)";
    recognition.start();
    isListening = true;
    stopListenButton.style.display = "block";
}

// Recognition Result
recognition.onresult = function(event) {
    const command = event.results[0][0].transcript.toLowerCase();
    output.innerText = "You said: " + command;
    processCommand(command);

    if (isListening && !command.includes("goodbye") && !command.includes("shut down") && !command.includes("bye")) {
        recognition.start();
    } else {
        isListening = false;
        stopListenButton.style.display = "none";
    }
};

// Speak
function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.voice = window.speechSynthesis.getVoices()[0];
    speech.pitch = 1;
    speech.rate = 1;
    arc.style.background = "radial-gradient(circle, red, #000)";
    stopButton.style.display = "block";
    window.speechSynthesis.speak(speech);
    speech.onend = () => {
        arc.style.background = "radial-gradient(circle, #0f0, #000)";
        stopButton.style.display = "none";
    };
}

// Process Command
function processCommand(command) {
    // Greeting
    if (command.includes("start") || command.includes("start jarvis")) {
        const hour = new Date().getHours();
        let greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
        speak(`${greet} boss, how can I help you today?`);
    }

    // Time & Date
    else if (command.includes("time") || command.includes("date") || command.includes("day")) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString(undefined, options);
        const timeString = now.toLocaleTimeString();
        speak(`Today is ${dateString}. The time is ${timeString}`);
    }

    // Search Google
    else if (command.startsWith("search ")) {
        const query = command.replace("search", "").trim();
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        speak(`Searching on Google for ${query}`);
    }

    // Search YouTube
    else if (command.startsWith("search on youtube ")) {
        const query = command.replace("search on youtube", "").trim();
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
        speak(`Searching on YouTube for ${query}`);
    }

    // Search Wikipedia
    else if (command.startsWith("from wikipedia search ")) {
        const query = command.replace("from wikipedia search", "").trim();
        searchWikipedia(query);
    }

    // Goodbye
    else if (command.includes("goodbye") || command.includes("shut down") || command.includes("bye")) {
        speak("Shutting down. Goodbye, boss.");
        isListening = false;
        stopListenButton.style.display = "none";
    }

    // Unknown
    else {
        speak("Sorry, I did not understand that.");
    }
}

// Wikipedia Search Function
function searchWikipedia(query) {
    const apiUrl = `https://en.wikipedia.org/w/api.php?origin=*&action=query&list=search&format=json&srsearch=${encodeURIComponent(query)}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.query.search.length > 0) {
                const snippet = data.query.search[0].snippet.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
                speak(`According to Wikipedia, ${snippet}`);
            } else {
                speak("Sorry, I couldn't find anything on Wikipedia.");
            }
        })
        .catch(error => {
            speak("Sorry, an error occurred while searching Wikipedia.");
        });
}

// Stop Speaking
stopButton.addEventListener("click", () => {
    window.speechSynthesis.cancel();
    stopButton.style.display = "none";
    arc.style.background = "radial-gradient(circle, #0f0, #000)";
});

// Stop Listening
stopListenButton.addEventListener("click", () => {
    isListening = false;
    recognition.stop();
    stopListenButton.style.display = "none";
    arc.style.background = "radial-gradient(circle, #0f0, #000)";
    output.innerText = "Listening Stopped";
});

// DateTime Widget
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const formatted = `${now.toLocaleDateString(undefined, options)} - ${now.toLocaleTimeString()}`;
    document.getElementById("dateTimeDisplay").innerText = formatted;
}
setInterval(updateDateTime, 1000);
updateDateTime();
