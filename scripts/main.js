const output = document.getElementById("output");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const wakeRecognition = new SpeechRecognition();

let recognitionListening = false;

speak("Hi! This is your Personal Voice Assistant - IRIS made by Ishaan Ray. How may I help you?");

// ---------------- Wake Word Recognition ----------------
wakeRecognition.continuous = true;
wakeRecognition.interimResults = false;

wakeRecognition.onresult = (event) => {
  const transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
  console.log("Wake Check:", transcript);

  if (transcript.includes("hey iris")) {
    speak("Yes? I'm listening...");
    wakeRecognition.stop(); // Pause wake listening
    startListening();       // Begin active listening
  }
};

wakeRecognition.onend = () => {
  if (!recognitionListening) {
    wakeRecognition.start(); // Keep listening for "Hey IRIS"
  }
};

// ---------------- Command Recognition ----------------
recognition.onstart = function () {
  recognitionListening = true;
  output.textContent = "Listening...";
};

recognition.onresult = function (event) {
  const spokenText = event.results[0][0].transcript;
  output.textContent = "You said: " + spokenText;

  handleCommand(spokenText.toLowerCase());
};

recognition.onend = function () {
  recognitionListening = false;
  wakeRecognition.start(); // Resume wake word detection
};

// Start listening for wake word on page load
wakeRecognition.start();

// ---------------- Command Handler ----------------
function startListening() {
  recognitionListening = true;
  recognition.start();
}

const commands = [
  {
    keywords: ["time", "what's the time", "tell me the time"],
    action: () => {
      const now = new Date();
      const time = now.toLocaleTimeString();
      speak("The time in your region is " + time);
    }
  },
  {
    keywords: ["compiler", "infinity compiler"],
    action: () => {
      speak("Ahhh! Be ready!!! The INFINITY COMPILER HUB made by Ishaan Ray is coming up on your screen. Go on with numerous compilers; Traveller!");
      window.open("https://infinitycompilerhub.netlify.app/", "_blank");
    }
  },
  {
    keywords: ["github"],
    action: (command) => {
      speak("Surely! Opening GitHub.");
      if (command.includes("profile")) {
        window.open("https://github.com/Cipher-Shadow-IR/", "_blank");
      } else {
        window.open("https://github.com/", "_blank");
      }
    }
  },
  {
    keywords: ["mail", "gmail", "email"],
    action: () => {
      speak("Gotta check inbox? Here you go!");
      window.open("https://mail.google.com/mail/", "_blank");
    }
  },
  {
    keywords: ["notepad"],
    action: () => {
      speak("Want to make a note? Here you go! Make sure to save it, lol.");
      window.open("https://www.rapidtables.com/tools/notepad.html", "_blank");
    }
  },
  {
    keywords: ["search on youtube for"],
    action: (command) => {
      const query = command.split("search on youtube for")[1]?.trim();
      if (query) {
        speak(`Searching YouTube for ${query}`);
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
      }
    }
  },
  {
    keywords: ["search for"],
    action: (command) => {
      const query = command.split("search for")[1]?.trim();
      if (query) {
        speak(`Searching Google for ${query}`);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
      }
    }
  },
  {
    keywords: ["open"],
    action: (command) => {
      let site = command.replace("open", "").replace("website", "").trim();
      let url = site.includes(".") ? `https://${site}` : `https://${site.replace(/\s+/g, "")}.com`;
      speak(`Opening ${site}...`);
      window.open(url, "_blank");
    }
  },
];

function handleCommand(command) {
  const matched = commands.find(c => c.keywords.some(k => command.includes(k)));

  if (matched) {
    matched.action(command);
  } else {
    speak("Hmm... I didn't get that, but let me think...");
    fetchAIResponse(command);
  }
}

function speak(message) {
  const speech = new SpeechSynthesisUtterance();
  speech.text = message;
  window.speechSynthesis.speak(speech);
}

async function fetchAIResponse(prompt) {
  const response = await fetch("https://iris-ai-backend.ciphershadow197.repl.co/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: prompt }),
  });

  const data = await response.json();
  const aiMessage = data.reply;
  output.textContent = "IRIS says: " + aiMessage;
  speak(aiMessage);
}
