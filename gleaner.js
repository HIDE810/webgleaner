class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 290;
    this.y = 270;
    this.r = 8;
    this.color = "greenyellow";
    this.speed = 3;

    this.ArrowUp = this.ArrowDown = this.ArrowRight = this.ArrowLeft = false;
  }

  draw() {
    this.canvas.beginPath();
    this.canvas.fillStyle = this.color;
    this.canvas.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    this.canvas.closePath();
    this.canvas.fill();
  }

  move() {
    if(this.ArrowUp && this.y-(this.r+this.speed)>=0 && road(this.x, this.y-(this.r+this.speed))){this.y -= this.speed;}
    if(this.ArrowDown && this.y+(this.r+this.speed)<=CANVAS.height && road(this.x, this.y+(this.r+this.speed))){this.y += this.speed;}
    if(this.ArrowRight && this.x+(this.r+this.speed)<=CANVAS.width && road(this.x+(this.r+this.speed), this.y)){this.x += this.speed;}
    if(this.ArrowLeft && this.x-(this.r+this.speed)>=0 && road(this.x-(this.r+this.speed), this.y)){this.x -= this.speed;}
  }
}

class Enemy {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 10;
    this.y = 10;
    this.r = 8;
    this.cnt = 0;
    this.delay = 10;
    this.color = "red";

    this.bfsArray = [];
    this.walkQueue = [];
    this.tmpMap = [];
  }

  draw() {
    this.canvas.beginPath();
    this.canvas.fillStyle = this.color;
    this.canvas.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    this.canvas.closePath();
    this.canvas.fill();
  }

  addArray(x, y, wc, back) {
    if(x >= 0 && x < 29 && y >= 0 && y < 14 && this.tmpMap[y][x] == 0) {
      this.tmpMap[y][x] = 1;
      let tmp = new walk();
      tmp.x = x;
      tmp.y = y;
      tmp.walk_count = wc;
      tmp.back = back;
      this.bfsArray.push(tmp);
    }
  }

  findPath(x, y) {
    this.tmpMap = JSON.parse(JSON.stringify(map));
    this.bfsArray.length = 0;
    let tmp = new walk();
    tmp.x = Math.floor(this.x/20);
    tmp.y = Math.floor(this.y/20);
    tmp.walk_count = 0;
    tmp.back = -1;
    this.bfsArray.push(tmp);

    for(let i = 0; i < this.bfsArray.length; i++) {
      if(this.bfsArray[i].x == Math.floor(x/20) && this.bfsArray[i].y == Math.floor(y/20)) {
        this.walkQueue.length = 0;
        let tmp2 = new target();

        while(this.bfsArray[i].walk_count != 0) {
          tmp2.x = this.bfsArray[i].x;
          tmp2.y = this.bfsArray[i].y;
          this.walkQueue.push(tmp2);
          i = this.bfsArray[i].back;
        }

        break;
      }

      this.addArray(this.bfsArray[i].x, this.bfsArray[i].y+1, this.bfsArray[i].walk_count+1, i);
      this.addArray(this.bfsArray[i].x, this.bfsArray[i].y-1, this.bfsArray[i].walk_count+1, i);
      this.addArray(this.bfsArray[i].x+1, this.bfsArray[i].y, this.bfsArray[i].walk_count+1, i);
      this.addArray(this.bfsArray[i].x-1, this.bfsArray[i].y, this.bfsArray[i].walk_count+1, i);
    }

    this.bfsArray.length = 0;
  }

  move(x, y) {
    if(this.cnt == this.delay) {
      this.findPath(x, y);
      if(this.walkQueue.length != 0) {
        feedMap[Math.floor(this.y/20)][Math.floor(this.x/20)] = 1;
        this.x = this.walkQueue.slice(-1)[0].x * 20 + 10;
        this.y = this.walkQueue.slice(-1)[0].y * 20 + 10;
        this.walkQueue.shift();
      }

      this.cnt = 0;
      
    }

    else this.cnt++;
  }
}

class Feed {
  constructor(canvas) {
    this.canvas = canvas;
    this.r = 3;
    this.color = "yellow";
  }

  draw() {
    for(let i=0; i<feedMap.length; i++) {
      for(let j=0; j<feedMap[i].length; j++) {
        if(feedMap[i][j] == 1) {
          this.canvas.beginPath();
          this.canvas.fillStyle = this.color;
          this.canvas.arc(j * 20 + 10, i * 20 + 10, this.r, 0, 2 * Math.PI);
          this.canvas.closePath();
          this.canvas.fill();
        }
      }
    }
  }
}

let score = 0;
let feedMap = Array(14).fill().map(() => Array(29).fill(0));

const FRAME_RATE = 50;
const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");
const PLAYER = new Player(CTX);
const ENEMY = new Enemy(CTX);
const FEED = new Feed(CTX);

let interval = window.setInterval(update,1000/FRAME_RATE);

window.addEventListener("keydown",keydown);
window.addEventListener("keyup",keyup);

function update() {
  for(let i=0; i<map.length; i++) {
    for(let j=0; j<map[i].length; j++) {
      CTX.fillStyle = map[i][j] ? "gray": "black";
      CTX.fillRect(j * 20, i * 20, 20, 20);
    }
  }

  FEED.draw();

  PLAYER.draw();
  PLAYER.move();

  ENEMY.draw();
  ENEMY.move(PLAYER.x, PLAYER.y);

  if(coord(PLAYER.x) == coord(ENEMY.x) && coord(PLAYER.y) == coord(ENEMY.y)) {
    clearInterval(interval);
    document.getElementById('gameset').innerHTML = "GAME OVER!!";
  }
}

function keydown(event){
  if(event.keyCode==38){PLAYER.ArrowUp=true;}
  if(event.keyCode==40){PLAYER.ArrowDown=true;}
  if(event.keyCode==39){PLAYER.ArrowRight=true;}
  if(event.keyCode==37){PLAYER.ArrowLeft=true;}
}

function keyup(event){
  if(event.keyCode==38){PLAYER.ArrowUp=false;}
  if(event.keyCode==40){PLAYER.ArrowDown=false;}
  if(event.keyCode==39){PLAYER.ArrowRight=false;}
  if(event.keyCode==37){PLAYER.ArrowLeft=false;}
}

function road(x, y) {
  let data = CTX.getImageData(x, y, 1, 1).data[0];
  let feedData = CTX.getImageData(coord(x), coord(y), 1, 1).data;

  if(feedData[0] == 255 && feedData[1] == 255 && feedData[2] == 0) {
    feedMap[Math.floor(y/20)][Math.floor(x/20)] = 0;
    document.getElementById('score').innerHTML = ++score;

    if(ENEMY.delay > 0 && score % 20 == 0) {
        ENEMY.delay--;
        ENEMY.cnt = 0;
    }
  }

  return data != 128;
}

function walk() {
  this.walk_count;
  this.x;
  this.y;
  this.back;
}

function target() {
  this.x;
  this.y;
}

function coord(x) {
  return Math.floor(x/20) * 20 + 10;
}

const map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]