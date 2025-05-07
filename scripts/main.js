const output = document.getElementById("output");
const irisText = document.getElementById("irisText");
const listeningBall = document.getElementById("listeningBall");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const wakeRecognition = new SpeechRecognition();

let recognitionListening = false;

function toggleListening() {
  if (recognitionListening) {
    recognition.stop();
  } else {
    startListening();
  }
}

// ---------------- Wake Word Recognition ----------------
wakeRecognition.continuous = true;
wakeRecognition.interimResults = false;

wakeRecognition.onresult = (event) => {
  const transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
  if (transcript.includes("hey iris")) {
    speak("Yes? I'm listening...");
    showListeningState();
    wakeRecognition.stop();
    startListening();
  }
};

wakeRecognition.onend = () => {
  if (!recognitionListening) {
    wakeRecognition.start();
  }
};

// ---------------- Command Recognition ----------------
recognition.onstart = () => {
  recognitionListening = true;
  output.textContent = "Listening...";
};

recognition.onresult = (event) => {
  const spokenText = event.results[0][0].transcript.toLowerCase();
  output.textContent = "You said: " + spokenText;
  handleCommand(spokenText);
};

recognition.onend = () => {
  recognitionListening = false;
  hideListeningState();
  wakeRecognition.start();
};

// Start listening for wake word on page load
wakeRecognition.start();

function startListening() {
  recognitionListening = true;
  recognition.start();
}

// ---------------- Visual State Handlers ----------------
function showListeningState() {
  irisText.classList.add("hidden");
  listeningBall.classList.remove("hidden");
}

function hideListeningState() {
  irisText.classList.remove("hidden");
  listeningBall.classList.add("hidden");
}

// ---------------- Command Handler ----------------
const commands = [
  {
    keywords: ["time", "what's the time", "tell me the time"],
    action: () => {
      const time = new Date().toLocaleTimeString();
      speak("The time is " + time);
    }
  },
  {
    keywords: ["who are you", "what is your name", "introduce yourself"],
    action: () => {
      const introduction = "I am IRIS, your Personal Voice Assistant. How can I assist you today?";
      speak(introduction);
      output.textContent = "IRIS says: " + introduction;
    }
  }
];

function handleCommand(command) {
  const matched = commands.find(c => c.keywords.some(k => command.includes(k)));
  if (matched) {
    matched.action();
  } else {
    speak("Let me think...");
    fetchGPTResponse(command);
  }
}

function speak(message) {
  const speech = new SpeechSynthesisUtterance();
  speech.text = message;
  window.speechSynthesis.speak(speech);
}

async function fetchGPTResponse(prompt) {
  try {
    const response = await fetch("https://iris-backend.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: prompt })
    });
    
    if (!response.ok) throw new Error("Failed to fetch GPT response");

    const data = await response.json();
    const gptMessage = data.reply;
    output.textContent = "GPT says: " + gptMessage;
    speak(gptMessage);
  } catch (error) {
    console.error("Error fetching GPT response:", error);
    output.textContent = "IRIS says: Sorry, I couldn't process that.";
    speak("Sorry, I couldn't process that.");
  }
}
