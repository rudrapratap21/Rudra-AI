const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";

const output = document.getElementById("output");
const stopButton = document.getElementById("stopButton");
const arc = document.getElementById("reactor");
const stopListenButton = document.getElementById("stopListenButton");
const chatContainer = document.getElementById("chat-container");
const chatLog = document.getElementById("chat-log");
const chatInput = document.getElementById("chat-input");
const deactivateBtn = document.getElementById("deactivate-jarvis");

let isListening = false;
let jarvisActive = true;

const googleApiKey = 'AIzaSyB6FdenBnLSIXTyMt2yP-6YJqaBWa3sZLA';
const googleEngineId = '86a7e4f44757149f0';

function startListening() {
  if (!jarvisActive) return;
  output.innerText = "Listening...";
  arc.style.background = "radial-gradient(circle, #0f0, #000)";
  recognition.start();
  isListening = true;
  stopListenButton.style.display = "block";
}

recognition.onresult = function (event) {
  const command = event.results[0][0].transcript.toLowerCase();
  output.innerText = "You: " + command;
  appendToChat("You: " + command);
  processCommand(command);

  if (isListening && !command.includes("goodbye")) {
    recognition.start();
  } else {
    isListening = false;
    stopListenButton.style.display = "none";
  }
};

function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.voice = window.speechSynthesis.getVoices()[0];
  speech.pitch = 1;
  speech.rate = 1;
  arc.style.background = "radial-gradient(circle, red, #000)";
  stopButton.style.display = "block";
  window.speechSynthesis.speak(speech);
  appendToChat("Jarvis: " + text);
  speech.onend = () => {
    arc.style.background = "radial-gradient(circle, #0f0, #000)";
    stopButton.style.display = "none";
  };
}

function processCommand(command) {
  if (!jarvisActive) return;

  if (command.startsWith("search") || command.startsWith("google")) {
    const query = command.replace(/^(search|google)/, "").trim();
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    speak(`Searching Google for ${query}`);
  } else if (command.startsWith("open")) {
    const site = command.replace("open", "").trim().replace(/\s+/g, '');
    window.open(`https://${site}`);
    speak(`Opening ${site}`);
  } else if (command.startsWith("according to google") || command.startsWith("calculate")) {
    const query = command.replace("according to google", "").replace("calculate", "").trim();
    googleSearch(query);
  } else if (command.startsWith("remind me after")) {
    const minutes = parseInt(command.replace("remind me after", "").trim());
    if (!isNaN(minutes)) {
      speak(`Reminder set for ${minutes} minutes.`);
      setTimeout(() => speak("Reminder: Your time is up!"), minutes * 60000);
    } else {
      speak("Sorry, I couldn't understand the time.");
    }
  } else if (command.includes("hello")) {
    greet();
  } else if (command.includes("who is your boss")) {
    speak("Rudra Pratap is my boss.");
  } else if (command.includes("goodbye") || command.includes("shut down")) {
    speak("Goodbye, shutting down.");
    jarvisActive = false;
  } else {
    speak("Sorry, I didn't understand that.");
  }
}

function googleSearch(query) {
  fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${googleApiKey}&cx=${googleEngineId}`)
    .then(res => res.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        speak("I found a result: " + data.items[0].snippet);
      } else {
        speak("Sorry, no result found.");
      }
    })
    .catch(() => speak("There was an error fetching Google results."));
}

function greet() {
  const hour = new Date().getHours();
  const greetText = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  speak(`${greetText} boss, how can I assist you today?`);
}

function appendToChat(message) {
  const msg = document.createElement("div");
  msg.textContent = message;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
}

document.getElementById("toggle-chat").addEventListener("click", () => {
  chatContainer.style.display = chatContainer.style.display === "none" ? "flex" : "none";
});

deactivateBtn.addEventListener("click", () => {
  speak("Goodbye, shutting down now.");
  jarvisActive = false;
  output.innerText = "Jarvis is deactivated.";
  stopButton.style.display = "none";
  stopListenButton.style.display = "none";
});

chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const command = chatInput.value.trim();
    if (command) {
      output.innerText = "You: " + command;
      appendToChat("You: " + command);
      processCommand(command.toLowerCase());
      chatInput.value = "";
    }
  }
});
