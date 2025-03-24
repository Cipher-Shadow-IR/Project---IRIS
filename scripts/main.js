const output = document.getElementById("output");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

speak("Hi! This is your Personal Voice Assistant - IRIS made by Ishaan Ray. How may I help you?")
recognition.onstart = function() {
  output.textContent = "Listening...";
};

recognition.onresult = function(event) {
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
    speak('Ahhh! Be ready!!! \n The INFINITY COMPILER HUB made by Ishaan Ray is coming up in your screen, go on with numerous compilers; Traveller!');
    window.open("https://infinitycompilerhub.netlify.app/", "_blank");
  } else if (command.includes("github")) {
    speak('Surely! Opening Github.');
      if (command.includes("profile")){
        window.open("https://github.com/Cipher-Shadow-IR/", "_blank");
      } else {
        window.open("https://github.com/", "_blank");
      }
  } else if (command.includes("mail")) {
    speak('Gotta Check Inbox? \n here you go!.');
    window.open("https://mail.google.com/mail/", "_blank");
  } else if (command.includes("notepad")) {
    speak('Want to make a Note? \n here you go! make sure to save the note lol!');
    window.open("https://www.rapidtables.com/tools/notepad.html", "_blank");
  } else if (command.startsWith("open ")) {
    const siteName = command.replace("open ", "").replace("website", "").trim();
    const searchURL = `https://${siteName.replace(/\s+/g, "")}.com`;
    
    // Try to open .com domain first
    fetch(searchURL).then((response) => {
      if (response.ok) {
        speak(`Opening ${siteName}.com...`);
        window.open(searchURL, "_blank");
      } else {
        // If .com doesn't work, fall back to Google search
        speak(`I couldn't find ${siteName}.com, so I'll search it on Google.`);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(siteName)}`, "_blank");
      }
    }).catch(() => {
      speak(`I couldn't find ${siteName}.com, so I'll search it on Google.`);
      window.open(`https://www.google.com/search?q=${encodeURIComponent(siteName)}`, "_blank");
    });
  }

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
  if (micWrapper.classList.contains("listening")) {
    stopListening();
  } else {
    startListening();
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

const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config(); // 👈 Load the .env file

const app = express();

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are IRIS, a helpful, smart voice assistant created by Ishaan Ray. Answer clearly and helpfully.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ✅ This helps the frontend test connection
app.get("/", (req, res) => {
  res.send("✅ IRIS AI backend is up and running!");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
