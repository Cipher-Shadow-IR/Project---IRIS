const output = document.getElementById("output");
const micWrapper = document.getElementById("micWrapper");
const listenBtn = document.getElementById("listenBtn");
const wave1 = document.getElementById("wave1");
const wave2 = document.getElementById("wave2");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.continuous = false;
recognition.lang = "en-US";

// Speak greeting once on load
speak("Hi! This is your Personal Voice Assistant - IRIS, made by Ishaan Ray. How may I help you?");

// Voice recognition event handlers
recognition.onstart = () => {
  output.textContent = "🔊 IRIS is listening...";
  micWrapper.classList.add("listening");
};

recognition.onend = () => {
  micWrapper.classList.remove("listening");
  listenBtn.innerHTML = "🎤";
};

recognition.onresult = (event) => {
  const spokenText = event.results[0][0].transcript;
  output.textContent = "🗣️ You said: " + spokenText;
  handleCommand(spokenText.toLowerCase());
};

function toggleListening() {
  if (micWrapper.classList.contains("listening")) {
    recognition.stop();
    speak("Stopped listening.");
  } else {
    listenBtn.innerHTML = "🛑";
    recognition.start();
  }
}

function speak(message) {
  const utter = new SpeechSynthesisUtterance(message);
  utter.lang = "en-US";
  window.speechSynthesis.speak(utter);
}

function handleCommand(command) {
  const openWebsite = (url, speakMsg = "") => {
    if (speakMsg) speak(speakMsg);
    window.open(url, "_blank");
  };

  if (command.includes("youtube")) {
    openWebsite("https://youtube.com", "Opening YouTube.");
  } else if (command.includes("github")) {
    if (command.includes("profile")) {
      openWebsite("https://github.com/Cipher-Shadow-IR", "Opening your GitHub profile.");
    } else {
      openWebsite("https://github.com", "Opening GitHub.");
    }
  } else if (command.includes("mail")) {
    openWebsite("https://mail.google.com/mail/", "Opening Gmail inbox.");
  } else if (command.includes("notepad")) {
    openWebsite("https://www.rapidtables.com/tools/notepad.html", "Opening online notepad.");
  } else if (command.includes("time")) {
    const now = new Date();
    speak("The current time is " + now.toLocaleTimeString());
  } else if (command.includes("compiler")) {
    openWebsite("https://infinitycompilerhub.netlify.app/", "Launching Infinity Compiler Hub.");
  } else if (command.startsWith("search on youtube for ")) {
    const query = command.replace("search on youtube for ", "").trim();
    openWebsite(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, `Searching YouTube for ${query}`);
  } else if (command.startsWith("search for ")) {
    const query = command.replace("search for ", "").trim();
    openWebsite(`https://www.google.com/search?q=${encodeURIComponent(query)}`, `Searching Google for ${query}`);
  } else if (command.startsWith("open ")) {
    const site = command.replace("open ", "").replace("website", "").trim().split(" ").join("");
    const url = `https://${site}.com`;
    fetch(url)
      .then(res => {
        if (res.ok) {
          speak(`Opening ${site}.com`);
          window.open(url, "_blank");
        } else {
          throw new Error("Fallback");
        }
      })
      .catch(() => {
        speak(`Couldn't open ${site}.com, searching on Google instead.`);
        window.open(`https://www.google.com/search?q=${site}`, "_blank");
      });
  } else {
    speak("Let me think...");
    fetchAIResponse(command);
  }
}

// AI Fetching via Backend (ChatGPT)
async function fetchAIResponse(prompt) {
  try {
    const response = await fetch("https://iris-ai-backend.ciphershadow197.repl.co/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const data = await response.json();
    const aiMessage = data.reply;
    output.textContent = "🤖 IRIS says: " + aiMessage;
    speak(aiMessage);
  } catch (err) {
    output.textContent = "⚠️ Error connecting to IRIS backend.";
    speak("Something went wrong while connecting to my intelligence core.");
  }
}

// Background Animation Canvas (optional if added in HTML)
// Audio Pitch Visualization Setup
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

function visualizePitch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  analyser.getByteFrequencyData(dataArray);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 80;

  // Draw circular pitch graph
  for (let i = 0; i < bufferLength; i++) {
    const angle = (i / bufferLength) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * (radius + dataArray[i] / 4);
    const y = centerY + Math.sin(angle) * (radius + dataArray[i] / 4);

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${dataArray[i]}, ${255 - dataArray[i]}, 255, 0.8)`;
    ctx.fill();
  }

  requestAnimationFrame(visualizePitch);
}

// Activate visualization when recording
function toggleListening() {
  if (micWrapper.classList.contains("listening")) {
    recognition.stop();
    speak("Stopped listening.");
    audioCtx.suspend();
  } else {
    listenBtn.innerHTML = "🛑";
    recognition.start();
    audioCtx.resume();

    // Connect microphone to analyzer
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        visualizePitch();
      });
  }
}

// Optional: Keyboard shortcut to toggle mic
document.addEventListener("keydown", (e) => {
  if (e.key === "m") toggleListening();
});
