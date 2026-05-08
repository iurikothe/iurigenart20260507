# Casey REAS — Pre-Process

| | |
|---|---|
| Token | `383000057` |
| Project ID | `383` |
| Contract | `0x99a9B7c1116f9ceEB1652de04d5969CcE509B069` |
| Contract flavor | GenArt721CoreV3 — Art Blocks Curated |
| Chain | ethereum |
| Script type | `p5@1.0.0` |
| Aspect ratio | 1.78 |
| Invocations | 120 |
| Project status | locked=False, complete=True, paused=False |
| Completed at | 2022-11-30T18:25:35+00:00 |
| Artist site | https://reas.com |

- **Generator**: <https://generator.artblocks.io/1/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/383000057>
- **Art Blocks page**: <https://www.artblocks.io/collection/0x99a9b7c1116f9ceeb1652de04d5969cce509b069-383>
- **Source retrieved**: 2026-05-07 via Hasura GraphQL → `projects_metadata.script` (no auth, public endpoint)

## Project description (artist statement)

> Ways of knowing...
> Ways of seeing…
> 
> I can trace the origin of *Pre-Process* back to a Saturday afternoon in 2003 when I was sketching—first on paper, and then with code. I began by drawing circles, then connecting their center points, and then placing the circles in motion as coded animation. At that time, I was focused on *ideas* and not *images*—specifically, on dynamic systems and the ways a set of elements relate to each other within an imagined environment. I was working through questions about how to experience these systems and what might be an ideal (or interesting) way to engage with them. 
> 
> The ideas and code from this session later became the core of much of my subsequent work: including the foundation for the *Process* series of software, prints, and installations and the more recent *Process Compendium* works. *Pre-Process* pulls these origin points back into focus, develops them with what I’ve learned in the intervening years, and puts them on the blockchain to be archived. I consider the project a Rosetta Stone for my practice. It asks fundamental questions about the relationships between process and end result, including: Where is the aesthetic focus of a generative system? Is it deep within the code or within the picture the system creates?
> 
> Ultimately, *Pre-Process* emphasizes experiencing the origin of the system and then transitioning with it as it seeks, but never finds, equilibrium. The system is built around Element 1, the first that I created for the *Process* series:
> 
> *Element 1: Form 1 + Behavior 1 + Behavior 2 + Behavior 3 + Behavior 4
> Form 1: Circle
> Behavior 1: Move in a straight line
> Behavior 2: Constrain to surface
> Behavior 3: Change direction while touching another Element
> Behavior 4: Move away from an overlapping Element*
> 
> *Pre-Process* is the origin of a long journey that I’m still on. It continues to ask essential questions and to encourage me to explore possibilities. Through it, I came to realize that I was ultimately more a picture-maker than a conceptual artist, or, the way I like to think about it,  I’m a “conceptual artist” with a small ‘c.’ I want the energy to be with the system (the ideas) *and* the surface (the picture) in equal measure. More directly, the work exists *between* the instructions, the performance and interpretation of the instructions, and the resulting images.

## Notes

Append-only — newest first. Hand-written observations from reading the source.

- Two `sfc32` PRNG instances seeded from halves of `tokenData.hash`, alternating between them per draw — heavier than a single PRNG but resilient against pattern bias.
- All sizes derive from `canvasEdge = dist(0, 0, width, height)` — fully resolution-agnostic; concretely `largestElement = canvasEdge * 0.06` etc.
- Trait derivation reads `mintNumber` (not the hash) for `surface`, `origin`, `growth` parameters. So the same hash on two different mint numbers will not look the same — interesting for AB.
- Live keys 1–8 swap the surface palette/style, `space` resets, `p` toggles `noLoop()` — clean interactivity model worth borrowing for our own pieces.
- `numCells = 100` agents that each push neighbours and rotate by `globalSpin = 0.0125` per collision — subtle but mesmerising swarm.

## Source

The full on-chain script, byte-for-byte. Together with `tokenData = { hash, tokenId }` and the declared library (if any) this reproduces the artwork deterministically.

```javascript
let seed = parseInt(tokenData.hash.slice(0, 16), 16);

let projectNumber = Math.floor(parseInt(tokenData.tokenId) / 1000000)
let mintNumber = parseInt(tokenData.tokenId) % 1000000;

let surface = 0;
let growth = 0;
let origin = 0;

let networkMode = 0;

let r;

let numToDisplay = 1;

let globalSpin = 0.0125;

let numCells = 100;
let cells = new Array(numCells);

let largestElement;
let smallestElement;
let canvasEdge;
let freeze = true;
let frame;

let drawCenter = true;
let drawPerimeter = true;
let drawAngle = true;
let fillCell = false;
let drawBackground = false;
let textOn = false;

let lineThickness = 0;

let elementColor;
let centerColor;
let angleColor;
let textColor;
let networkColor;
let grayNetworkColor;
let bgcolor;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  pixelDensity(displayDensity());
  frameRate(30);
  textFont('monospace');
  mintNumber += 1;
  surface = mintNumber % 8;
  origin = mintNumber % 3;
  growth = mintNumber % 5;
  if (surface == 0) { surface = 8; }
  if (origin == 0) { origin = 3 ; }
  if (growth == 0) { growth = 5; }
  totalReset();
}

function totalReset() {

  r = new RND();

  numToDisplay = 1;
  canvasEdge = dist(0, 0, width, height);
  if (width == height) {
    largestElement = canvasEdge * 0.055;
    smallestElement = canvasEdge * 0.008;
  } else {
    largestElement = canvasEdge * 0.06;
    smallestElement = canvasEdge * 0.008;
  }
  frame = canvasEdge / 40;

  lineThickness = map(canvasEdge, 2202, 4493, 1.0, 2.0);
  if (lineThickness < 1.0) {
    lineThickness = 1.0;
  }

  for (let i = 0; i < numCells; i++) {
    let ss = 0;
    if (growth == 1) {
      ss = map(i, 0, numCells, smallestElement, largestElement);
    } else if (growth == 2) {
      ss = map(i, 0, numCells, largestElement, smallestElement);
    } else if (growth == 3) {
      ss = map(i, 0, numCells, smallestElement * 4, smallestElement * 4);
    } else if (growth == 4) {
      ss = map(i, 0, numCells, largestElement * 0.8, largestElement * 0.8);
    } else if (growth == 5) {
      ss = map(i, 0, numCells, 0.0, 1.0);
      ss = pow(ss, 5);
      ss = map(ss, 0, 1, smallestElement, largestElement * 2);
    }
    let midX = 0;
    let midY = 0;
    if (origin == 1) {
      midX = width / 2;
      midY = height / 2;
    } else if (origin == 2) {
      midX = r.rb(frame, width - frame);
      midY = height / 2;
    } else if (origin == 3) {
      midX = r.rb(frame, width - frame);
      midY = r.rb(frame, height - frame);
    }
    let r1 = r.rb(0, TWO_PI);
    let r2 = r.rb(0, TWO_PI);
    cells[i] = new Cell(midX, midY, ss, i, cells, r1, r2);
  }

  setParameters();
  background(bgcolor);
}

function setParameters() {
  if (surface == 1) {
    networkMode = 0;
    textOn = false;
    drawCenter = true;
    drawPerimeter = true;
    fillCell = false;
    drawAngle = true;
    drawBackground = true;
    bgcolor = color(0);
    elementColor = color(153);
    centerColor = color(246);
    angleColor = color(127);
    networkColor = color(246);
  } else if (surface == 2) {
    networkMode = 0;
    textOn = false;
    drawCenter = true;
    drawPerimeter = true;
    fillCell = true;
    drawAngle = true;
    drawBackground = true;
    bgcolor = color(246);
    elementColor = color(127, 153);
    centerColor = color(102);
    angleColor = color(51);
    networkColor = color(0);
  } else if (surface == 3) {
    networkMode = 1;
    textOn = true;
    drawCenter = false;
    drawPerimeter = false;
    fillCell = false;
    drawAngle = false;
    drawBackground = true;
    bgcolor = color(0);
    elementColor = color(0);
    centerColor = color(246);
    textColor = color(246);
    grayNetworkColor = 127;
  } else if (surface == 4) {
    networkMode = 1;
    textOn = false;
    drawCenter = true;
    drawPerimeter = false;
    fillCell = false;
    drawAngle = false;
    drawBackground = true;
    bgcolor = color(0);
    elementColor = color(246);
    centerColor = color(127);
    grayNetworkColor = 246;
  } else if (surface == 5) {
    networkMode = 0;
    textOn = false;
    drawCenter = false;
    drawPerimeter = true;
    fillCell = true;
    drawAngle = true;
    drawBackground = true;
    bgcolor = color(153);
    elementColor = color(0);
    centerColor = color(246);
    textColor = color(246);
    networkColor = color(246);
    angleColor = color(127);
  } else if (surface == 6) {
    networkMode = 0;
    textOn = false;
    drawCenter = true;
    drawPerimeter = true;
    fillCell = false;
    drawAngle = false;
    drawBackground = false;
    bgcolor = color(0);
    elementColor = color(0, 51);
    centerColor = color(246, 102);
    networkColor = color(0, 51);
  } else if (surface == 7) {
    networkMode = 0;
    drawCenter = true;
    drawPerimeter = true;
    fillCell = false;
    drawAngle = false;
    drawBackground = false;
    bgcolor = color(246);
    elementColor = color(176, 51);
    centerColor = color(246, 102);
    networkColor = color(0, 51);
    textOn = false;
  } else if (surface == 8) {
    networkMode = 0;
    textOn = false;
    drawCenter = false;
    drawPerimeter = true;
    fillCell = false;
    drawAngle = false;
    drawBackground = false;
    bgcolor = color(246);
    elementColor = color(246, 51);
    networkColor = color(0, 51);
  }
}

function draw() {
  
  if (drawBackground) {
    background(bgcolor);
  }
  for (let i = 0; i < numToDisplay; i++) {
    cells[i].check();
  }
  for (let i = 0; i < numToDisplay; i++) {
    cells[i].display();
  }
  for (let i = 0; i < numToDisplay; i++) {
    cells[i].displayNetwork();
  }
  for (let i = 0; i < numToDisplay; i++) {
    cells[i].drawCenter();
  }
  if (numToDisplay < cells.length) {
    if (frameCount % 10 == 0) {
      numToDisplay++;
    }
  }
}

function mousePressed() {
  totalReset();
}

function keyPressed() {
  if (key == "1") {
    surface = 1;
    totalReset();
  } else if (key == "2") {
    surface = 2;
    totalReset();
  } else if (key == "3") {
    surface = 3;
    totalReset();
  } else if (key == "4") {
    surface = 4;
    totalReset();
  } else if (key == "5") {
    surface = 5;
    totalReset();
  } else if (key == "6") {
    surface = 6;
    totalReset();
  } else if (key == "7") {
    surface = 7;
    totalReset();
  } else if (key == "8") {
    surface = 8;
    totalReset();
  }

  if (key == ' ') {
    totalReset();
  }

  if (key == 'p' || key == 'P') {
    freeze = !freeze;
    if (freeze) {
      noLoop();
    } else {
      loop();
    }
  }
}

class Cell {
  constructor(xin, yin, rin, num, cells, a1, a2) {
    this.x = xin;
    this.newx = xin;
    this.y = yin;
    this.newy = yin;
    this.r = rin;
    this.id = num;
    this.others = cells;
    this.moveangle = a1;
    this.angle = a2;
    this.inc = 1.0;
    this.moveangle = 0;
    this.speed = map(canvasEdge, 400 * 400, 1920 * 1080, 0.5, 1.0);
    this.ds = canvasEdge / 150.0;
    this.friends = new Array(numCells);
    this.friendsAlpha = new Array(numCells);
    for (let i = 0; i < numCells; i++) {
      this.friends[i] = 0;
      this.friendsAlpha[i] = 0;
    }
    this.friendCount = 0;
    this.spinRate = globalSpin;
    this.cellwidth = this.r + this.r;
    this.cellheight = this.cellwidth;
  }

  move(ato, rto) {
    this.newx = this.newx + cos(ato) * rto;
    this.newy = this.newy + sin(ato) * rto;
  }

  check() {
    this.friendCount = 0;

    this.newx += cos(this.angle); 
    this.newy += sin(this.angle);

    if (this.newx < this.r + frame) {
      this.newx = this.r + frame;
    }
    if (this.newx > width - this.r - frame) {
      this.newx = width - this.r - frame;
    }
    if (this.newy < this.r + frame) {
      this.newy = this.r + frame;
    }
    if (this.newy > height - this.r - frame) {
      this.newy = height - this.r - frame;
    }

    this.x += (this.newx - this.x) / 10.0;
    this.y += (this.newy - this.y) / 10.0;

    for (let i = this.id + 1; i < numToDisplay; i++) {
      let dx = this.others[i].newx - this.newx;
      let dy = this.others[i].newy - this.newy;
      let distance = dist(this.x, this.y, this.others[i].x, this.others[i].y);
      if (distance < this.cellwidth / 2 + this.others[i].cellwidth / 2 - 1) {
        this.friends[this.friendCount] = i;
        this.friendCount++;
        let rA = atan2(dy, dx);
        this.others[i].move(rA, this.inc);
        this.others[i].angle += this.spinRate;
        this.move(rA + PI, this.inc);
        this.angle += this.spinRate;
      }
    }
  }

  drawCenter() {
    if (textOn) {
      noStroke();
      fill(textColor);
      textSize(canvasEdge / 100);
      text(this.id, this.x, this.y);
    } else if (drawCenter) {
      noStroke();
      fill(centerColor);
      ellipse(this.x, this.y, this.ds / 2, this.ds / 2);
    }
  }

  drawAngle() {
    strokeWeight(lineThickness);
    let ax = this.x + cos(this.angle) * (this.r - this.ds / 2);
    let ay = this.y + sin(this.angle) * (this.r - this.ds / 2);
    noStroke();
    fill(angleColor);
    ellipse(ax, ay, this.ds / 2, this.ds / 2);
  }

  drawPerimeter() {
    if (fillCell == true) {
      noStroke();
      fill(elementColor);
      ellipse(this.x, this.y, this.cellwidth, this.cellheight);
    } else {
      strokeWeight(lineThickness);
      noFill();
      stroke(elementColor);
      ellipse(this.x, this.y, this.cellwidth, this.cellheight);
    }
  }

  display() {
    if (drawPerimeter) {
      this.drawPerimeter();
    }
    if (drawAngle) {
      this.drawAngle();
    }
  }

  displayNetwork() {
    strokeWeight(lineThickness);
    for (let i = 0; i < this.friendCount; i++) {
      if (networkMode == 0) {
        beginShape(LINES);
        stroke(networkColor);
        vertex(this.x, this.y);
        vertex(this.others[this.friends[i]].x, this.others[this.friends[i]].y);
        endShape();
      } else {
        this.friendsAlpha[this.friends[i]] += 5;
      }
    }
    if (networkMode == 1) {
      for (let i = 0; i < numToDisplay; i++) {
        if (this.friendsAlpha[i] > 1.0) {
          beginShape(LINES);
          stroke(grayNetworkColor, this.friendsAlpha[i]);
          vertex(this.x, this.y);
          vertex(this.others[i].x, this.others[i].y);
          endShape();
          this.friendsAlpha[i] -= 2.0;
        }
      }
    }
  }
}

class RND {
  constructor() {
    this.useA = false;
    let sfc32 = function (uint128Hex) {
      let a = parseInt(uint128Hex.substr(0, 8), 16);
      let b = parseInt(uint128Hex.substr(8, 8), 16);
      let c = parseInt(uint128Hex.substr(16, 8), 16);
      let d = parseInt(uint128Hex.substr(24, 8), 16);
      return function () {
        a |= 0; b |= 0; c |= 0; d |= 0;
        let t = (((a + b) | 0) + d) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
      };
    };
    this.prngA = new sfc32(tokenData.hash.substr(2, 32));
    this.prngB = new sfc32(tokenData.hash.substr(34, 32));
    for (let i = 0; i < 1e6; i += 2) {
      this.prngA();
      this.prngB();
    }
  }
  random_dec() {
    this.useA = !this.useA;
    return this.useA ? this.prngA() : this.prngB();
  }
  rb(a, b) {
    return a + (b - a) * this.random_dec();
  }
}
```
