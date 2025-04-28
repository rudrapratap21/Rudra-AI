import wikipedia
import pyttsx3
from fuzzywuzzy import process
from flask import Flask, render_template, request, jsonify
import datetime
import speech_recognition as sr
from threading import Thread

app = Flask(__name__)

# Initialize speech engine
engine = pyttsx3.init()

# Command matching using fuzzywuzzy
commands = {
    "who is your boss": "You, Rudra Pratap, are my boss!",
    "who created you": "I was created by Rudra Pratap!",
    "quote": "Fetching a motivational quote for you...",
    "reminder": "Setting a reminder for you..."
}

@app.route('/')
def home():
    # Get current date and time
    current_time = datetime.datetime.now().strftime("%H:%M:%S")
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    current_day = datetime.datetime.now().strftime("%A")
    return render_template('index.html', time=current_time, date=current_date, day=current_day)

@app.route('/command', methods=['POST'])
def command():
    command_text = request.json.get('command')

    # Match command using fuzzy logic
    best_match = process.extractOne(command_text, commands.keys())
    if best_match[1] > 70:  # Threshold to match commands
        response = commands[best_match[0]]
    else:
        response = "Sorry, I didn't understand that command."

    return jsonify({"response": response})

@app.route('/wiki', methods=['POST'])
def wiki_search():
    query = request.json.get('query')
    try:
        result = wikipedia.summary(query, sentences=1)
    except wikipedia.exceptions.DisambiguationError as e:
        result = f"Multiple results found, please be more specific. Options: {e.options}"
    return jsonify({"result": result})

# Voice command route
@app.route('/speak', methods=['POST'])
def speak_command():
    command = request.json.get('command')
    engine.say(command)
    engine.runAndWait()
    return jsonify({"status": "success"})

# Speech recognition
@app.route('/listen', methods=['POST'])
def listen():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
        try:
            text = recognizer.recognize_google(audio)
            return jsonify({"command": text})
        except sr.UnknownValueError:
            return jsonify({"error": "Sorry, I didn't catch that."})
        except sr.RequestError:
            return jsonify({"error": "Speech service is unavailable."})

if __name__ == "__main__":
    app.run(debug=True)
