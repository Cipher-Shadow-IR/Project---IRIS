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

// 🔧 Command registry: map of keywords -> action
const commands = [
  {
    keywords: ["youtube"],
    action: () => {
      speak("Surely! Opening YouTube.");
      window.open("https://youtube.com", "_blank");
    }
  },
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
    keywords: ["note", "notepad"],
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
      const site = command.replace("open", "").replace("website", "").trim();
      const url = `https://${site.replace(/\s+/g, "")}.com`;
      speak(`Opening ${site}...`);
      window.open(url, "_blank");
    }
  }
];

function handleCommand(command) {
  const matched = commands.find(c => c.keywords.some(k => command.includes(k)));

  if (matched) {
    matched.action(command); // Pass command in case handler needs it
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
