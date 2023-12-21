// Xhabarabot - Typex 2.0
// Created by Rully Shabara

let sounds = {};
let lengthSlider;
let sequence = [];
let reverb;
let delay;
let delaySlider;
let lfo;
let lfoSlider;
let currentSequenceIndex = 0;
let isPlaying = false;
let reverbButton;
let playSeqButton;
let reverbActive = false;
let drawings = [];
let oscillatorActive = false;
let oscButton;
let osc;
let recorder, soundFile, blob;
let compressor;
let hasTyped = false;
let saveButtonState = "STOP & SAVE";

let buttons = [
  {
    x: 370,
    y: 55,
    w: 110,
    h: 30,
    color: "red",
    label: "DO NOT CLICK!!",
    action: doNotPress,
  },
  {
    x: 320,
    y: 55,
    w: 45,
    h: 30,
    color: "#285164",
    label: "Undo",
    action: undoLastStep,
  },
  {
    x: 320,
    y: 20,
    w: 45,
    h: 30,
    color: "#607D8B",
    label: "Reset",
    action: clearSequence,
  },
  {
    x: 485,
    y: 55,
    w: 40,
    h: 30,
    color: "rgb(15,15,15)",
    label: "OSC",
    action: toggleOscillator,
  },
  {
    x: 370,
    y: 20,
    w: 110,
    h: 30,
    color: "rgb(17,17,17)",
    label: "PLAY SEQUENCE",
    action: toggleSequence,
    active: false,
  },
  {
    x: 485,
    y: 20,
    w: 95,
    h: 30,
    color: "rgb(255,0,0)",
    label: "STOP & SAVE",
    action: stopAndSave,
  },
];

let letterFrequencies = {
  KeyA: 440.0, // A4
  KeyB: 493.88, // B4
  KeyC: 261.63, // C4
  KeyD: 293.66, // D4
  KeyE: 329.63, // E4
  KeyF: 349.23, // F4
  KeyG: 392.0, // G4
  KeyH: 440.0, // A5
  KeyI: 493.88, // B5
  KeyJ: 523.25, // C5
  KeyK: 587.33, // D5
  KeyL: 659.26, // E5
  KeyM: 698.46, // F5
  KeyN: 783.99, // G5
  KeyO: 880.0, // A6
  KeyP: 987.77, // B6
  KeyQ: 1046.5, // C6
  KeyR: 1174.66, // D6
  KeyS: 1318.51, // E6
  KeyT: 1396.91, // F6
  KeyU: 1567.98, // G6
  KeyV: 1760.0, // A7
  KeyW: 1975.53, // B7
  KeyX: 2093.0, // C7
  KeyY: 2349.32, // D7
  KeyZ: 2637.02, // E7
};

function preload() {
  sounds["KeyA"] = loadSound("a.wav");
  sounds["KeyB"] = loadSound("b.mp3");
  sounds["KeyC"] = loadSound("c.mp3");
  sounds["KeyD"] = loadSound("d.mp3");
  sounds["KeyE"] = loadSound("e.wav");
  sounds["KeyF"] = loadSound("f.mp3");
  sounds["KeyG"] = loadSound("g.wav");
  sounds["KeyH"] = loadSound("h.mp3");
  sounds["KeyI"] = loadSound("i.mp3");
  sounds["KeyJ"] = loadSound("j.wav");
  sounds["KeyK"] = loadSound("k.mp3");
  sounds["KeyL"] = loadSound("l.mp3");
  sounds["KeyM"] = loadSound("m.wav");
  sounds["KeyN"] = loadSound("n.wav");
  sounds["KeyO"] = loadSound("o.mp3");
  sounds["KeyP"] = loadSound("p.mp3");
  sounds["KeyQ"] = loadSound("q.mp3");
  sounds["KeyR"] = loadSound("r.mp3");
  sounds["KeyS"] = loadSound("s.mp3");
  sounds["KeyT"] = loadSound("t.mp3");
  sounds["KeyU"] = loadSound("u.mp3");
  sounds["KeyV"] = loadSound("v.mp3");
  sounds["KeyW"] = loadSound("w.mp3");
  sounds["KeyX"] = loadSound("x.mp3");
  sounds["KeyY"] = loadSound("y.mp3");
  sounds["KeyZ"] = loadSound("z.mp3");

  sounds["Forbidden1"] = loadSound("forbidden1.mp3");
  sounds["Forbidden2"] = loadSound("forbidden2.mp3");
  sounds["Forbidden3"] = loadSound("forbidden3.mp3");
  sounds["Forbidden4"] = loadSound("forbidden4.mp3");
  sounds["Forbidden5"] = loadSound("forbidden5.mp3");
}

function setup() {
  createCanvas(960, 400);
  synth = new p5.PolySynth();

  reverb = new p5.Reverb();
  delay = new p5.Delay();
  lfo = new p5.Oscillator("sine");

  recorder = new p5.SoundRecorder();
  recorder.setInput(); 
  soundFile = new p5.SoundFile();

  lengthSlider = createSlider(0.1, 0.5, 0.2, 0.01);
  lengthSlider.position(75, 40);

  delaySlider = createSlider(0, 0.5, 0, 0.01);
  delaySlider.position(700, 20);

  osc = new p5.Oscillator("sine");

  lfoSlider = createSlider(0.1, 50, 1, 0.1);
  lfoSlider.position(700, 55);
  
  let refreshButton = createButton('Refresh Page');
  refreshButton.position(10, height + 10); 
  refreshButton.mousePressed(() => window.location.reload());
}

function undoLastStep() {
  if (sequence.length > 0) {
    sequence.pop();
    drawings.pop();
  }

  const audioContext = getAudioContext();
  compressor = audioContext.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-50, audioContext.currentTime);
  compressor.knee.setValueAtTime(40, audioContext.currentTime);
  compressor.ratio.setValueAtTime(12, audioContext.currentTime);
  compressor.attack.setValueAtTime(0, audioContext.currentTime);
  compressor.release.setValueAtTime(0.25, audioContext.currentTime);

  // Connect the compressor
  compressor.connect(audioContext.destination);
}

function clearSequence() {
  isPlaying = false;
  sequence = [];
  currentSequenceIndex = 0;
  for (let key in sounds) {
    sounds[key].stop();
  }
  background(255);
  drawings = [];
}

function draw() {
  background(255);

  if (!hasTyped) {
    fill(180);
    textSize(30);
    text("TYPE LETTERS HERE...", 80, 200);
  }

  let saveButton = buttons.find(
    (btn) =>
      btn.label.startsWith("STOP & SAVE") || btn.label.startsWith("DOWNLOADED")
  );
  if (saveButton) {
    saveButton.label = saveButtonState;
  }

  buttons.forEach((btn) => {
    fill(btn.active ? "#607D8B" : btn.color);
    rect(btn.x, btn.y, btn.w, btn.h);
    fill(255);
    textSize(12);
    text(btn.label, btn.x + 5, btn.y + 20);

    fill("black");
    text("SOUND LENGTH", 70, 85);

    // Label for delay slider
    fill("black");
    text("DELAY:", 635, 37);

    
    fill("black");
    text("LFO:", 635, 73);
  });

  let rowHeight = 20;
  let rightmostX = 900;
  let dotsPerRow = Math.floor((rightmostX - 40) / 20);

  for (let i = 0; i < sequence.length; i++) {
    let row = Math.floor(i / dotsPerRow);
    let column = i % dotsPerRow;
    let y = 150 + row * rowHeight;
    let x = 80 + column * 20;

    if (x < rightmostX) {
      fill(i === currentSequenceIndex ? "red" : "rgb(26,26,26)");
      noStroke();
      ellipse(x, y, 10, 10);
    }
  }
}

function mousePressed() {
  buttons.forEach((btn) => {
    if (
      mouseX > btn.x &&
      mouseX < btn.x + btn.w &&
      mouseY > btn.y &&
      mouseY < btn.y + btn.h
    ) {
      btn.action();
    }
  });
}

function keyPressed() {
  hasTyped = true;

  let keyName;
  if (keyCode === 32) {
    keyName = "KeySpace";
  } else {
    keyName = "Key" + String.fromCharCode(keyCode);
  }
  sequence.push(keyName);
  playSound(keyName);
}

function keyReleased() {
  background(255);
}

function playSound(keyName) {
  if (keyName === "KeySpace") return;

  let soundLength = lengthSlider.value();
  let delayTime = delaySlider.value();

  // Connect sounds to the compressor
  if (sounds[keyName]) {
    let pan = map(mouseX, 0, width, -1, 1);

    sounds[keyName].disconnect(); 
    sounds[keyName].connect(compressor); 
    sounds[keyName].pan(pan);
    sounds[keyName].play(0, 1, 1, 0, soundLength);
    delay.process(sounds[keyName], delayTime, 0.3, 2300);
  }

  
  if (letterFrequencies[keyName] && oscillatorActive) {
    osc.disconnect(); 
    osc.connect(compressor); 

    osc.stop();
    let freq = letterFrequencies[keyName];
    osc.freq(freq);
    osc.amp(0.05);
    osc.start();
    setTimeout(() => osc.stop(), soundLength * 1000);

    delay.process(osc, delayTime, 0.5, 2300);
    reverb.process(osc, 2, 2);
  }

  // Connect the recorder to the compressor instead of master output
  recorder.setInput(compressor);

  if (isPlaying) {
    recorder.record(soundFile);
  }
}

function toggleOscillator() {
  oscillatorActive = !oscillatorActive;
  let oscButton = buttons.find((btn) => btn.label === "OSC");
  if (oscillatorActive) {
    oscButton.color = "#1E33A5";
    osc.start();
  } else {
    oscButton.color = "rgb(15,15,15)";
    osc.stop();
  }
}

function startRecording(audioStream) {
  mediaRecorder = new MediaRecorder(audioStream);
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    let audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    let audioUrl = URL.createObjectURL(audioBlob);
  };

  mediaRecorder.start();
}

function toggleSequence() {
  let sequenceButton = buttons.find((btn) => btn.label === "PLAY SEQUENCE");

  if (isPlaying) {
    isPlaying = false;
    sequenceButton.active = false;
    recorder.stop(); // Stop recording
    saveButtonState = "STOP & SAVE";
    saveSound(soundFile, "Xhabarabot_Typex2_Sequence.wav"); 
  } else {
    isPlaying = true;
    sequenceButton.active = true;

    // Connect the recorder to the compressor instead of master output
    recorder.setInput(compressor);

    recorder.record(soundFile); 
    playSequence();
  }
}

function playSequence() {
  if (!isPlaying) return;

  let soundLength = lengthSlider.value();
  let delayTime = delaySlider.value();
  let lfoFrequency = lfoSlider.value();

  lfo.freq(lfoFrequency);
  lfo.start();

  let keyName = sequence[currentSequenceIndex];
  playSound(keyName);
  if (drawings[currentSequenceIndex]) {
    drawings[currentSequenceIndex]();
  }

  currentSequenceIndex++;
  if (currentSequenceIndex >= sequence.length) {
    currentSequenceIndex = 0;
  }

  setTimeout(() => {
    background(255);
    playSequence();
  }, soundLength * 1000);
}

function doNotPress() {
  background(random(255), random(255), random(255));
  fill(0);
  textSize(32);
  text("FUCK YOU DON'T LISTEN!", width / 4, height / 2);
  synth.play(random(1000), 0.1, 0, 0.5);

  let forbiddenSoundIndex = Math.floor(random(1, 6));
  let forbiddenSoundName = "Forbidden" + forbiddenSoundIndex;
  let sound = sounds[forbiddenSoundName];

  sound.pan(random(-1, 1));
  sound.rate(random(0.5, 1.5));
  delay.process(sound, random(0.2, 0.5), random(0.3, 0.7), 2300);

  sound.setVolume(1);
  sound.play();
}

function windowResized() {
  resizeCanvas(1100, 400);
}

function stopAndSave() {
  let sequenceButton = buttons.find((btn) => btn.label === "PLAY SEQUENCE");
  if (saveButtonState === "STOP & SAVE") {
    isPlaying = false;
    sequenceButton.active = false;
    recorder.stop();
    saveSoundFile(); 
    saveButtonState = "DOWNLOADED";
  } else if (saveButtonState === "DOWNLOAD") {
    saveButtonState = "STOP & SAVE";
  }
}

function saveSoundFile() {
  soundFile.save("Xhabarabot_Typex2_Sequence.wav");
}



