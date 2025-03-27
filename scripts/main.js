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
  const say = speak; // Alias for clarity

  const openInNewTab = (url, message) => {
    say(message);
    window.open(url, "_blank");
  };

  const lowerCommand = command.toLowerCase();

  if (lowerCommand.includes("youtube")) {
    openInNewTab("https://youtube.com", "Surely! Opening YouTube.");
  } 
  
  else if (lowerCommand.includes("time")) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    say(`The time in your region is ${time}`);
  } 
  
  else if (lowerCommand.includes("compiler")) {
    openInNewTab(
      "https://infinitycompilerhub.netlify.app/",
      "Ahhh! Be ready!!! \n The INFINITY COMPILER HUB made by Ishaan Ray is coming up on your screen. Go on with numerous compilers, Traveller!"
    );
  } 
  
  else if (lowerCommand.includes("github")) {
    if (lowerCommand.includes("profile")) {
      openInNewTab("https://github.com/Cipher-Shadow-IR/", "Surely! Opening your GitHub profile.");
    } else {
      openInNewTab("https://github.com/", "Surely! Opening GitHub.");
    }
  } 
  
  else if (lowerCommand.includes("mail")) {
    openInNewTab("https://mail.google.com/mail/", "Gotta check your inbox?\nHere you go!");
  } 
  
  else if (lowerCommand.includes("note")) {
    openInNewTab("https://www.rapidtables.com/tools/notepad.html", "Want to make a note?\nHere you go! Make sure to save it lol!");
  }

  else if (lowerCommand.startsWith("open ")) {
    const siteName = lowerCommand.replace("open", "").replace("website", "").trim();
    const formattedURL = `https://${siteName.replace(/\s+/g, "")}.com`;
    openInNewTab(formattedURL, `Opening ${siteName}...`);
  }

  else if (lowerCommand.startsWith("search for ")) {
    const query = lowerCommand.replace("search for ", "").trim();
    openInNewTab(`https://www.google.com/search?q=${encodeURIComponent(query)}`, `Searching Google for ${query}`);
  }

  else if (lowerCommand.startsWith("search on youtube for ")) {
    const query = lowerCommand.replace("search on youtube for ", "").trim();
    openInNewTab(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, `Searching YouTube for ${query}`);
  }

  else {
    say("Hmm... I didn't get that, but let me think...");
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
