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

function handleCommand(command) {
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
  
  
  const openWebsite = (url, speakMsg = "") => {
    if (speakMsg) speak(speakMsg);
    window.open(url, "_blank");
  };
  if (command.includes("github")) {
    if (command.includes("profile")) {
      openWebsite("https://github.com/Cipher-Shadow-IR", "Opening your GitHub profile.");
    } else {
      openWebsite("https://github.com", "Opening GitHub.");
    }
  } else if (command.includes("mail")) {
    openWebsite("https://mail.google.com/mail/", "Opening Gmail inbox.");
  } else if (command.includes("notepad") || command.includes("note")) {
    openWebsite("https://www.rapidtables.com/tools/notepad.html", "Opening online notepad.");
  } else if (command.includes("time")) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    speak("The time in your region is " + time);
  } else if (command.includes("compiler")) {
    openWebsite("https://ir-infinitycompilerhub.netlify.app/", "Launching Infinity Compiler Hub.");
  } else if (command.startsWith("open ")) {
    const siteName = command.replace("open ", "").replace("website", "").trim();
    let searchURL;

    if (!siteName.includes(".")) {
      // If no domain is specified, assume ".com"
      searchURL = `https://${siteName.replace(/\s+/g, "")}.com`;
    } else {
      // Use the provided domain
      searchURL = `https://${siteName.replace(/\s+/g, "")}`;
    }

    openWebsite(searchURL, `Opening ${siteName}...`);
  } else if (command.startsWith("search on youtube for ")) {
    const query = command.replace("search on youtube for ", "").trim();
    openWebsite(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, `Searching YouTube for ${query}`);
  } else if (command.startsWith("search for ")) {
    const query = command.replace("search for ", "").trim();
    openWebsite(`https://www.google.com/search?q=${encodeURIComponent(query)}`, `Searching Google for ${query}`);
  } else if (command.includes("weather")) {
    const city = command.replace("weather in ", "").trim();
    openWebsite(`https://www.google.com/search?q=weather+${encodeURIComponent(city)}`, `Fetching weather for ${city}`);
  } else if (command.includes("news")) {
    openWebsite("https://news.google.com", "Fetching the latest news.");
  } else if (command.includes("joke")) {
    fetchGPTResponse("Tell me a joke.");
  } else if (command.includes("tell me about") || command.includes("who is") || command.includes("what is")) {
    const query = command.replace(/tell me about |who is |what is /, "").trim();
    fetchGPTResponse(query);
  } else if (command.includes("stop listening")) {
    recognition.stop();
    wakeRecognition.start();
  } else if (command.includes("thank you") || command.includes("thanks")) {
    speak("You're welcome! If you need anything else, just ask.");
  } else if (command.includes("goodbye") || command.includes("bye")) {
    speak("Goodbye! Have a great day!");
    output.textContent = "IRIS says: Goodbye! Have a great day!";
    recognition.stop();
    wakeRecognition.stop();
  }
  
  else {
    speak("Hmm... I didn't get that, but let me think...");
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