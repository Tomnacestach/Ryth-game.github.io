const lanes = {
  Q: document.getElementById('laneQ'),
  W: document.getElementById('laneW'),
  E: document.getElementById('laneE'),
  R: document.getElementById('laneR')
};

const noteSpeed = 3; // pixely za frame
let notes = [];
let score = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  osc.stop(audioCtx.currentTime + 0.3);
}

function createNote(key) {
  const note = document.createElement('div');
  note.classList.add('note');
  note.textContent = key;
  note.style.top = '-30px';
  lanes[key].appendChild(note);
  notes.push({ el: note, key: key, y: -30, hit: false });
}

function updateNotes() {
  for (let i = notes.length - 1; i >= 0; i--) {
    let note = notes[i];
    note.y += noteSpeed;
    note.el.style.top = note.y + 'px';

    if (note.y > 570 && !note.hit) {
      notes.splice(i, 1);
      note.el.remove();
    }
  }
}

function handleKey(key) {
  const laneNotes = notes.filter(n => n.key === key && !n.hit);
  if (laneNotes.length === 0) return false;
  const note = laneNotes.reduce((prev, curr) => (curr.y > prev.y ? curr : prev));

  if (note.y >= 540 && note.y <= 600) {
    note.hit = true;
    score += 10;
    document.getElementById('scoreboard').textContent = `Score: ${score}`;
    note.el.style.background = '#0f0';
    setTimeout(() => note.el.remove(), 100);
    playTone(getFreqForKey(key));
    return true;
  }
  return false;
}

function getFreqForKey(key) {
  switch (key) {
    case 'Q': return 261.63; // C4
    case 'W': return 293.66; // D4
    case 'E': return 329.63; // E4
    case 'R': return 349.23; // F4
    default: return 440;
  }
}

window.addEventListener('keydown', e => {
  const key = e.key.toUpperCase();
  if (['Q','W','E','R'].includes(key)) {
    handleKey(key);
  }
});

const pattern = [
  { time: 500, key: 'Q' },
  { time: 1000, key: 'W' },
  { time: 1500, key: 'E' },
  { time: 2000, key: 'R' },
  { time: 2500, key: 'Q' },
  { time: 3000, key: 'E' },
  { time: 3500, key: 'W' },
  { time: 4000, key: 'R' },
];

let startTime = null;
function gameLoop(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;

  while (pattern.length && elapsed > pattern[0].time) {
    const note = pattern.shift();
    createNote(note.key);
  }

  updateNotes();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// Audio play/pause button
const bgMusic = document.getElementById('bgMusic');
const playPauseBtn = document.getElementById('playPauseBtn');

playPauseBtn.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    playPauseBtn.textContent = "Pauza";
  } else {
    bgMusic.pause();
    playPauseBtn.textContent = "Přehrát";
  }
});
