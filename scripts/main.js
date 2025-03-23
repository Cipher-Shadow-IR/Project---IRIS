const output = document.getElementById("output");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

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
    window.open("https://youtube.com", "_blank");
  } else if (command.includes("time")) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    speak("The time is " + time);
  } else if (command.includes("compiler")) {
    window.open("https://infinitycompilerhub.netlify.app/", "_blank");
  } else if (command.includes("github")) {
      if (command.includes("profile")){
        window.open("https://github.com/Cipher-Shadow-IR/", "_blank");
      } else {
        window.open("https://github.com/", "_blank");
      }
  } else if (command.includes("mail")) {
    window.open("https://mail.google.com/mail/", "_blank");
  } else if (command.includes("note")) {
    window.open("https://www.rapidtables.com/tools/notepad.html", "_blank");
  } else {
    speak("Sorry, I didn't get that.");
  }
}

function speak(message) {
  const speech = new SpeechSynthesisUtterance();
  speech.text = message;
  window.speechSynthesis.speak(speech);
}
