const output = document.getElementById("output");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

speak("Hi! This is your Personal Voice Assistant - IRIS made by Ishaan Ray. How may I help you?");
recognition.onstart = function () {
  output.textContent = "Listening...";
};

recognition.onresult = function (event) {
  const spokenText = event.results[0][0].transcript;
  output.textContent = "You said: " + spokenText;

  // You can now do stuff based on voice:
  handleCommand(spokenText.toLowerCase());
};

function startListening() {
  recognition.start();
}

function handleCommand(command) {
  if (command.includes("youtube")) {
    speak('Surely! Opening Youtube.');
    window.open("https://youtube.com", "_blank");
  } else if (command.includes("time")) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    speak("The time in your region is " + time);
  } else if (command.includes("compiler")) {
    speak('Ahhh! Be ready!!! \n The INFINITY COMPILER HUB made by Ishaan Ray is coming up on your screen, go on with numerous compilers, Traveller!');
    window.open("https://infinitycompilerhub.netlify.app/", "_blank");
  } else if (command.includes("github")) {
    speak('Surely! Opening Github.');
    if (command.includes("profile")) {
      window.open("https://github.com/Cipher-Shadow-IR/", "_blank");
    } else {
      window.open("https://github.com/", "_blank");
    }
  } else if (command.includes("mail")) {
    speak('Gotta Check Inbox? \n Here you go!.');
    window.open("https://mail.google.com/mail/", "_blank");
  } else if (command.includes("notepad")) {
    speak('Want to make a Note? \n Here you go! Make sure to save the note!');
    window.open("https://www.rapidtables.com/tools/notepad.html", "_blank");
  } else if (command.startsWith("open ")) {
    const siteName = command.replace("open ", "").replace("website", "").trim();
    const searchURL = `https://${siteName.replace(/\s+/g, "")}.com`;

    fetch(searchURL).then((response) => {
      if (response.ok) {
        speak(`Opening ${siteName}.com...`);
        window.open(searchURL, "_blank");
      } else {
        speak(`I couldn't find ${siteName}.com, so I'll search it on Google.`);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(siteName)}`, "_blank");
      }
    }).catch(() => {
      speak(`I couldn't find ${siteName}.com, so I'll search it on Google.`);
      window.open(`https://www.google.com/search?q=${encodeURIComponent(siteName)}`, "_blank");
    });
  } else if (command.startsWith("search for ")) {
    const query = command.replace("search for ", "").trim();
    speak(`Searching Google for ${query}`);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  } else if (command.startsWith("search on youtube for ")) {
    const query = command.replace("search on youtube for ", "").trim();
    speak(`Searching YouTube for ${query}`);
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
  } else {
    speak("Hmm... I didn't get that, but let me think...");
    fetchAIResponse(command);
  }
}

function toggleListening() {
  const micWrapper = document.getElementById("micWrapper");
  const listenBtn = document.getElementById("listenBtn");

  if (micWrapper.classList.contains("listening")) {
    recognition.stop(); // Stop the voice recognition
    micWrapper.classList.remove("listening");
    listenBtn.textContent = "🎤"; // Set button back to default
    speak("Stopped listening.");
  } else {
    startListening(); // Start voice recognition
    micWrapper.classList.add("listening");
    listenBtn.textContent = "🛑 Listening..."; // Change button to show listening state
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
