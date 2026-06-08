let handPose;
let video;
let hands = [];
let objects = [];
let score = 0;
let timer = 30;
let gameState = "START"; // START, PLAYING, END

function preload() {
  // 載入手勢辨識模型
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // 開始偵測手勢
  handPose.detectStart(video, results => {
    hands = results;
  });
}

function draw() {
  // 鏡像翻轉畫布，讓操作更直覺
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  
  // 恢復正常坐標系來繪製文字與物件
  push();
  scale(-1, 1);
  translate(-width, 0);

  if (gameState === "START") {
    drawOverlay("手勢切水果遊戲", "請舉起手準備，點擊畫面開始");
  } else if (gameState === "PLAYING") {
    playGame();
  } else if (gameState === "END") {
    drawOverlay("遊戲結束", `最終得分: ${score}\n點擊畫面重新開始`);
  }
  pop();
}

function playGame() {
  // 倒數計時
  if (frameCount % 60 === 0 && timer > 0) {
    timer--;
  }
  if (timer <= 0) {
    gameState = "END";
  }

  // 隨機產生水果或炸彈
  if (frameCount % 40 === 0) {
    let isBomb = random(1) < 0.2; // 20% 機率是炸彈
    objects.push(new GameObject(isBomb));
  }

  // 更新與繪製物件
  for (let i = objects.length - 1; i >= 0; i--) {
    objects[i].update();
    objects[i].display();

    // 檢查手勢碰撞
    if (hands.length > 0) {
      let finger = hands[0].index_finger_tip; // 使用食指指尖
      // 因為鏡像關係，x 座標需要轉換
      let fingerX = width - finger.x;
      let fingerY = finger.y;

      // 繪製指尖位置（刀鋒）
      fill(255, 255, 0);
      circle(fingerX, fingerY, 15);

      if (objects[i].checkSlice(fingerX, fingerY)) {
        if (objects[i].isBomb) {
          score = max(0, score - 1);
        } else {
          score++;
        }
        objects.splice(i, 1);
        continue;
      }
    }

    // 移除掉出畫面外的物件
    if (objects[i] && objects[i].y > height) {
      objects.splice(i, 1);
    }
  }

  // 顯示分數與時間
  fill(255);
  textSize(24);
  textAlign(LEFT);
  text(`得分: ${score}`, 20, 40);
  text(`時間: ${timer}s`, 20, 70);
}

function drawOverlay(title, sub) {
  fill(0, 150);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER);
  textSize(48);
  text(title, width / 2, height / 2 - 20);
  textSize(20);
  text(sub, width / 2, height / 2 + 40);
}

function mousePressed() {
  if (gameState !== "PLAYING") {
    score = 0;
    timer = 30;
    objects = [];
    gameState = "PLAYING";
  }
}

class GameObject {
  constructor(isBomb) {
    this.isBomb = isBomb;
    this.x = random(50, width - 50);
    this.y = height;
    this.size = 50;
    this.vy = random(-12, -18); // 向上噴射的速度
    this.vx = random(-2, 2);
    this.gravity = 0.4;
  }

  update() {
    this.y += this.vy;
    this.x += this.vx;
    this.vy += this.gravity;
  }

  display() {
    fill(this.isBomb ? color(255, 0, 0) : color(0, 255, 100));
    ellipse(this.x, this.y, this.size);
  }

  checkSlice(fx, fy) {
    let d = dist(fx, fy, this.x, this.y);
    return d < this.size / 2;
  }
}
