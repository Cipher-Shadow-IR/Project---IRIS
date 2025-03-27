// ... (Keep previous constants and speech recognition setup)

// Enhanced Background Animation
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
let particles = [];
const PARTICLE_COUNT = 150;
const MAX_RADIUS = 4;
const COLOR_PALETTE = ['#00ffff', '#0fffcf', '#ff00ff', '#00ff87'];

// Particle class for background effects
class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = initial ? Math.random() * canvas.width : -MAX_RADIUS;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * MAX_RADIUS;
    this.vx = (Math.random() * 2) + (analyser ? dataArray[10]/50 : 1);
    this.vy = (Math.random() - 0.5) * 0.5;
    this.color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    this.alpha = Math.random() * 0.5 + 0.3;
    this.life = 1;
  }

  update() {
    if (this.life > 0) {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= 0.002;
      
      if (this.x > canvas.width + MAX_RADIUS) this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * this.life, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0, 
      this.x, this.y, this.radius * this.life
    );
    gradient.addColorStop(0, `${this.color}${Math.floor(this.alpha * 255).toString(16)}`);
    gradient.addColorStop(1, `${this.color}00`);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

// Initialize particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

// Dynamic Gradient Background
function createGradient() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#001119');
  gradient.addColorStop(1, '#000a0f');
  return gradient;
}

// Enhanced Audio Visualization
function visualizePitch() {
  ctx.fillStyle = createGradient();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  analyser.getByteFrequencyData(dataArray);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Main frequency circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 80 + (dataArray[20]/2), 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
  gradient.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Frequency bars
  const barWidth = canvas.width / bufferLength;
  ctx.save();
  ctx.translate(0, canvas.height / 2);
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] * 2;
    const gradient = ctx.createLinearGradient(i * barWidth, 0, i * barWidth, barHeight);
    gradient.addColorStop(0, `hsl(${(i * 360)/bufferLength}, 100%, 50%)`);
    gradient.addColorStop(1, `hsl(${(i * 360)/bufferLength}, 100%, 20%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(i * barWidth, -barHeight/2, barWidth-2, barHeight);
  }
  ctx.restore();

  // Particle system
  particles.forEach(p => {
    p.vx = (Math.random() * 2) + (dataArray[10]/50);
    p.update();
    p.draw();
  });

  // Rotating geometric shapes
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(Date.now() * 0.0005);
  ctx.strokeStyle = `rgba(0, 255, 255, ${dataArray[30]/255})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = Math.cos(angle) * (80 + dataArray[i*4]);
    const y = Math.sin(angle) * (80 + dataArray[i*4]);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  requestAnimationFrame(visualizePitch);
}

// Enhanced Toggle Listening with Visual Feedback
function toggleListening() {
  if (micWrapper.classList.contains("listening")) {
    recognition.stop();
    speak("Standing by");
    audioCtx.suspend();
    wave1.style.opacity = wave2.style.opacity = "0";
  } else {
    listenBtn.innerHTML = "🛑";
    recognition.start();
    audioCtx.resume();
    wave1.style.opacity = wave2.style.opacity = "1";

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        visualizePitch();
        
        // Add initial visual burst
        particles.forEach(p => p.reset());
        ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, 100, 0, Math.PI * 2);
        ctx.fill();
      });
  }
}

// Handle window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles.forEach(p => p.reset(true));
});

// Initialize canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Start with subtle animation
ctx.fillStyle = createGradient();
ctx.fillRect(0, 0, canvas.width, canvas.height);
