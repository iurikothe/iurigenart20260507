// iurigenart20260507 — starter sketch
//
// Three rules baked in:
//   1. Responsive   — sized in relative units; windowResized() rescales cleanly.
//   2. Animated     — draw() loops; particles drift each frame.
//   3. Interactive  — keyPressed() handles space / r / f.  Keyboard effects
//                     layer on top of the deterministic seed; the thumbnail
//                     captured by ArtBlocks is the seed-only state, so keys
//                     never change what gets minted, only the live experience.
//
// All randomness comes from the seeded `rng` (defined in lib/random.js), which
// in turn is fed by tokenData.hash.  No Math.random / Date.now / setTimeout.

let rng;
let particles = [];
let palette;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rng = new Random();

  const palettes = [
    ["#0a0a0a", "#fefefe", "#ff5e5b", "#d8d8d8", "#ffed66"],
    ["#1f1f3a", "#aef9d6", "#ffaad8", "#7c5e99", "#fefefe"],
    ["#101820", "#fee715", "#ffffff", "#ff6f3c", "#3a86ff"],
    ["#0d1b2a", "#778da9", "#e0e1dd", "#415a77", "#cdb4db"],
  ];
  const paletteIndex = rng.random_int(0, palettes.length - 1);
  palette = palettes[paletteIndex];

  const count = rng.random_int(80, 220);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: rng.random_dec(),
      y: rng.random_dec(),
      angle: rng.random_num(0, TWO_PI),
      speed: rng.random_num(0.0005, 0.0030),
      size: rng.random_num(0.002, 0.012),
      hue: rng.random_int(1, palette.length - 1),
    });
  }

  window.$features = {
    palette_index: paletteIndex,
    particle_count: count,
  };
}

function draw() {
  background(palette[0]);
  noStroke();
  const minDim = Math.min(width, height);
  for (const p of particles) {
    p.x += Math.cos(p.angle + frameCount * 0.005) * p.speed;
    p.y += Math.sin(p.angle + frameCount * 0.005) * p.speed;
    if (p.x < 0) p.x += 1;
    if (p.x > 1) p.x -= 1;
    if (p.y < 0) p.y += 1;
    if (p.y > 1) p.y -= 1;
    fill(palette[p.hue]);
    circle(p.x * width, p.y * height, p.size * minDim);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === " ") {
    if (isLooping()) noLoop();
    else loop();
  } else if (key === "r" || key === "R") {
    for (const p of particles) {
      p.angle = rng.random_num(0, TWO_PI);
    }
  } else if (key === "f" || key === "F") {
    fullscreen(!fullscreen());
  }
}
