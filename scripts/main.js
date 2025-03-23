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
  } else if (command.includes("note")) {
    speak('Want to make a Note? \n here you go! make sure to save the note lol!');
    window.open("https://www.rapidtables.com/tools/notepad.html", "_blank");
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
  const response = await fetch("http://localhost:5000/ask", {
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


